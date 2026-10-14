import type { Doctor } from "@/api/services/doctorsService";
import type {
	CreateDoctorSchedulePayload,
	DoctorSchedule,
	UpdateDoctorSchedulePayload,
} from "@/api/services/doctorScheduleService";

export const DAYS = [
	{ value: 0, label: "Sunday" },
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
] as const;

export type ScheduleForm = CreateDoctorSchedulePayload;
export type ScheduleEditForm = Required<UpdateDoctorSchedulePayload>;
export type ScheduleRow = DoctorSchedule & { doctor?: Doctor };

export function createEmptyScheduleForm(): ScheduleForm {
	return {
		doctorId: "",
		dayOfWeek: 1,
		startTime: "09:00",
		endTime: "11:00",
		isAvailable: true,
		isActive: true,
		slotDuration: 30,
		effectiveFrom: new Date().toISOString().slice(0, 10),
		effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
			.toISOString()
			.slice(0, 10),
	};
}

export function getDoctorName(doctor: Doctor) {
	const firstName = doctor.user?.firstName ?? doctor.firstName;
	const lastName = doctor.user?.lastName ?? doctor.lastName;
	return (
		[firstName, lastName].filter(Boolean).join(" ") || "Unnamed doctor"
	);
}

export function displayDay(day: number) {
	return DAYS.find((entry) => entry.value === day)?.label ?? "Unknown day";
}

export function displayTime(value: string) {
	if (/^\d{2}:\d{2}$/.test(value)) {
		const [hour, minute] = value.split(":").map(Number);
		return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function toInputTime(value: string) {
	if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value.slice(0, 5);
	return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function toInputDate(value: string) {
	return value.slice(0, 10);
}
