-- Quitar restos de Total Pass en BD PostgreSQL existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/09-remove-total-pass.sql

BEGIN;

ALTER TABLE "studio_kpi_snapshot"
  DROP COLUMN IF EXISTS "total_pass_active";

UPDATE "plan"
  SET "is_active" = false
  WHERE "id" = 'plan-total-pass' OR "plan_type" = 'total_pass';

COMMIT;
