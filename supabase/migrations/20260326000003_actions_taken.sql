-- Migration 003: Track in-world time via actions_taken counter
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS actions_taken INTEGER DEFAULT 0;
