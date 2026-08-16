# Contributing to Aka Nasu

Thanks for wanting to help out! Aka Nasu is a small, personal pomodoro app, but that doesn't mean it has to stay that way. A few ground rules to keep things pleasant:

## Code of conduct

Be kind. This is a hobby project built in the open — no need for drama. Harassment, trolling, or anything else unpleasant isn't welcome.

## How to get started

1. Fork the repo and clone your fork.
2. Make sure you have the tools below installed.
3. Create a branch: `git checkout -b my-feature`.
4. Make your changes, test them, commit.
5. Push and open a pull request against `main`.

## Prerequisites

- **Go** (version in `go.mod`)
- **Node.js 24** (what CI uses; see `.github/workflows/release.yml`)
- **Wails v3 CLI** (`wails3`) — `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`
- **Task** (`task`) — the project uses `Taskfile.yml` for common commands

## Development workflow

| Command | What it does |
| --- | --- |
| `task dev` | Dev mode with hot reload |
| `task build` | Production build |
| `task run` | Run the built app |
| `npm --prefix frontend run lint` | Lint the frontend with oxlint |

## Project layout

- `frontend/` — the UI (React + Vite). State lives in `src/state`, features in `src/features`, styles in `src/styles`.
- `backend/` — Go services (timer, todos, settings, stats, config, version).
- `build/` — platform build configs (Windows NSIS, macOS, Linux nfpm, etc.).
- `.github/workflows/` — CI. Releasing is tag-driven; see below.

## What to work on

- Check the issues tab for open bugs and feature requests.
- Small, focused PRs are much easier to review than big sweeping ones. If a change is large or changes the UI in a visible way, open an issue or PR early so we can talk about it before you sink hours into it.
- The app is intentionally opinionated (long focus intervals, one tomato, no "productivity-hack" clutter). UI/UX changes that fight that vision may be declined — ask first.

## Code style

- **Go:** follow `gofmt` / `go vet`. Keep services small and testable.
- **Frontend:** run the oxlint task before pushing. Follow the existing component patterns in `src/components` and `src/features`.
- Keep commits small and messages descriptive.

## Releasing

Releases are automated and tag-driven. Maintainers cut a stable `vX.Y.Z` tag and CI builds Linux, macOS, and Windows artifacts and publishes them. You generally don't need to worry about this, but if you're changing the build pipeline, keep the artifact names and the release workflow in sync — the workflow verifies them.

## Questions?

Open an issue or start a discussion. Happy contributing!
