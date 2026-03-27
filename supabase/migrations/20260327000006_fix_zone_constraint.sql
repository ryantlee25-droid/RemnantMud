-- Fix zone check constraint: drop legacy 5-zone constraint, add the 12 actual zones.
-- Required because world was rebuilt from hand-crafted zones after the init migration.

ALTER TABLE generated_rooms
  DROP CONSTRAINT IF EXISTS generated_rooms_zone_check;

ALTER TABLE generated_rooms
  ADD CONSTRAINT generated_rooms_zone_check CHECK (
    zone IN (
      'crossroads',
      'river_road',
      'covenant',
      'salt_creek',
      'the_ember',
      'the_breaks',
      'the_dust',
      'the_stacks',
      'duskhollow',
      'the_deep',
      'the_pine_sea',
      'the_scar'
    )
  );
