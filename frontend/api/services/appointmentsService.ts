import { httpClient } from "@/api/httpClient";

export type CreateAppointmentPayload = {
	doctorId: string;
	patientId: string;
	appointmentDate: string;
	startTime: string;
	endTime: string;
	status: string;
	reason: string;
	notes: string;
};

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export type Appointment = CreateAppointmentPayload & {
	id: string;
	clinicId: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
};

export type AppointmentWithRelations = Appointment & {
	patient: {
		id: string;
		firstName: string;
		lastName: string;
		email: string | null;
		status: "upcoming" | "waiting" | "in_room" | "complete";
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

export type AppointmentsResponse = {
	appointments: AppointmentWithRelations[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export type AppointmentFilters = {
	appointmentDate?: string;
	status?: string;
};

export async function getAppointments(
	page = 1,
	limit = 20,
	signal?: AbortSignal,
	filters?: AppointmentFilters,
): Promise<AppointmentsResponse> {
	const { data } = await httpClient.get<AppointmentsResponse>(
		"/appointments",
		{ params: { page, limit, ...filters }, signal },
	);
	return data;
}

export async function createAppointment(
	payload: CreateAppointmentPayload,
): Promise<Appointment> {
	const { data } = await httpClient.post<Appointment>(
		"/appointments",
		payload,
	);
	return data;
}

export async function updateAppointment(
	appointmentId: string,
	payload: UpdateAppointmentPayload,
): Promise<Appointment> {
	const { data } = await httpClient.patch<Appointment>(
		`/appointments/${appointmentId}`,
		payload,
	);
	return data;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
	await httpClient.delete(`/appointments/${appointmentId}`);
}
