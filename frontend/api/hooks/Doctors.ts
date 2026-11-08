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
	type ClinicDoctorsQueryParams,
	type UpdateDoctorPayload,
} from "@/api/services/doctorsService";

export function useDoctors(
	page = 1,
	limit = 20,
	enabled = true,
	queryParams: ClinicDoctorsQueryParams = {},
) {
	const query = useQuery({
		queryKey: ["doctors", page, limit, queryParams],
		enabled,
		queryFn: async ({ signal }) => {
			const clinic = await getMyClinic();
			return getClinicDoctors(clinic.id, page, limit, signal, queryParams);
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

export function useDoctorOptions(
	queryParams: ClinicDoctorsQueryParams = {},
) {
	const query = useQuery({
		queryKey: ["doctor-options", queryParams],
		queryFn: ({ signal }) => getDoctorOptions(signal, queryParams),
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
			queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
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
			queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
		},
	});
}

export function useDeleteDoctor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateDoctor(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["doctors"] });
			queryClient.invalidateQueries({ queryKey: ["doctor-options"] });
		},
	});
}
