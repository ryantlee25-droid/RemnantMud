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
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 64,
        lines: 64,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
