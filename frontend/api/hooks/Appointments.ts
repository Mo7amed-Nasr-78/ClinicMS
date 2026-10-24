"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createAppointment,
	deleteAppointment,
	getAppointments,
	updateAppointment,
	type CreateAppointmentPayload,
	type AppointmentFilters,
	type UpdateAppointmentPayload,
} from "@/api/services/appointmentsService";

export function useAppointments(
	page = 1,
	limit = 20,
	filters?: AppointmentFilters,
) {
	const query = useQuery({
		queryKey: ["appointments", page, limit, filters],
		queryFn: ({ signal }) =>
			getAppointments(page, limit, signal, filters),
	});

	return {
		appointments: query.data?.appointments ?? [],
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

export function useCreateAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateAppointmentPayload) =>
			createAppointment(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
		},
	});
}

export function useUpdateAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			appointmentId,
			payload,
		}: {
			appointmentId: string;
			payload: UpdateAppointmentPayload;
		}) => updateAppointment(appointmentId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
			queryClient.invalidateQueries({ queryKey: ["patients", "today"] });
		},
	});
}

export function useDeleteAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (appointmentId: string) =>
			deleteAppointment(appointmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["appointments"] });
		},
	});
}
