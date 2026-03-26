-- Migration 004: Room state table for item depletion tracking (Phase 4)
-- Tracks which items have been taken from each room per player,
-- so depleted items don't respawn until the respawn window passes.
CREATE TABLE IF NOT EXISTS room_state (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  room_id       TEXT NOT NULL,
  depleted_item_ids TEXT[] DEFAULT '{}',
  last_visited_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (player_id, room_id)
);

ALTER TABLE room_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players manage own room state"
  ON room_state FOR ALL
  USING (auth.uid() = player_id);
