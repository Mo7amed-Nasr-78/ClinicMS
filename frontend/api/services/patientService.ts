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
	relativeName: string | null;
	relativePhone: string | null;
	relativeRelation: string | null;
	status: string;
	allergies: string;
	clinicId: string;
	createdAt: string;
	updatedAt: string;
};

export type TodayPatient = Patient & {
	appointments: {
		id: string;
		appointmentDate: string;
		startTime: string;
		endTime: string;
		status: string;
	}[];
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
> & {
	relativeName?: string;
	relativePhone?: string;
	relativeRelation?: string;
};

export type UpdatePatientPayload = Partial<CreatePatientPayload> & {
	status?: Patient["status"];
};

export type PatientsResponse = {
	patients: Patient[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export type PatientMedicalRecord = {
	id: string;
	diagnosis: string;
	symptoms: string;
	examination: string;
	treatment: string;
	notes: string;
	createdAt: string;
	doctor: {
		id: string;
		specialty: string;
		user: {
			firstName: string | null;
			lastName: string | null;
		};
	};
};

export type PatientPrescription = {
	id: string;
	medications: string;
	notes: string;
	createdAt: string;
	doctor: {
		id: string;
		specialty: string;
		user: {
			firstName: string | null;
			lastName: string | null;
		};
	};
};

export async function getPatientById(
	patientId: string,
	signal?: AbortSignal,
): Promise<Patient> {
	const { data } = await httpClient.get<Patient>(`/patients/${patientId}`, {
		signal,
	});
	return data;
}

export async function getPatientMedicalRecords(
	patientId: string,
	signal?: AbortSignal,
): Promise<PatientMedicalRecord[]> {
	const { data } = await httpClient.get<PatientMedicalRecord[]>(
		`/patients/${patientId}/medical-records`,
		{ signal },
	);
	return data;
}

export async function getPatientPrescriptions(
	patientId: string,
	signal?: AbortSignal,
): Promise<PatientPrescription[]> {
	const { data } = await httpClient.get<PatientPrescription[]>(
		`/patients/${patientId}/prescriptions`,
		{ signal },
	);
	return data;
}

export async function getPatients(
	page = 1,
	limit = 20,
	signal?: AbortSignal,
	status?: string,
): Promise<PatientsResponse> {
	const { data } = await httpClient.get<PatientsResponse>("/patients", {
		params: { page, limit, ...(status ? { status } : {}) },
		signal,
	});
	return data;
}

export async function getPatientsToday(
	date: string,
	signal?: AbortSignal,
): Promise<TodayPatient[]> {
	const { data } = await httpClient.get<TodayPatient[]>("/patients/today", {
		params: { date },
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
