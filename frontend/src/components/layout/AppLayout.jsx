export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__mark" aria-hidden="true">
            🍅
          </span>
          <div>
            <h1 className="app-title">トマトの時計</h1>
            <p className="app-subtitle">Tomato Clock · a playful focus timer</p>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
