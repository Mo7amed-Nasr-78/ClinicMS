import { httpClient } from "@/api/httpClient";

export type Patient = {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	gender: string;
	bloodType: string;
	phone: string;
	email: string;
	address: string;
	emergencyContact: string;
	status: string;
	allergies: string;
	clinicId: string;
	createdAt: string;
	updatedAt: string;
};

export type CreatePatientPayload = Pick<
	Patient,
	| "firstName"
	| "lastName"
	| "dateOfBirth"
	| "gender"
	| "bloodType"
	| "phone"
	| "email"
	| "address"
	| "emergencyContact"
	| "allergies"
>;

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

export type PatientsResponse = {
	patients: Patient[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export async function getPatients(
	page = 1,
	limit = 20,
	signal?: AbortSignal,
): Promise<PatientsResponse> {
	const { data } = await httpClient.get<PatientsResponse>("/patients", {
		params: { page, limit },
		signal,
	});
	return data;
}

export async function createPatient(
	payload: CreatePatientPayload,
): Promise<Patient> {
	const { data } = await httpClient.post<Patient>("/patients", payload);
	return data;
}

export async function updatePatient(
	patientId: string,
	payload: UpdatePatientPayload,
): Promise<Patient> {
	const { data } = await httpClient.patch<Patient>(
		`/patients/${patientId}`,
		payload,
	);
	return data;
}

export async function deletePatient(patientId: string): Promise<void> {
	await httpClient.delete(`/patients/${patientId}`);
}
