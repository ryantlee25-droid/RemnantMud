-- Migration: Player stash — persistent item storage across cycles
CREATE TABLE IF NOT EXISTS player_stash (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX player_stash_player_id_idx ON player_stash(player_id);
ALTER TABLE player_stash ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stash: own rows only"
  ON player_stash FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);
