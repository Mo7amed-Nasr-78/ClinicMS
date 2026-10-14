"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createPatient,
	deletePatient,
	getPatients,
	updatePatient,
	type CreatePatientPayload,
	type UpdatePatientPayload,
} from "@/api/services/patientService";

export function usePatients(page = 1, limit = 20) {
	const query = useQuery({
		queryKey: ["patients", page, limit],
		queryFn: ({ signal }) => getPatients(page, limit, signal),
	});

	return {
		patients: query.data?.patients ?? [],
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

export function useCreatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePatientPayload) =>
			createPatient(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
		},
	});
}

export function useUpdatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			patientId,
			payload,
		}: {
			patientId: string;
			payload: UpdatePatientPayload;
		}) => updatePatient(patientId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
		},
	});
}

export function useDeletePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (patientId: string) => deletePatient(patientId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
		},
	});
}
