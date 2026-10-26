import { httpClient } from "@/api/httpClient";

export type BillStatus = "unpaid" | "paid" | "cancelled";

export type CreateBillPayload = {
	patientId: string;
	appointmentId?: string;
	amount: number;
	description: string;
	dueDate?: string;
	notes?: string;
};

export type UpdateBillPayload = Partial<
	Omit<CreateBillPayload, "appointmentId" | "dueDate" | "notes">
> & {
	status?: BillStatus;
	appointmentId?: string | null;
	dueDate?: string | null;
	notes?: string | null;
};

export type Bill = {
	id: string;
	clinicId: string;
	patientId: string;
	appointmentId: string | null;
	amount: string;
	description: string;
	status: BillStatus;
	dueDate: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

export type BillWithRelations = Bill & {
	patient: {
		id: string;
		firstName: string;
		lastName: string;
		phone: string | null;
		email: string | null;
	};
	appointment: {
		id: string;
		appointmentDate: string;
		status: string;
	} | null;
};

export type BillsResponse = {
	bills: BillWithRelations[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export async function getBills(
	page = 1,
	limit = 20,
	signal?: AbortSignal,
	status?: BillStatus,
): Promise<BillsResponse> {
	const { data } = await httpClient.get<BillsResponse>("/bills", {
		params: { page, limit, ...(status ? { status } : {}) },
		signal,
	});
	return data;
}

export async function createBill(
	payload: CreateBillPayload,
): Promise<Bill> {
	const { data } = await httpClient.post<Bill>("/bills", payload);
	return data;
}

export async function updateBill(
	billId: string,
	payload: UpdateBillPayload,
): Promise<Bill> {
	const { data } = await httpClient.patch<Bill>(
		`/bills/${billId}`,
		payload,
	);
	return data;
}

export async function deleteBill(billId: string): Promise<void> {
	await httpClient.delete(`/bills/${billId}`);
}
