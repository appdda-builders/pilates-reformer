-- Añadir tabla coupon a una BD PostgreSQL ya existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/04-add-coupon.sql

BEGIN;

CREATE TABLE IF NOT EXISTS "coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"discount_type" text DEFAULT 'percent' NOT NULL,
	"discount_value" double precision NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp (3),
	"valid_until" timestamp (3),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);

COMMIT;
