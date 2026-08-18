// Package notify fires native OS notifications when a timer phase completes.
//
// The underlying wintoast renderer is thread-affine, so every send is queued
// to one OS-locked worker goroutine and wrapped in a recover — never fired
// synchronously on the Wails call path, so it can't stall or crash the app.
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

// Service exposes a non-blocking Send to the frontend.
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

// NewService creates the service; the worker starts in ServiceStartup.
func NewService() *Service {
	return &Service{
		wails: notifications.New(),
		reqs:  make(chan sendRequest, 32),
		stop:  make(chan struct{}),
		done:  make(chan struct{}),
	}
}

// ServiceStartup registers the Wails notifications service and starts the worker.
// Startup failure is non-fatal (toasts degrade to the PowerShell fallback).
func (s *Service) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	if err := s.wails.ServiceStartup(ctx, options); err != nil {
		log.Printf("notify: notifications service startup failed (notifications degraded): %v", err)
	}
	go s.worker()
	return nil
}

// ServiceShutdown stops the worker and the underlying service.
func (s *Service) ServiceShutdown() error {
	close(s.stop)
	<-s.done
	return s.wails.ServiceShutdown()
}

// Send queues a notification; never blocks or breaks the timer flow. Drops if busy.
func (s *Service) Send(title, body string) {
	select {
	case s.reqs <- sendRequest{title: title, body: body}:
	default:
		log.Printf("notify: dropping notification (worker busy): %q", title)
	}
}

// worker serializes sends on one OS-locked thread and recovers panics.
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
