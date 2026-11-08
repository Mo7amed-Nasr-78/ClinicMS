export {
	AppointmentSource as Appointment_Source,
	AppointmentStatus as appointment_Status,
	BillStatus as bill_Status,
	FileRelatedType as File_Related_Type,
	Gender,
	LabOrderStatus as LabOrder_Status,
	PatientStatus as Patient_Status,
	PaymentMethod as Payment_Method,
	PrescriptionStatus as Prescription_Status,
	RecordStatus as Record_Status,
	Status,
	UserRole as Roles,
} from "./generated/client/client.ts";

export type {
	AppointmentStatus,
	BillStatus,
	PatientStatus,
	PaymentMethod,
} from "./generated/client/client.ts";
