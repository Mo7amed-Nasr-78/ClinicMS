BEGIN;

DROP INDEX IF EXISTS "Appointment_clinicId_doctorId_startAt_idx";
DROP INDEX IF EXISTS "Appointment_clinicId_status_startAt_idx";

ALTER TABLE "Appointment"
ADD COLUMN "appointmentDate" DATE,
ADD COLUMN "startAt_text" VARCHAR(5),
ADD COLUMN "endAt_text" VARCHAR(5);

UPDATE "Appointment" AS appointment
SET
  "appointmentDate" = (appointment."startAt" AT TIME ZONE clinic."timezone")::DATE,
  "startAt_text" = to_char(appointment."startAt" AT TIME ZONE clinic."timezone", 'HH24:MI'),
  "endAt_text" = to_char(appointment."endAt" AT TIME ZONE clinic."timezone", 'HH24:MI')
FROM "Clinic" AS clinic
WHERE clinic."id" = appointment."clinicId";

UPDATE "Appointment"
SET
  "appointmentDate" = ("startAt" AT TIME ZONE 'UTC')::DATE,
  "startAt_text" = to_char("startAt" AT TIME ZONE 'UTC', 'HH24:MI'),
  "endAt_text" = to_char("endAt" AT TIME ZONE 'UTC', 'HH24:MI')
WHERE "appointmentDate" IS NULL;

ALTER TABLE "Appointment"
ALTER COLUMN "appointmentDate" SET NOT NULL,
ALTER COLUMN "startAt_text" SET NOT NULL,
ALTER COLUMN "endAt_text" SET NOT NULL,
DROP COLUMN "startAt",
DROP COLUMN "endAt";

ALTER TABLE "Appointment"
RENAME COLUMN "startAt_text" TO "startAt";

ALTER TABLE "Appointment"
RENAME COLUMN "endAt_text" TO "endAt";

CREATE INDEX "Appointment_clinicId_doctorId_appointmentDate_startAt_idx"
ON "Appointment"("clinicId", "doctorId", "appointmentDate", "startAt");

CREATE INDEX "Appointment_clinicId_status_appointmentDate_idx"
ON "Appointment"("clinicId", "status", "appointmentDate");

COMMIT;
