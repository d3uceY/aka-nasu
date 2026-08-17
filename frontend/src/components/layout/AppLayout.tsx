import type { ReactNode } from 'react'

// The old brand header is gone. Identity now lives in the opening intro and
// the mini-timer bar. The layout is just the two composed columns on paper.
export function AppLayout({ children }: { children: ReactNode }) {
  return <main className="app-main">{children}</main>
}
