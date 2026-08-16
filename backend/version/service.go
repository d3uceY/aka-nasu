// Package version exposes the current app version to the frontend.
package version

// Service reports the app version the binary was built with.
type Service struct {
	version string
}

// NewService builds a version service pinned to the given version string.
func NewService(version string) *Service {
	return &Service{version: version}
}

// GetVersion returns the app version, e.g. "0.1.0".
func (s *Service) GetVersion() string {
	return s.version
}
