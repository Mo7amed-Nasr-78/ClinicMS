import { httpClient } from "@/api/httpClient";

export type CreateMedicalRecordPayload = {
	patientId: string;
	doctorId: string;
	appointmentId: string;
	diagnosis: string;
	symptoms: string;
	examination: string;
	treatment: string;
	notes: string;
};

export async function createMedicalRecord(
	payload: CreateMedicalRecordPayload,
): Promise<void> {
	await httpClient.post("/medical-records", payload);
}
