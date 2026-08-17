import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test-only config. The app build uses vite.config.ts; this one adds the
// jsdom environment, jest-dom matchers, and the RTL setup file.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
