-- Drop existing primary key on generated_rooms
ALTER TABLE generated_rooms DROP CONSTRAINT generated_rooms_pkey;

-- Add surrogate UUID primary key
ALTER TABLE generated_rooms ADD COLUMN pk UUID DEFAULT gen_random_uuid();
ALTER TABLE generated_rooms ADD PRIMARY KEY (pk);

-- Add unique constraint for the actual identity
ALTER TABLE generated_rooms ADD CONSTRAINT generated_rooms_player_room_unique UNIQUE (player_id, id);
