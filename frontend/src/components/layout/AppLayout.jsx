import { TomatoMark } from '../ui/TomatoMark.jsx'

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__mark" aria-hidden="true">
            <TomatoMark size={30} />
          </span>
          <div>
            <h1 className="app-title">
              Aka <span className="app-title__accent">Nasu</span>
            </h1>
            <p className="app-subtitle">トマトの時計 · a tomato focus timer</p>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
