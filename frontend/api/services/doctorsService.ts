import axios from "axios";
import { httpClient } from "@/api/httpClient";

export type CreateDoctorPayload = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
	specialty: string;
	licenseNumber: string;
	consultationDuration: number;
	consultationFee: number;
};

export type UpdateDoctorPayload = Partial<
	Pick<
		CreateDoctorPayload,
		| "firstName"
		| "lastName"
		| "phone"
		| "specialty"
		| "licenseNumber"
		| "consultationDuration"
		| "consultationFee"
	>
>;

export type Doctor = {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	specialty: string;
	licenseNumber: string;
	bio?: string | null;
	consultationDuration: number | string;
	consultationFee: number | string;
	status?: "active" | "inactive" | "pending" | string;
	userId?: string;
	clinicId?: string;
	createdAt?: string;
	updatedAt?: string;
	user?: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
		phone: string | null;
		avatar: string | null;
	};
};

export type DoctorAvailability = {
	doctorId: string;
	date: string;
	slots: { startTime: string; endTime: string }[];
};

export type ClinicDoctorsResponse = {
	doctors: Doctor[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export type DoctorFilters = {
	specialty?: string;
	licenseNumber?: string;
	bio?: string;
	consultationDuration?: number;
	consultationFee?: number;
	status?: string;
};

export type ClinicDoctorsQueryParams = DoctorFilters;

export async function createDoctor(
	payload: CreateDoctorPayload,
): Promise<Doctor> {
	const { data } = await httpClient.post<Doctor>("/doctors", payload);
	return data;
}

export async function updateDoctor(
	id: string,
	payload: UpdateDoctorPayload,
): Promise<Doctor> {
	const { data } = await httpClient.patch<Doctor>(
		`/doctors/${id}`,
		payload,
	);
	return data;
}

export async function deactivateDoctor(id: string): Promise<Doctor> {
	const { data } = await httpClient.delete<Doctor>(`/doctors/${id}`);
	return data;
}

export async function getClinicDoctors(
	clinicId: string,
	page = 1,
	limit = 20,
	signal?: AbortSignal,
	queryParams: ClinicDoctorsQueryParams = {},
): Promise<ClinicDoctorsResponse> {
	const { data } = await httpClient.get<ClinicDoctorsResponse>(
		`/clinics/${clinicId}/doctors`,
		{ params: { page, limit, ...queryParams }, signal },
	);
	return data;
}

export async function getDoctorOptions(
	signal?: AbortSignal,
	queryParams: ClinicDoctorsQueryParams = {},
): Promise<Doctor[]> {
	const { data } = await httpClient.get<Doctor[]>("/doctors", {
		params: queryParams,
		signal,
	});
	return data;
}

export async function getDoctorAvailability(
	doctorId: string,
	date: string,
	signal?: AbortSignal,
): Promise<DoctorAvailability> {
	const { data } = await httpClient.get<DoctorAvailability>(
		`/doctors/${doctorId}/availability`,
		{ params: { date }, signal },
	);
	return data;
}

export function getApiErrorMessage(err: unknown): string {
	if (axios.isAxiosError(err)) {
		const message = err.response?.data?.message;
		if (Array.isArray(message)) {
			return message
				.filter(
					(detail): detail is string =>
						typeof detail === "string",
				)
				.join(" ");
		}
		if (typeof message === "string" && message.trim()) return message;
		return err.request
			? "We couldn't reach the server. Check your connection and try again."
			: "Something went wrong. Please try again.";
	}
	return "Something went wrong. Please try again.";
}
