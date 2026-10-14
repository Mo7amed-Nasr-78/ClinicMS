import { httpClient } from "@/api/httpClient";

export type DoctorSchedule = {
	id: string;
	doctorId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	isActive: boolean;
	slotDuration: number;
	effectiveFrom: string;
	effectiveTo: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateDoctorSchedulePayload = Pick<
	DoctorSchedule,
	| "doctorId"
	| "dayOfWeek"
	| "startTime"
	| "endTime"
	| "isAvailable"
	| "isActive"
	| "slotDuration"
	| "effectiveFrom"
	| "effectiveTo"
>;

export type UpdateDoctorSchedulePayload = Partial<
	Pick<
		DoctorSchedule,
		| "dayOfWeek"
		| "startTime"
		| "endTime"
		| "isAvailable"
		| "isActive"
		| "slotDuration"
		| "effectiveFrom"
		| "effectiveTo"
	>
>;

export async function getDoctorSchedules(
	signal?: AbortSignal,
): Promise<DoctorSchedule[]> {
	const { data } = await httpClient.get<DoctorSchedule[]>(
		"/doctor-schedules",
		{ signal },
	);
	return data;
}

export async function getDoctorSchedulesForDoctor(
	doctorId: string,
	signal?: AbortSignal,
): Promise<DoctorSchedule[]> {
	const { data } = await httpClient.get<DoctorSchedule[]>(
		`/doctors/${doctorId}/schedules`,
		{ signal },
	);
	return data;
}

export async function createDoctorSchedule(
	payload: CreateDoctorSchedulePayload,
): Promise<DoctorSchedule> {
	const { data } = await httpClient.post<DoctorSchedule>(
		"/doctor-schedules",
		payload,
	);
	return data;
}

export async function updateDoctorSchedule(
	id: string,
	payload: UpdateDoctorSchedulePayload,
): Promise<DoctorSchedule> {
	const { data } = await httpClient.patch<DoctorSchedule>(
		`/doctor-schedules/${id}`,
		payload,
	);
	return data;
}

export async function deleteDoctorSchedule(id: string): Promise<void> {
	await httpClient.delete(`/doctor-schedules/${id}`);
}
