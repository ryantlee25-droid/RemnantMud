import { defineConfig } from 'vitest/config'
import path from 'path'

// Config for on-demand evaluation suite (`pnpm test:eval`).
// Eval tests document current known bugs and are excluded from the default
// `pnpm test` run. Run on demand to audit map integrity, dialogue health,
// ending reachability, faction lockout, and combat balance.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/eval/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
