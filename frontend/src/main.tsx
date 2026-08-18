import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { loadAppState } from './lib/backend.js'
import { runUpdateCheck } from './features/update/lib/runUpdateCheck.js'
import { pomodoroStore } from './features/pomodoro/state/pomodoroStore.js'
import { todoStore } from './features/todo/state/todoStore.js'
import './styles/globals.css'
import './styles/pomodoro.css'
import './styles/intro.css'
import './styles/mini.css'
import './features/update/update.css'

// Suppress the webview's default right-click menu (Inspect, reload, etc.) —
// the app owns all its context actions.
window.addEventListener('contextmenu', (e) => e.preventDefault())

// Seed both stores from the persisted config as soon as it's available.
loadAppState()
  .then((state) => {
    pomodoroStore.load(state)
    todoStore.load(state.todos)
  })
  .catch((err) => console.error('Could not load app config:', err))

// Offer a newer GitHub release once, if one exists.
runUpdateCheck()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
