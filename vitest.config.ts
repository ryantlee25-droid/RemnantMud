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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'data/**', 'components/**'],
      exclude: ['lib/supabase.ts', 'lib/gameContext.tsx'],
      thresholds: {
        statements: 25,
        branches: 18,
        functions: 24,
        lines: 26,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
