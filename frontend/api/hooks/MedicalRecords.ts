"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createMedicalRecord,
	type CreateMedicalRecordPayload,
} from "@/api/services/medicalRecordsService";

export function useCreateMedicalRecord(patientId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateMedicalRecordPayload) =>
			createMedicalRecord(payload),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["patient", patientId],
			}),
	});
}
