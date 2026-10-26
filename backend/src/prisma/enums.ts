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
	NEW: "new",
	ACTIVE: "active",
	IN_ACTIVE: "inActive",
	ARCHIVED: "archived",
} as const;

export const appointment_Status = {
	SCHEDULED: "scheduled",
	CONFIRMED: "confirmed",
	CHECKED_IN: "checkedIn",
	IN_PROGRESS: "inProgress",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
	NO_SHOW: "noShow",
	RESCHEDULED: "rescheduled",
} as const;

export const bill_Status = {
	UNPAID: "unpaid",
	PAID: "paid",
	CANCELLED: "cancelled",
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
	member("new", Patient_Status.NEW),
	member("active", Patient_Status.ACTIVE),
	member("inActive", Patient_Status.IN_ACTIVE),
	member("archived", Patient_Status.ARCHIVED),
);

export const AppointmentStatus = enumType(
	"appointment_status",
	pgText,
	member("scheduled", appointment_Status.SCHEDULED),
	member("confirmed", appointment_Status.CONFIRMED),
	member("checkedIn", appointment_Status.CHECKED_IN),
	member("inProgress", appointment_Status.IN_PROGRESS),
	member("completed", appointment_Status.COMPLETED),
	member("cancelled", appointment_Status.CANCELLED),
	member("noShow", appointment_Status.NO_SHOW),
	member("rescheduled", appointment_Status.RESCHEDULED),
);

export const BillStatus = enumType(
	"bill_status",
	pgText,
	member("unpaid", bill_Status.UNPAID),
	member("paid", bill_Status.PAID),
	member("cancelled", bill_Status.CANCELLED),
);