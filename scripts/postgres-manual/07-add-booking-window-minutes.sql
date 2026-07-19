-- Añadir columna booking_window_minutes a studio_policy en una BD PostgreSQL ya existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/07-add-booking-window-minutes.sql

BEGIN;

ALTER TABLE "studio_policy"
  ADD COLUMN IF NOT EXISTS "booking_window_minutes" integer DEFAULT 5 NOT NULL;

COMMIT;
