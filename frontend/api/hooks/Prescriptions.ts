"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createPrescription,
	type CreatePrescriptionPayload,
} from "@/api/services/prescriptionsService";

export function useCreatePrescription(patientId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePrescriptionPayload) =>
			createPrescription(payload),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["patient", patientId],
			}),
	});
}
