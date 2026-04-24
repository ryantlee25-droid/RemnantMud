import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/eval/**', '.claude/worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'data/**', 'components/**'],
      exclude: ['lib/supabase.ts', 'lib/gameContext.tsx'],
      // Project rule: coverage gaps warn in PR descriptions, they don't block.
      // Thresholds are realistic floors (most slips correspond to known gaps —
      // presentational tab components, mocked-out modules, data builders).
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
