-- AlterTable
ALTER TABLE "DoctorSchedule" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT false;

UPDATE "DoctorSchedule" SET "isAvailable" = "isActive";

-- CreateIndex
CREATE INDEX "Appointment_clinicId_doctorId_startAt_idx" ON "Appointment"("clinicId", "doctorId", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_status_startAt_idx" ON "Appointment"("clinicId", "status", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_visitTypeId_idx" ON "Appointment"("visitTypeId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "AuditLog_clinicId_createdAt_idx" ON "AuditLog"("clinicId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Bill_clinicId_status_idx" ON "Bill"("clinicId", "status");

-- CreateIndex
CREATE INDEX "Bill_patientId_idx" ON "Bill"("patientId");

-- CreateIndex
CREATE INDEX "Bill_appointmentId_idx" ON "Bill"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_clinicId_invoiceNumber_key" ON "Bill"("clinicId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "Doctor_clinicId_idx" ON "Doctor"("clinicId");

-- CreateIndex
CREATE INDEX "DoctorSchedule_clinicId_doctorId_dayOfWeek_idx" ON "DoctorSchedule"("clinicId", "doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "DoctorSchedule_doctorId_idx" ON "DoctorSchedule"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorTimeOff_clinicId_doctorId_startAt_idx" ON "DoctorTimeOff"("clinicId", "doctorId", "startAt");

-- CreateIndex
CREATE INDEX "DoctorTimeOff_doctorId_idx" ON "DoctorTimeOff"("doctorId");

-- CreateIndex
CREATE INDEX "File_clinicId_patientId_idx" ON "File"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "File_patientId_idx" ON "File"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_clinicId_patientId_idx" ON "LabOrder"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_doctorId_idx" ON "LabOrder"("doctorId");

-- CreateIndex
CREATE INDEX "LabOrder_appointmentId_idx" ON "LabOrder"("appointmentId");

-- CreateIndex
CREATE INDEX "LabResult_clinicId_doctorId_reviewedAt_idx" ON "LabResult"("clinicId", "doctorId", "reviewedAt");

-- CreateIndex
CREATE INDEX "LabResult_labOrderId_idx" ON "LabResult"("labOrderId");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_doctorId_idx" ON "LabResult"("doctorId");

-- CreateIndex
CREATE INDEX "MedicalRecord_clinicId_doctorId_status_idx" ON "MedicalRecord"("clinicId", "doctorId", "status");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_appointmentId_idx" ON "MedicalRecord"("appointmentId");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_idx" ON "MedicalRecord"("doctorId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Patient_clinicId_lastName_firstName_idx" ON "Patient"("clinicId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Patient_clinicId_phone_idx" ON "Patient"("clinicId", "phone");

-- CreateIndex
CREATE INDEX "Payment_clinicId_billId_idx" ON "Payment"("clinicId", "billId");

-- CreateIndex
CREATE INDEX "Payment_billId_idx" ON "Payment"("billId");

-- CreateIndex
CREATE INDEX "Prescription_clinicId_doctorId_status_idx" ON "Prescription"("clinicId", "doctorId", "status");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_appointmentId_idx" ON "Prescription"("appointmentId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Receptionist_clinicId_idx" ON "Receptionist"("clinicId");

-- CreateIndex
CREATE INDEX "User_clinicId_idx" ON "User"("clinicId");

-- CreateIndex
CREATE INDEX "VisitType_clinicId_idx" ON "VisitType"("clinicId");
