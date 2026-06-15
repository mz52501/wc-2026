-- ============================================================
-- Migration: auto-predictions for players who miss the deadline
-- Run this in Supabase SQL Editor (once)
-- Requires: pg_cron extension enabled in Supabase dashboard
-- ============================================================

-- 1. Add is_auto flag to predictions
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS is_auto BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Function that generates predictions for players who missed the deadline.
--    Runs after a match locks (kickoff_at - 60 min). For each league member
--    with no prediction, randomly picks one real prediction from the pool and
--    stores it. Picking uniformly gives weighted randomness naturally: a score
--    predicted by 3 players is 3x more likely to be picked than one predicted
--    by 1 player, so the outcome distribution mirrors the crowd.
CREATE OR REPLACE FUNCTION generate_auto_predictions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  locked_match RECORD;
  missing_user RECORD;
  sampled      RECORD;
  pool_size    INTEGER;
BEGIN
  FOR locked_match IN
    SELECT id
    FROM matches
    WHERE kickoff_at - INTERVAL '60 minutes' <= NOW()
      AND kickoff_at > NOW() - INTERVAL '24 hours'
  LOOP
    SELECT COUNT(*) INTO pool_size
    FROM predictions
    WHERE match_id = locked_match.id
      AND is_auto = FALSE;

    IF pool_size = 0 THEN
      CONTINUE;
    END IF;

    FOR missing_user IN
      SELECT DISTINCT lm.user_id
      FROM league_members lm
      WHERE NOT EXISTS (
        SELECT 1
        FROM predictions p
        WHERE p.user_id = lm.user_id
          AND p.match_id = locked_match.id
      )
    LOOP
      SELECT pred_home, pred_away
      INTO sampled
      FROM predictions
      WHERE match_id = locked_match.id
        AND is_auto = FALSE
      ORDER BY random()
      LIMIT 1;

      INSERT INTO predictions (user_id, match_id, pred_home, pred_away, is_auto, updated_at)
      VALUES (
        missing_user.user_id,
        locked_match.id,
        sampled.pred_home,
        sampled.pred_away,
        TRUE,
        NOW()
      )
      ON CONFLICT (user_id, match_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- 3. Run every 5 minutes
SELECT cron.schedule(
  'generate-auto-predictions',
  '*/5 * * * *',
  'SELECT generate_auto_predictions()'
);
