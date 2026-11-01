import type { CreateAppointmentPayload } from "@/api/services/appointmentsService";
import type { Doctor } from "@/api/services/doctorsService";
import type {
	CreatePatientPayload,
	Patient,
} from "@/api/services/patientService";

export type PatientForm = CreatePatientPayload;
export type PatientFormErrors = Partial<Record<keyof PatientForm, string>>;

export type PatientAppointmentForm = Omit<
	CreateAppointmentPayload,
	"patientId" | "appointmentDate" | "startTime" | "endTime"
> & {
	appointmentDate: string;
	startTime: string;
	endTime: string;
};

export const defaultPatientForm: PatientForm = {
	firstName: "",
	lastName: "",
	dateOfBirth: "",
	gender: "",
	bloodType: "",
	phone: "",
	email: "",
	address: "",
	emergencyContact: "",
	allergies: "",
};

export const defaultPatientAppointmentForm: PatientAppointmentForm = {
	doctorId: "",
	visitTypeId: "",
	appointmentDate: "",
	startTime: "",
	endTime: "",
	status: "scheduled",
	reason: "",
	notes: "",
};

export function displayName(firstName: string, lastName: string) {
	return (
		[firstName, lastName].filter(Boolean).join(" ") || "Unnamed patient"
	);
}

export function doctorOptionLabel(doctor: Doctor) {
	const name = [
		doctor.user?.firstName ?? doctor.firstName,
		doctor.user?.lastName ?? doctor.lastName,
	]
		.filter(Boolean)
		.join(" ");
	return name || doctor.user?.email || doctor.email || "Unnamed doctor";
}

export function displayLabel(value: string) {
	if (!value) return "Not provided";
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function patientStatusClass(status: string) {
	if (status === "active")
		return "border-transparent bg-brand/10 text-brand";
	if (status === "upcoming")
		return "border-transparent bg-gold/15 text-ink";
	if (status === "inactive")
		return "border-transparent bg-accent/10 text-accent-strong";
	return "border-line text-ink-muted";
}
