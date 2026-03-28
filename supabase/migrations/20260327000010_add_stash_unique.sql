-- Add unique constraint to player_stash (player_id, item_id)
-- Matches code expectation in lib/actions/items.ts:maybeSingle()

DELETE FROM player_stash a USING player_stash b
  WHERE a.id > b.id AND a.player_id = b.player_id AND a.item_id = b.item_id;

ALTER TABLE player_stash
  ADD CONSTRAINT player_stash_player_item_unique UNIQUE (player_id, item_id);
