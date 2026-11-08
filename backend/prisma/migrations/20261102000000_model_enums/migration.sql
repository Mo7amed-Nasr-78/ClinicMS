CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'receptionist', 'doctor', 'patient');
CREATE TYPE "public"."Status" AS ENUM ('active', 'inActive', 'suspended');
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female');
CREATE TYPE "public"."PatientStatus" AS ENUM ('new', 'active', 'inActive', 'archived');
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'checkedIn', 'inProgress', 'completed', 'cancelled', 'noShow', 'rescheduled');
CREATE TYPE "public"."AppointmentSource" AS ENUM ('reception', 'online', 'walk_in');
CREATE TYPE "public"."BillStatus" AS ENUM ('unpaid', 'partial', 'paid', 'cancelled');
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'card', 'insurance', 'other');
CREATE TYPE "public"."RecordStatus" AS ENUM ('draft', 'signed');
CREATE TYPE "public"."PrescriptionStatus" AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE "public"."LabOrderStatus" AS ENUM ('ordered', 'resulted', 'cancelled');
CREATE TYPE "public"."FileRelatedType" AS ENUM ('medical_record', 'prescription', 'lab_result', 'bill', 'other');

ALTER TABLE "public"."Clinic"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
    ALTER COLUMN "status" SET DEFAULT 'inActive';

ALTER TABLE "public"."User"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "role" TYPE "public"."UserRole" USING "role"::text::"public"."UserRole",
    ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
    ALTER COLUMN "status" SET DEFAULT 'inActive';

ALTER TABLE "public"."Doctor"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
    ALTER COLUMN "status" SET DEFAULT 'inActive';

ALTER TABLE "public"."Receptionist"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
    ALTER COLUMN "status" SET DEFAULT 'inActive';

ALTER TABLE "public"."Patient"
    ALTER COLUMN "gender" TYPE "public"."Gender" USING "gender"::text::"public"."Gender",
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."PatientStatus" USING "status"::text::"public"."PatientStatus",
    ALTER COLUMN "status" SET DEFAULT 'new';

ALTER TABLE "public"."Appointment"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "source" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."AppointmentStatus" USING "status"::text::"public"."AppointmentStatus",
    ALTER COLUMN "source" TYPE "public"."AppointmentSource" USING "source"::text::"public"."AppointmentSource",
    ALTER COLUMN "status" SET DEFAULT 'scheduled',
    ALTER COLUMN "source" SET DEFAULT 'reception';

ALTER TABLE "public"."MedicalRecord"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."RecordStatus" USING "status"::text::"public"."RecordStatus",
    ALTER COLUMN "status" SET DEFAULT 'draft';

ALTER TABLE "public"."Prescription"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."PrescriptionStatus" USING "status"::text::"public"."PrescriptionStatus",
    ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "public"."LabOrder"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."LabOrderStatus" USING "status"::text::"public"."LabOrderStatus",
    ALTER COLUMN "status" SET DEFAULT 'ordered';

ALTER TABLE "public"."Bill"
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "public"."BillStatus" USING "status"::text::"public"."BillStatus",
    ALTER COLUMN "status" SET DEFAULT 'unpaid';

ALTER TABLE "public"."Payment"
    ALTER COLUMN "method" TYPE "public"."PaymentMethod" USING "method"::text::"public"."PaymentMethod";

ALTER TABLE "public"."File"
    ALTER COLUMN "relatedType" TYPE "public"."FileRelatedType" USING "relatedType"::text::"public"."FileRelatedType";
