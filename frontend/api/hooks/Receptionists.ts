"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createReceptionist,
	deactivateReceptionist,
	getReceptionistApiErrorMessage,
	getReceptionists,
	updateReceptionist,
	type CreateReceptionistPayload,
	type UpdateReceptionistPayload,
} from "@/api/services/receptionistsService";

export function useReceptionists() {
	const query = useQuery({
		queryKey: ["receptionists"],
		queryFn: ({ signal }) => getReceptionists(signal),
	});

	return {
		receptionists: query.data ?? [],
		loading: query.isPending,
		error: query.error
			? getReceptionistApiErrorMessage(query.error)
			: null,
		refetch: () => query.refetch(),
	};
}

export function useCreateReceptionist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateReceptionistPayload) =>
			createReceptionist(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["receptionists"],
			});
		},
	});
}

export function useUpdateReceptionist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateReceptionistPayload;
		}) => updateReceptionist(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["receptionists"],
			});
		},
	});
}

export function useDeleteReceptionist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateReceptionist(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["receptionists"],
			});
		},
	});
}
