-- Añadir columna is_public a plan en una BD PostgreSQL ya existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/08-add-plan-is-public.sql

BEGIN;

ALTER TABLE "plan"
  ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT true NOT NULL;

COMMIT;
