-- Añadir excepciones de horario por fecha a una BD PostgreSQL ya existente.
--   psql "$DATABASE_URL" -f scripts/postgres-manual/05-add-schedule-slot-exception.sql

BEGIN;

CREATE TABLE IF NOT EXISTS "schedule_slot_exception" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_slot_id" text NOT NULL,
	"exception_date" timestamp (3) NOT NULL,
	"reason" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "schedule_slot_exception" ADD CONSTRAINT "schedule_slot_exception_schedule_slot_id_schedule_slot_id_fk"
 FOREIGN KEY ("schedule_slot_id") REFERENCES "public"."schedule_slot"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "schedule_slot_exception_slot_idx" ON "schedule_slot_exception" USING btree ("schedule_slot_id");
CREATE UNIQUE INDEX IF NOT EXISTS "schedule_slot_exception_slot_date_uidx" ON "schedule_slot_exception" USING btree ("schedule_slot_id","exception_date");

COMMIT;
