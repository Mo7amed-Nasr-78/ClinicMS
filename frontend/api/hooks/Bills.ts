"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createBill,
	deleteBill,
	getBills,
	recordBillPayment,
	updateBill,
	type BillStatus,
	type CreateBillPayload,
	type PaymentMethod,
	type UpdateBillPayload,
} from "@/api/services/billsService";

export function useBills(
	page = 1,
	limit = 20,
	status?: BillStatus,
) {
	const query = useQuery({
		queryKey: ["bills", page, limit, status],
		queryFn: ({ signal }) => getBills(page, limit, signal, status),
	});

	return {
		bills: query.data?.bills ?? [],
		pagination: query.data?.pagination ?? {
			page,
			limit,
			total: 0,
			totalPages: 0,
		},
		loading: query.isPending,
		error: query.error ? getApiErrorMessage(query.error) : null,
		refetch: () => query.refetch(),
	};
}

export function useCreateBill() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateBillPayload) => createBill(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
		},
	});
}

export function useUpdateBill() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			billId,
			payload,
		}: {
			billId: string;
			payload: UpdateBillPayload;
		}) => updateBill(billId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
		},
	});
}

export function useDeleteBill() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (billId: string) => deleteBill(billId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
		},
	});
}

export function useRecordBillPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			billId,
			method,
		}: {
			billId: string;
			method: PaymentMethod;
		}) => recordBillPayment(billId, method),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
		},
	});
}
