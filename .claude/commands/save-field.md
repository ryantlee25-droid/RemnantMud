You are adding a new field to the save system. Follow this checklist:

1. What field are you adding to `_savePlayer()` in `lib/gameEngine.ts`?
2. Check: does `supabase/migrations/` have a migration adding this column to the `players` table?
3. If NO: create a migration FIRST at `supabase/migrations/{timestamp}_{description}.sql`
4. Add the column to the `loadPlayer()` row type in `gameEngine.ts`
5. Add to the TypeScript `Player` type in `types/game.ts` if needed
6. Run `npx supabase db push` to apply the migration
7. Run `pnpm run validate` to confirm consistency
8. Run `pnpm test:ci` to verify nothing breaks

CRITICAL: Two production outages (active_buffs, narrative_progress) were caused by skipping steps 2-3. See CLAUDE.md Critical Rule #1.
