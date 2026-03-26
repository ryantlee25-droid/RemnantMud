-- Migration 006: Rename dog_trust to squirrel_trust
-- The companion is a mutant squirrel, not a dog. Behaves like a dog. More interesting.

ALTER TABLE players RENAME COLUMN dog_trust TO squirrel_trust;
