-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(6),
    "cancelledBy" CHAR(36),
    "checkedInAt" TIMESTAMP(6),
    "clinicId" CHAR(36) NOT NULL,
    "completedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" CHAR(36) NOT NULL,
    "doctorId" CHAR(36) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "notes" TEXT,
    "patientId" CHAR(36) NOT NULL,
    "reason" TEXT,
    "rescheduledFromId" CHAR(36),
    "source" TEXT NOT NULL DEFAULT 'reception',
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "startedAt" TIMESTAMP(6),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "visitTypeId" CHAR(36) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "action" TEXT NOT NULL,
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" CHAR(36) NOT NULL,
    "entityType" TEXT NOT NULL,
    "id" CHAR(36) NOT NULL,
    "ipAddress" TEXT,
    "metadata" TEXT,
    "userId" CHAR(36) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bill" (
    "amount" DECIMAL NOT NULL,
    "appointmentId" CHAR(36),
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" CHAR(36) NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMPTZ(6),
    "id" CHAR(36) NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "notes" TEXT,
    "patientId" CHAR(36) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Clinic" (
    "address" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "email" TEXT NOT NULL,
    "id" CHAR(36) NOT NULL,
    "inactiveAfterMonths" INTEGER NOT NULL DEFAULT 12,
    "logo" TEXT,
    "name" TEXT NOT NULL,
    "noShowGraceMinutes" INTEGER NOT NULL DEFAULT 15,
    "ownerId" CHAR(36) NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inActive',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Doctor" (
    "bio" TEXT,
    "clinicId" CHAR(36) NOT NULL,
    "consultationDuration" INTEGER NOT NULL,
    "consultationFee" DECIMAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" CHAR(36) NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inActive',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" CHAR(36) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorSchedule" (
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayOfWeek" INTEGER NOT NULL,
    "doctorId" CHAR(36) NOT NULL,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL,
    "effectiveTo" TIMESTAMPTZ(6),
    "endTime" TEXT NOT NULL,
    "id" CHAR(36) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slotDuration" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorTimeOff" (
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" CHAR(36) NOT NULL,
    "doctorId" CHAR(36) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "reason" TEXT,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DoctorTimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" CHAR(36) NOT NULL,
    "mimeType" TEXT NOT NULL,
    "patientId" CHAR(36) NOT NULL,
    "publicId" TEXT NOT NULL,
    "relatedId" CHAR(36),
    "relatedType" TEXT,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "uploadedBy" CHAR(36) NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabOrder" (
    "appointmentId" CHAR(36),
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorId" CHAR(36) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "notes" TEXT,
    "patientId" CHAR(36) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ordered',
    "testName" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabResult" (
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorId" CHAR(36) NOT NULL,
    "enteredBy" CHAR(36) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "labOrderId" CHAR(36) NOT NULL,
    "patientId" CHAR(36) NOT NULL,
    "reviewComment" TEXT,
    "reviewedAt" TIMESTAMP(6),
    "reviewedBy" CHAR(36),
    "summary" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalRecord" (
    "appointmentId" CHAR(36) NOT NULL,
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "doctorId" CHAR(36) NOT NULL,
    "examination" TEXT,
    "id" CHAR(36) NOT NULL,
    "notes" TEXT,
    "patientId" CHAR(36) NOT NULL,
    "signedAt" TIMESTAMP(6),
    "signedBy" CHAR(36),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "symptoms" TEXT,
    "treatment" TEXT,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT,
    "id" CHAR(36) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(6),
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" CHAR(36) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "address" TEXT,
    "allergies" TEXT,
    "archivedAt" TIMESTAMP(6),
    "archivedBy" CHAR(36),
    "archivedReason" TEXT,
    "bloodType" TEXT,
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMPTZ(6) NOT NULL,
    "email" TEXT,
    "emergencyContact" TEXT,
    "firstName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "id" CHAR(36) NOT NULL,
    "lastName" TEXT NOT NULL,
    "lastVisitAt" TIMESTAMP(6),
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "amount" DECIMAL NOT NULL,
    "billId" CHAR(36) NOT NULL,
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" CHAR(36) NOT NULL,
    "method" TEXT NOT NULL,
    "notes" TEXT,
    "paidAt" TIMESTAMP(6) NOT NULL,
    "receivedBy" CHAR(36) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "appointmentId" CHAR(36),
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "denyReason" TEXT,
    "doctorId" CHAR(36) NOT NULL,
    "id" CHAR(36) NOT NULL,
    "medications" TEXT NOT NULL,
    "notes" TEXT,
    "patientId" CHAR(36) NOT NULL,
    "requestedBy" CHAR(36),
    "signedAt" TIMESTAMP(6),
    "signedBy" CHAR(36),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Receptionist" (
    "clinicId" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" CHAR(36) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inActive',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" CHAR(36) NOT NULL,

    CONSTRAINT "Receptionist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "avatar" TEXT,
    "clinicId" CHAR(36),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "id" CHAR(36) NOT NULL,
    "lastLoginAt" TIMESTAMPTZ(6),
    "lastName" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inActive',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitType" (
    "clinicId" CHAR(36) NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultDurationMin" INTEGER NOT NULL,
    "id" CHAR(36) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "price" DECIMAL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VisitType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_email_key" ON "public"."Clinic"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_ownerId_key" ON "public"."Clinic"("ownerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "public"."Doctor"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Receptionist_userId_key" ON "public"."Receptionist"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);
