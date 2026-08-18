import type { ReactNode } from 'react'

// Just the two-column layout; brand identity lives in the intro and mini bar.
export function AppLayout({ children }: { children: ReactNode }) {
  return <main className="app-main">{children}</main>
}
