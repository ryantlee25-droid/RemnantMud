-- Remove duplicate rows if any exist (keep the one with highest quantity)
DELETE FROM player_inventory a USING player_inventory b
WHERE a.id > b.id
  AND a.player_id = b.player_id
  AND a.item_id = b.item_id;

-- Add unique constraint
ALTER TABLE player_inventory ADD CONSTRAINT player_inventory_player_item_unique UNIQUE (player_id, item_id);
