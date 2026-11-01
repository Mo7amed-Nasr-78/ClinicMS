import type {
	Appointment,
	CreateAppointmentPayload,
} from "@/api/services/appointmentsService";
import type { Doctor } from "@/api/services/doctorsService";
import type { Patient } from "@/api/services/patientService";

export type AppointmentForm = Omit<
	CreateAppointmentPayload,
	"appointmentDate" | "startTime" | "endTime"
> & {
	appointmentDate: string;
	startTime: string;
	endTime: string;
};

export const emptyForm: AppointmentForm = {
	doctorId: "",
	patientId: "",
	visitTypeId: "",
	appointmentDate: "",
	startTime: "",
	endTime: "",
	status: "scheduled",
	reason: "",
	notes: "",
};

export function patientName(
	patient?: Pick<Patient, "firstName" | "lastName"> & {
		email?: string | null;
	},
) {
	if (!patient) return "Unknown patient";
	return (
		[patient.firstName, patient.lastName].filter(Boolean).join(" ") ||
		"Unnamed patient"
	);
}

export function doctorName(
	doctor?: Pick<Doctor, "id"> &
		Partial<Pick<Doctor, "firstName" | "lastName" | "email">> & {
			user?: Partial<NonNullable<Doctor["user"]>>;
		},
) {
	if (!doctor) return "Unknown doctor";
	const firstName = doctor.user?.firstName ?? doctor.firstName;
	const lastName = doctor.user?.lastName ?? doctor.lastName;
	return (
		[firstName, lastName].filter(Boolean).join(" ") ||
		doctor.user?.email ||
		doctor.email ||
		"Unnamed doctor"
	);
}

export function toDateInput(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}

export function toTimeInput(value: string) {
	const timeOnly = /^(\d{2}):(\d{2})$/.exec(value);
	if (timeOnly) return value;

	const twelveHourTime = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(
		value,
	);
	if (twelveHourTime) {
		const hour = Number(twelveHourTime[1]) % 12;
		const normalizedHour =
			hour + (twelveHourTime[3].toUpperCase() === "PM" ? 12 : 0);
		return `${String(normalizedHour).padStart(2, "0")}:${twelveHourTime[2]}`;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function formatDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

export function formatTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function appointmentStatusClass(status: Appointment["status"]) {
	if (status === "confirmed")
		return "border-transparent bg-brand/10 text-brand";
	if (status === "completed")
		return "border-transparent bg-gold/15 text-ink";
	if (status === "cancelled")
		return "border-transparent bg-accent/10 text-accent-strong";
	return "border-line text-ink-muted";
}
