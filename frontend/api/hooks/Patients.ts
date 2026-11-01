"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	createPatient,
	deletePatient,
	getPatientById,
	getPatients,
	getPatientsToday,
	updatePatient,
	type CreatePatientPayload,
	type Patient,
	type UpdatePatientPayload,
} from "@/api/services/patientService";

type PatientDetailDoctor = {
	specialty?: string;
	user?: { firstName: string | null; lastName: string | null };
};

export type PatientDetails = Patient & {
	appointments?: {
		id: string;
		doctorId: string;
		appointmentDate: string;
		startAt: string;
		endAt: string;
		status: string;
		reason: string;
		doctor?: PatientDetailDoctor;
	}[];
	medicalRecords?: {
		id: string;
		diagnosis: string;
		treatment: string;
		notes: string;
		createdAt: string;
		doctor?: PatientDetailDoctor;
	}[];
	prescriptions?: {
		id: string;
		medications: string;
		notes: string;
		createdAt: string;
		doctor?: PatientDetailDoctor;
	}[];
};

export function usePatients(page = 1, limit = 20, status?: string) {
	const query = useQuery({
		queryKey: ["patients", page, limit, status],
		queryFn: ({ signal }) => getPatients(page, limit, signal, status),
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

export function useTodayPatients() {
	const today = format(new Date(), "yyyy-MM-dd");
	const query = useQuery({
		queryKey: ["patients", "today", today],
		queryFn: ({ signal }) => getPatientsToday(today, signal),
	});

	return {
		patients: query.data ?? [],
		loading: query.isPending,
		error: query.error ? getApiErrorMessage(query.error) : null,
	};
}

export function usePatientDetails(patientId: string) {
	return useQuery<PatientDetails>({
		queryKey: ["patient", patientId],
		queryFn: ({ signal }) => getPatientById(patientId, signal),
		enabled: Boolean(patientId),
	});
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
