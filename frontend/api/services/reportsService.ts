import { httpClient } from "@/api/httpClient";

export type DoctorReportDoctor = {
	id: string;
	specialty: string;
	licenseNumber: string;
	consultationDuration: string;
	consultationFee: string;
	status: string;
	createdAt: string;
	user: {
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
	};
};

export type DoctorReportFilters = {
	status?: string;
	specialty?: string;
	q?: string;
};

export type PatientReportPatient = {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	gender: string;
	bloodType: string;
	phone: string;
	email: string | null;
	address: string;
	emergencyContact: string;
	status: string;
	allergies: string;
	createdAt: string;
};

export type PatientReportFilters = {
	status?: string;
	gender?: string;
	q?: string;
};

export type TodayAppointmentReportItem = {
	id: string;
	clinicId: string;
	doctorId: string;
	patientId: string;
	appointmentDate: string;
	startAt: string;
	endAt: string;
	status: string;
	reason: string;
	notes: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	patient: {
		id: string;
		firstName: string;
		lastName: string;
		email: string | null;
		status: string;
	};
	doctor: {
		id: string;
		specialty: string;
		user: {
			firstName: string | null;
			lastName: string | null;
			email: string;
		};
	};
};

export async function getDoctorsReport(
	filters: DoctorReportFilters,
	signal?: AbortSignal,
): Promise<DoctorReportDoctor[]> {
	const { data } = await httpClient.get<DoctorReportDoctor[]>(
		"/reports/doctors",
		{ params: filters, signal },
	);
	return data;
}

export async function getPatientsReport(
	filters: PatientReportFilters,
	signal?: AbortSignal,
): Promise<PatientReportPatient[]> {
	const { data } = await httpClient.get<PatientReportPatient[]>(
		"/reports/patients",
		{ params: filters, signal },
	);
	return data;
}

export async function getTodaysAppointmentsReport(
	signal?: AbortSignal,
): Promise<TodayAppointmentReportItem[]> {
	const { data } = await httpClient.get<TodayAppointmentReportItem[]>(
		"/reports/appointments/today",
		{ signal },
	);
	return data;
}
