-- ============================================================
-- MUD Game — Initial Schema Migration
-- Apply this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";


-- ------------------------------------------------------------
-- players
-- One row per authenticated user. Created on character creation.
-- ------------------------------------------------------------
create table if not exists players (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  body         int  not null check (body between 1 and 10),
  finesse      int  not null check (finesse between 1 and 10),
  mind         int  not null check (mind between 1 and 10),
  spirit       int  not null check (spirit between 1 and 10),
  hp           int  not null,
  max_hp       int  not null,
  current_room_id text,
  world_seed   int,
  xp           int  not null default 0,
  level        int  not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS: players can only read/write their own row
alter table players enable row level security;

create policy "players: own row only"
  on players for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-update updated_at on every write
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at
  before update on players
  for each row execute function update_updated_at();


-- ------------------------------------------------------------
-- player_inventory
-- Items carried by a player. item_id references data/items.ts IDs.
-- ------------------------------------------------------------
create table if not exists player_inventory (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references players(id) on delete cascade,
  item_id    text not null,
  quantity   int  not null default 1 check (quantity > 0),
  equipped   boolean not null default false,
  created_at timestamptz not null default now()
);

create index player_inventory_player_id_idx on player_inventory(player_id);

alter table player_inventory enable row level security;

create policy "inventory: own rows only"
  on player_inventory for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);


-- ------------------------------------------------------------
-- game_log
-- Append-only log of game messages shown in the Terminal.
-- message_type: 'narrative' | 'combat' | 'system' | 'error'
-- ------------------------------------------------------------
create table if not exists game_log (
  id           uuid primary key default gen_random_uuid(),
  player_id    uuid not null references players(id) on delete cascade,
  message      text not null,
  message_type text not null default 'narrative'
                 check (message_type in ('narrative', 'combat', 'system', 'error')),
  created_at   timestamptz not null default now()
);

create index game_log_player_id_created_at_idx on game_log(player_id, created_at desc);

alter table game_log enable row level security;

create policy "game_log: own rows only"
  on game_log for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);


-- ------------------------------------------------------------
-- generated_rooms
-- Persisted procedurally generated world per player.
-- exits / items / enemies / npcs / flags are JSONB.
-- ------------------------------------------------------------
create table if not exists generated_rooms (
  id                text primary key,          -- e.g. "shelter-001", "ruins-003"
  player_id         uuid not null references players(id) on delete cascade,
  world_seed        int  not null,
  zone              text not null
                      check (zone in ('shelter', 'ruins', 'wastes', 'outpost', 'underground')),
  name              text not null,
  description       text not null,
  short_description text,
  exits             jsonb not null default '{}',   -- { "north": "ruins-001", "south": null }
  items             jsonb not null default '[]',   -- ["item_pipe_wrench", "item_canned_food"]
  enemies           jsonb not null default '[]',   -- ["enemy_rad_roach"]
  npcs              jsonb not null default '[]',   -- ["npc_old_joe"]
  difficulty        int  not null default 1 check (difficulty between 1 and 5),
  flags             jsonb not null default '{}',   -- { "visited": false, "door_open": false }
  visited           boolean not null default false,
  created_at        timestamptz not null default now()
);

create index generated_rooms_player_id_idx on generated_rooms(player_id);
create index generated_rooms_zone_idx      on generated_rooms(zone);

alter table generated_rooms enable row level security;

create policy "rooms: own rows only"
  on generated_rooms for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);


-- ------------------------------------------------------------
-- world_state
-- Scaffold for future multiplayer global room state.
-- Not used in single-player MVP — present for schema compatibility.
-- ------------------------------------------------------------
create table if not exists world_state (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,
  state_data  jsonb,
  updated_at  timestamptz not null default now()
);

create index world_state_room_id_idx on world_state(room_id);

-- No RLS on world_state — it will be server-managed in multiplayer
