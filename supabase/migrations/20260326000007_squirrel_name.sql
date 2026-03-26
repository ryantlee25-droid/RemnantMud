-- Migration 007: Squirrel name
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS squirrel_name TEXT
    CHECK (squirrel_name IN ('Chippy', 'Stumpy'));
