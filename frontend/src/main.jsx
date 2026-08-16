import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { loadAppState } from './lib/backend.js'
import { pomodoroStore } from './features/pomodoro/state/pomodoroStore.js'
import { todoStore } from './features/todo/state/todoStore.js'
import './styles/globals.css'
import './styles/pomodoro.css'

// Seed both stores from the persisted config as soon as it's available.
loadAppState()
  .then((state) => {
    pomodoroStore.load(state)
    todoStore.load(state.todos)
  })
  .catch((err) => console.error('Could not load app config:', err))

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
