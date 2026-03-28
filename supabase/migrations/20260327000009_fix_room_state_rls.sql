-- Fix room_state RLS policy: add WITH CHECK clause for INSERT/UPDATE

DROP POLICY IF EXISTS "Players manage own room state" ON room_state;

CREATE POLICY "Players manage own room state"
  ON room_state FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);
