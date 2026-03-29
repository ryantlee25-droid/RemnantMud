-- Migration: Enable RLS on world_state and drop unused game_log table
-- Idempotent: uses IF EXISTS guards throughout

-- Enable RLS on world_state (was left open — security gap).
-- world_state is currently unused and reserved for future multiplayer.
-- No authenticated/anon policy is added intentionally: the table should
-- only be accessed via service_role (which bypasses RLS by default).
alter table if exists world_state enable row level security;

-- Drop game_log — table exists in schema but is never written to from
-- application code. Confirmed empty in all environments.
drop table if exists game_log;
