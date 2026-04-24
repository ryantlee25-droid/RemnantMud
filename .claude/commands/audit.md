Run a release readiness mini-audit:

1. Type check: `npx tsc --noEmit`
2. Tests with coverage: `pnpm test:ci`
3. Consistency validation: `pnpm run validate`
4. Check for uncommitted changes: `git status`
5. Check recent deployment: `vercel ls 2>&1 | head -5`

Report a GO/NO-GO verdict with any blockers found.
