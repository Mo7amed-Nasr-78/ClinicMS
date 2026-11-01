export const Roles = {
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

export const Appointment_Source = {
	RECEPTION: "reception",
	ONLINE: "online",
	WALK_IN: "walk_in",
} as const;

export const Bill_Status = {
	UNPAID: "unpaid",
	PARTIAL: "partial",
	PAID: "paid",
} as const;

export const Payment_Method = {
	CASH: "cash",
	CARD: "card",
	INSURANCE: "insurance",
	OTHER: "other",
} as const;

export const Record_Status = {
	DRAFT: "draft",
	SIGNED: "signed",
} as const;

export const Prescription_Status = {
	PENDING: "pending",
	APPROVED: "approved",
	DENIED: "denied",
} as const;

export const LabOrder_Status = {
	ORDERED: "ordered",
	RESULTED: "resulted",
	CANCELLED: "cancelled",
} as const;

export const File_Related_Type = {
	MEDICAL_RECORD: "medical_record",
	PRESCRIPTION: "prescription",
	LAB_RESULT: "lab_result",
	BILL: "bill",
	OTHER: "other",
} as const;
