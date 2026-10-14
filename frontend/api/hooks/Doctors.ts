"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyClinic } from "@/api/services/clinicService";
import {
	createDoctor,
	deactivateDoctor,
	getApiErrorMessage,
	getClinicDoctors,
	getDoctorOptions,
	updateDoctor,
	type CreateDoctorPayload,
	type UpdateDoctorPayload,
} from "@/api/services/doctorsService";

export function useDoctors(page = 1, limit = 20, enabled = true) {
	const query = useQuery({
		queryKey: ["doctors", page, limit],
		enabled,
		queryFn: async ({ signal }) => {
			const clinic = await getMyClinic();
			return getClinicDoctors(clinic.id, page, limit, signal);
		},
	});

	return {
		doctors: enabled ? (query.data?.doctors ?? []) : [],
		pagination: query.data?.pagination ?? {
			page,
			limit,
			total: 0,
			totalPages: 0,
		},
		loading: enabled && query.isPending,
		error:
			enabled && query.error
				? getApiErrorMessage(query.error)
				: null,
		refetch: () => query.refetch(),
	};
}

export function useDoctorOptions() {
	const query = useQuery({
		queryKey: ["doctor-options"],
		queryFn: ({ signal }) => getDoctorOptions(signal),
	});

	return {
		doctors: query.data ?? [],
		loading: query.isPending,
		error: query.error ? getApiErrorMessage(query.error) : null,
	};
}

export function useCreateDoctor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateDoctorPayload) => createDoctor(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["doctors"] });
		},
	});
}

export function useUpdateDoctor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateDoctorPayload;
		}) => updateDoctor(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["doctors"] });
		},
	});
}

export function useDeleteDoctor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateDoctor(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["doctors"] });
		},
	});
}
