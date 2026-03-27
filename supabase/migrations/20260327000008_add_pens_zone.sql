-- Add the_pens to zone check constraint: drop current 12-zone constraint, add all 13 zones.
-- Required for The Pens zone (Red Court blood farm, Act II–III).

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
      'the_scar',
      'the_pens'
    )
  );
