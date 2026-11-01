"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createVisitType,
	deactivateVisitType,
	getVisitTypes,
	updateVisitType,
	type VisitTypePayload,
} from "@/api/services/visitTypesService";

export function useVisitTypes(enabled = true) {
	const query = useQuery({
		queryKey: ["visit-types"],
		queryFn: ({ signal }) => getVisitTypes(signal),
		enabled,
	});

	return {
		visitTypes: query.data ?? [],
		loading: query.isPending,
		error: query.error ? getApiErrorMessage(query.error) : null,
		refetch: () => query.refetch(),
	};
}

export function useCreateVisitType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: VisitTypePayload) =>
			createVisitType(payload),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["visit-types"] }),
	});
}

export function useUpdateVisitType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: VisitTypePayload;
		}) => updateVisitType(id, payload),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["visit-types"] }),
	});
}

export function useDeactivateVisitType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateVisitType(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["visit-types"] }),
	});
}
