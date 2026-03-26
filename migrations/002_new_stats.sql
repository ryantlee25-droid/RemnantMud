-- Migration 002: Replace 4-stat system with 6-stat system, add character class
-- Apply in Supabase SQL Editor

ALTER TABLE players
  DROP COLUMN IF EXISTS body,
  DROP COLUMN IF EXISTS finesse,
  DROP COLUMN IF EXISTS mind,
  DROP COLUMN IF EXISTS spirit,
  ADD COLUMN IF NOT EXISTS vigor    int NOT NULL DEFAULT 2 CHECK (vigor BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS grit     int NOT NULL DEFAULT 2 CHECK (grit BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS reflex   int NOT NULL DEFAULT 2 CHECK (reflex BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS wits     int NOT NULL DEFAULT 2 CHECK (wits BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS presence int NOT NULL DEFAULT 2 CHECK (presence BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS shadow   int NOT NULL DEFAULT 2 CHECK (shadow BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS character_class text NOT NULL DEFAULT 'enforcer'
    CHECK (character_class IN ('enforcer','scout','wraith','shepherd','reclaimer','warden','broker'));

-- Wipe existing player data (dev environment only)
DELETE FROM generated_rooms;
DELETE FROM player_inventory;
DELETE FROM game_log;
DELETE FROM players;
