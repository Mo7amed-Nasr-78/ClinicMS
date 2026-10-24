import { httpClient } from "@/api/httpClient";

export type CreatePrescriptionPayload = {
	patientId: string;
	doctorId: string;
	appointmentId: string;
	medications: string;
	notes: string;
};

export async function createPrescription(
	payload: CreatePrescriptionPayload,
): Promise<void> {
	await httpClient.post("/prescriptions", payload);
}
