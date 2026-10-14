import { defineContract } from "@prisma/orm-postgres/contract-builder";
import { UserRole, UserStatus, PatientGender, PatientStatus, AppointmentStatus } from "./enums.ts";

export const contract = defineContract({}, ({ field, model, rel }) => {
	const Clinic = model("Clinic", {
		fields: {
			id: field.id.uuidv7String(),
			name: field.text(),
			email: field.text().unique(),
			phone: field.text(),
			address: field.text().optional(),
			logo: field.text().optional(),
			ownerId: field.uuidString().unique(),
			status: field.namedType(UserStatus).default("inActive"),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const User = model("User", {
		fields: {
			id: field.id.uuidv7String(),
			firstName: field.text().optional(),
			lastName: field.text().optional(),
			email: field.text().unique(),
			password: field.text(),
			phone: field.text().optional(),
			role: field.namedType(UserRole),
			avatar: field.text().optional(),
			status: field.namedType(UserStatus).default("inActive"),
			lastLoginAt: field.dateTime().optional(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const Doctor = model("Doctor", {
		fields: {
			id: field.id.uuidv7String(),
			specialty: field.text(),
			licenseNumber: field.text(),
			bio: field.text(),
			consultationDuration: field.text(),
			consultationFee: field.decimal(),
			status: field.namedType(UserStatus),
			userId: field.uuidString(),
			clinicId: field.uuidString(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const Patient = model("Patient", {
		fields: {
			id: field.id.uuidv7String(),
			firstName: field.text(),
			lastName: field.text(),
			dateOfBirth: field.text(),
			gender: field.namedType(PatientGender),
			bloodType: field.text(),
			phone: field.text(),
			email: field.text().optional().unique(),
			address: field.text(),
			emergencyContact: field.text(),
			status: field.namedType(PatientStatus),
			allergies: field.text(),
			clinicId: field.uuidString(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const DoctorSchedule = model("DoctorSchedule", {
		fields: {
			id: field.id.uuidv7String(),
			doctorId: field.uuidString(),
			clinicId: field.uuidString(),
			dayOfWeek: field.int(),
			startTime: field.text(),
			endTime: field.text(),
			isAvailable: field.boolean().default(false),
			isActive: field.boolean().default(false),
			slotDuration: field.int(),
			effectiveFrom: field.dateTime(),
			effectiveTo: field.dateTime(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const Appointment = model("Appointment", {
		fields: {
			id: field.id.uuidv7String(),
			clinicId: field.uuidString(),
			doctorId: field.uuidString(),
			patientId: field.uuidString(),
			appointmentDate: field.dateTime(),
			startTime: field.text(),
			endTime: field.text(),
			status: field.namedType(AppointmentStatus).default("scheduled"),
			reason: field.text(),
			notes: field.text(),
			createdBy: field.text(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const MedicalRecord = model("MedicalRecord", {
		fields: {
			id: field.id.uuidv7String(),
			clinicId: field.uuidString(),
			patientId: field.uuidString(),
			doctorId: field.uuidString(),
			appointmentId: field.uuidString(),
			diagnosis: field.text(),
			symptoms: field.text(),
			examination: field.text(),
			treatment: field.text(),
			notes: field.text(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const Prescription = model("Prescription", {
		fields: {
			id: field.id.uuidv7String(),
			patientId: field.uuidString(),
			doctorId: field.uuidString(),
			appointmentId: field.uuidString(),
			medications: field.text(),
			notes: field.text(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const Notification = model("Notification", {
		fields: {
			id: field.id.uuidv7String(),
			recepientId: field.uuidString(),
			title: field.text(),
			type: field.text(),
			message: field.text(),
			data: field.text(),
			isRead: field.boolean(),
			readAt: field.temporal.timestampString(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	const File = model("File", {
		fields: {
			id: field.id.uuidv7String(),
			ownerId: field.uuidString(),
			relatedTo: field.uuidString(),
			relatedId: field.uuidString(),
			url: field.text(),
			publicId: field.text(),
			type: field.text(),
			mimeType: field.text(),
			size: field.text(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	return {
		models: {
			User: User.relations({
				clinic: rel.hasOne(Clinic, { by: "ownerId" }),
			}),
			Clinic: Clinic.relations({
				user: rel.belongsTo(User, {
					from: "ownerId",
					to: "id",
				}),
				appointments: rel.hasMany(Appointment, {
					by: "clinicId",
				}),
				doctors: rel.hasMany(Doctor, { by: "clinicId" }),
				patients: rel.hasMany(Patient, { by: "clinicId" }),
				medicalRecords: rel.hasMany(MedicalRecord, {
					by: "clinicId",
				}),
				notifications: rel.hasMany(Notification, {
					by: "recepientId",
				}),
				schedules: rel.hasMany(DoctorSchedule, {
					by: "clinicId",
				}),
			}),
			Doctor: Doctor.relations({
				user: rel.belongsTo(User, { from: "userId", to: "id" }),
				clinic: rel.belongsTo(Clinic, {
					from: "clinicId",
					to: "id",
				}),
				schedules: rel.hasMany(DoctorSchedule, {
					by: "doctorId",
				}),
				appointments: rel.hasMany(Appointment, {
					by: "doctorId",
				}),
				prescriptions: rel.hasMany(Prescription, {
					by: "doctorId",
				}),
				medicalRecords: rel.hasMany(MedicalRecord, {
					by: "doctorId",
				}),
			}),
			DoctorSchedule: DoctorSchedule.relations({
				clinic: rel.belongsTo(Clinic, {
					from: "clinicId",
					to: "id",
				}),
				doctor: rel.belongsTo(Doctor, {
					from: "doctorId",
					to: "id",
				}),
			}),
			Patient: Patient.relations({
				clinic: rel.belongsTo(Clinic, {
					from: "clinicId",
					to: "id",
				}),
				medicalRecords: rel.hasMany(MedicalRecord, {
					by: "patientId",
				}),
				prescriptions: rel.hasMany(Prescription, {
					by: "patientId",
				}),
				appointments: rel.hasMany(Appointment, {
					by: "patientId",
				}),
				files: rel.hasMany(File, { by: "ownerId" }),
			}),
			MedicalRecord: MedicalRecord.relations({
				clinic: rel.belongsTo(Clinic, {
					from: "clinicId",
					to: "id",
				}),
				patient: rel.belongsTo(Patient, {
					from: "patientId",
					to: "id",
				}),
				doctor: rel.belongsTo(Doctor, {
					from: "doctorId",
					to: "id",
				}),
				appointment: rel.belongsTo(Appointment, {
					from: "appointmentId",
					to: "id",
				}),
			}),
			Appointment: Appointment.relations({
				clinic: rel.belongsTo(Clinic, {
					from: "clinicId",
					to: "id",
				}),
				doctor: rel.belongsTo(Doctor, {
					from: "doctorId",
					to: "id",
				}),
				patient: rel.belongsTo(Patient, {
					from: "patientId",
					to: "id",
				}),
				medicalRecords: rel.hasMany(MedicalRecord, {
					by: "appointmentId",
				}),
				prescriptions: rel.hasMany(Prescription, {
					by: "appointmentId",
				}),
			}),
			Prescription: Prescription.relations({
				doctor: rel.belongsTo(Doctor, {
					from: "doctorId",
					to: "id",
				}),
				patient: rel.belongsTo(Patient, {
					from: "patientId",
					to: "id",
				}),
				appointment: rel.belongsTo(Appointment, {
					from: "appointmentId",
					to: "id",
				}),
			}),
			Notification: Notification.relations({
				clinic: rel.belongsTo(Clinic, {
					from: "recepientId",
					to: "id",
				}),
			}),
			File: File.relations({
				patient: rel.belongsTo(Patient, {
					from: "ownerId",
					to: "id",
				}),
			}),
		},
	};
});
