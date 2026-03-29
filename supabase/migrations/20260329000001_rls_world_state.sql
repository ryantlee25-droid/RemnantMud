-- Migration: Enable RLS on world_state and drop unused game_log table
-- Idempotent: uses IF EXISTS guards throughout

-- Enable RLS on world_state (was left open — security gap)
alter table if exists world_state enable row level security;

-- Drop game_log — table exists in schema but is never written to from application code
drop table if exists game_log;
