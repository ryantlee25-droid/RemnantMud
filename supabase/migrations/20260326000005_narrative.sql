-- Migration 005: Narrative system columns
-- Adds personal loss tracking and prologue flag to players table

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS personal_loss_type TEXT
    CHECK (personal_loss_type IN ('child', 'partner', 'community', 'identity', 'promise')),
  ADD COLUMN IF NOT EXISTS personal_loss_detail TEXT,
  ADD COLUMN IF NOT EXISTS saw_prologue BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dog_trust INT NOT NULL DEFAULT 0
    CHECK (dog_trust BETWEEN 0 AND 100);
