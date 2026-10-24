import type { Receptionist } from "@/api/services/receptionistsService";

export type ReceptionistForm = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
	status: string;
};

export const defaultReceptionistForm: ReceptionistForm = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	phone: "",
	status: "active",
};

export function receptionistName(receptionist: Receptionist) {
	const name = [
		receptionist.user.firstName,
		receptionist.user.lastName,
	]
		.filter(Boolean)
		.join(" ");
	return name || receptionist.user.email || "Unnamed receptionist";
}

export function receptionistStatusClass(status?: string) {
	switch (status?.toLowerCase()) {
		case "active":
			return "border-transparent bg-brand/10 text-brand";
		case "inactive":
		case "suspended":
			return "border-transparent bg-accent/10 text-accent-strong";
		default:
			return "border-line text-ink-muted";
	}
}

export function receptionistStatusLabel(status?: string) {
	switch (status?.toLowerCase()) {
		case "inactive":
			return "Inactive";
		case "suspended":
			return "Suspended";
		case "active":
			return "Active";
		default:
			return status || "Unknown";
	}
}

export function formatReceptionistDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
