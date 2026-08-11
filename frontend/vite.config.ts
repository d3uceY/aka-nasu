import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Bind to IPv4 loopback. Vite's default ("localhost") can resolve to ::1,
    // but Wails dev mode proxies to 127.0.0.1, causing connection refused errors.
    host: '127.0.0.1',
  },
})
