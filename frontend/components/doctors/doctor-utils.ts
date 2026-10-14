import type { Doctor } from "@/api/services/doctorsService";

export type DoctorForm = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
	specialty: string;
	licenseNumber: string;
	consultationDuration: string;
	consultationFee: string;
};

export const defaultDoctorForm: DoctorForm = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	phone: "",
	specialty: "",
	licenseNumber: "",
	consultationDuration: "",
	consultationFee: "",
};

export function doctorStatusClass(status?: string) {
	const normalizedStatus = status?.toLowerCase();
	if (status === "active")
		return "border-transparent bg-brand/10 text-brand";
	if (normalizedStatus === "inactive")
		return "border-transparent bg-accent/10 text-accent-strong";
	if (normalizedStatus === "pending")
		return "border-transparent bg-gold/15 text-ink";
	return "border-line text-ink-muted";
}

export function isDoctorInactive(doctor: Doctor) {
	return doctor.status?.toLowerCase() === "inactive";
}

export function doctorDisplayName(doctor: Doctor) {
	const name = [doctor.user?.firstName, doctor.user?.lastName]
		.filter(Boolean)
		.join(" ");
	return name || doctor.user?.email || "Unnamed doctor";
}

export function formatCurrency(value: number | string | undefined) {
	const amount = Number(value ?? 0);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

export function formatDoctorDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
