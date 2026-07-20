-- Añadir columna validated a payment en una BD PostgreSQL ya existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/06-add-payment-validated.sql

BEGIN;

ALTER TABLE "payment"
  ADD COLUMN IF NOT EXISTS "validated" boolean DEFAULT false NOT NULL;

COMMIT;
