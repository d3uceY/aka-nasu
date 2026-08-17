// Package notify fires native OS notifications when a timer phase completes.
//
// It wraps the Wails v3 notifications service (github.com/wailsapp/wails/v3/
// pkg/services/notifications) so the underlying Windows renderer — wintoast,
// the git.sr.ht/~jackmordaunt/go-toast/v2 renderer — can never stall or crash
// the app. That library is thread-affine (COM apartments + a blocking
// PowerShell fallback), so firing it synchronously on the Wails call path at
// the exact moment a phase completes is what previously turned the webview
// white. Here every send is:
//
//  1. queued to a single worker goroutine and returns immediately, so the
//     frontend promise resolves instantly and never blocks the UI;
//  2. serialized on one OS-locked thread, so the toast COM apartment is
//     stable across sends;
//  3. wrapped in a recover, so a panic inside the toast library is contained
//     and logged instead of taking the whole process down.
//
// Sends are best-effort: a failure to show a toast is logged and dropped.
package notify

import (
	"context"
	"fmt"
	"log"
	"runtime"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/services/notifications"
)

// Service exposes a single non-blocking Send(title, body) to the frontend.
type Service struct {
	wails *notifications.NotificationService

	reqs chan sendRequest // pending toasts (bounded)
	stop chan struct{}    // closed once to ask the worker to exit
	done chan struct{}    // closed by the worker when it has exited
}

type sendRequest struct {
	title string
	body  string
}

// NewService builds the notification service. The worker goroutine is started
// in ServiceStartup, once Wails has created the application.
func NewService() *Service {
	return &Service{
		wails: notifications.New(),
		reqs:  make(chan sendRequest, 32),
		stop:  make(chan struct{}),
		done:  make(chan struct{}),
	}
}

// ServiceStartup delegates to the Wails notifications service (registers the
// toast activator + app data) and starts the send worker. A startup failure is
// non-fatal: toasts still degrade to the PowerShell fallback on Windows.
func (s *Service) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	if err := s.wails.ServiceStartup(ctx, options); err != nil {
		log.Printf("notify: notifications service startup failed (notifications degraded): %v", err)
	}
	go s.worker()
	return nil
}

// ServiceShutdown stops the worker and shuts down the underlying service.
func (s *Service) ServiceShutdown() error {
	close(s.stop)
	<-s.done
	return s.wails.ServiceShutdown()
}

// Send queues a native notification and returns immediately. Errors from the
// toast path are logged, never surfaced — a notification must never break the
// timer flow. If the worker is already backed up the toast is dropped.
func (s *Service) Send(title, body string) {
	select {
	case s.reqs <- sendRequest{title: title, body: body}:
	default:
		log.Printf("notify: dropping notification (worker busy): %q", title)
	}
}

// worker serializes sends on one OS-locked thread so the toast COM apartment
// stays stable across sends, and recovers panics so a toast-library crash can't
// take the app down.
func (s *Service) worker() {
	runtime.LockOSThread()
	defer runtime.UnlockOSThread()
	defer close(s.done)

	for {
		select {
		case req := <-s.reqs:
			s.send(req)
		case <-s.stop:
			return
		}
	}
}

func (s *Service) send(req sendRequest) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("notify: toast panic recovered: %v", r)
		}
	}()

	opts := notifications.NotificationOptions{
		ID:    fmt.Sprintf("phase-complete-%d", time.Now().UnixMilli()),
		Title: req.title,
		Body:  req.body,
	}
	if err := s.wails.SendNotification(opts); err != nil {
		log.Printf("notify: send failed: %v", err)
	}
}
