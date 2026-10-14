"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createDoctorSchedule,
	deleteDoctorSchedule,
	getDoctorSchedules,
	updateDoctorSchedule,
	type CreateDoctorSchedulePayload,
	type UpdateDoctorSchedulePayload,
} from "@/api/services/doctorScheduleService";

export function useDoctorSchedules() {
	const query = useQuery({
		queryKey: ["doctor-schedules"],
		queryFn: ({ signal }) => getDoctorSchedules(signal),
	});

	return {
		schedules: query.data ?? [],
		loading: query.isPending,
		error: query.error ? getApiErrorMessage(query.error) : null,
		refetch: () => query.refetch(),
	};
}

export function useCreateDoctorSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateDoctorSchedulePayload) =>
			createDoctorSchedule(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["doctor-schedules"],
			});
		},
	});
}

export function useUpdateDoctorSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateDoctorSchedulePayload;
		}) => updateDoctorSchedule(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["doctor-schedules"],
			});
		},
	});
}

export function useDeleteDoctorSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteDoctorSchedule(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["doctor-schedules"],
			});
		},
	});
}
