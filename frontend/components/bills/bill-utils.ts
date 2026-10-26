import type { BillStatus } from "@/api/services/billsService";

export type BillForm = {
	patientId: string;
	appointmentId: string;
	amount: string;
	description: string;
	status: BillStatus;
	dueDate: string;
	notes: string;
};

export const emptyBillForm: BillForm = {
	patientId: "",
	appointmentId: "",
	amount: "",
	description: "",
	status: "unpaid",
	dueDate: "",
	notes: "",
};

export function formatBillStatus(status: string) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

export function billStatusClass(status: BillStatus) {
	switch (status) {
		case "paid":
			return "border-brand/30 bg-brand/10 text-brand-deep";
		case "cancelled":
			return "border-line bg-surface-2 text-ink-muted";
		default:
			return "border-accent/30 bg-accent/10 text-accent-strong";
	}
}

export function formatAmount(amount: string) {
	const value = Number(amount);
	return Number.isFinite(value) ? value.toFixed(2) : amount;
}
