import { enumType, member } from "@prisma/orm-postgres/contract-builder";

export const Roles  ={
	ADMIN: "admin",
	RECEPTIONIST: "receptionist",
	DOCTOR: "doctor",
	PATIENT: "patient",
} as const;

export const Status = {
	ACTIVE: "active",
	INACTIVE: "inActive",
	SUSPENEDED: "suspended",
} as const;

export const Gender = {
	MALE: "male",
	FEMALE: "female",
} as const;

export const Patient_Status = {
	UPCOMING: "upcoming",
	WAITING: "waiting",
	IN_ROOM: "in_room",
	COMPLETE: "complete",
} as const;

export const appointment_Status = {
	INWALK: "inWalk",
	SCHEDULED: "scheduled",
	TELMEDICINE:"Telemedicine",
	FOLLOWUP: "followUp",
} as const;

const pgText = {
	codecId: "pg/text@1",
	nativeType: "text",
} as const;

export const UserRole = enumType(
	"user_role",
	pgText,
	member("admin", Roles.ADMIN),
	member("receptionist", Roles.RECEPTIONIST),
	member("doctor", Roles.DOCTOR),
	member("patient", Roles.PATIENT),
);

export const UserStatus = enumType(
	"user_status",
	pgText,
	member("active", Status.ACTIVE),
	member("inActive", Status.INACTIVE),
	member("suspended", Status.SUSPENEDED),
);

export const PatientGender = enumType(
	"patient_gender",
	pgText,
	member("male", Gender.MALE),
	member("female", Gender.FEMALE),
);

export const PatientStatus = enumType(
	"patient_status",
	pgText,
	member("upcoming", Patient_Status.UPCOMING),
	member("waiting", Patient_Status.WAITING),
	member("in_room", Patient_Status.IN_ROOM),
	member("complete", Patient_Status.COMPLETE),
);

export const AppointmentStatus = enumType(
	"appointment_status",
	pgText,
	member("inWalk", appointment_Status.INWALK),
	member("scheduled", appointment_Status.SCHEDULED),
	member("telemedicine", appointment_Status.TELMEDICINE),
	member("followUp", appointment_Status.FOLLOWUP),
);