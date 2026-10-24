import axios from "axios";
import { httpClient } from "@/api/httpClient";

export type ReceptionistUser = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	phone: string | null;
	avatar: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
};

export type Receptionist = {
	id: string;
	status: string;
	userId: string;
	clinicId: string;
	createdAt: string;
	updatedAt: string;
	user: ReceptionistUser;
};

export type CreateReceptionistPayload = {
	firstName?: string;
	lastName?: string;
	email: string;
	password: string;
	phone?: string;
};

export type UpdateReceptionistPayload = {
	firstName?: string;
	lastName?: string;
	phone?: string;
	status?: string;
};

export async function getReceptionists(
	signal?: AbortSignal,
): Promise<Receptionist[]> {
	const { data } = await httpClient.get<Receptionist[]>(
		"/receptionists",
		{ signal },
	);
	return data;
}

export async function createReceptionist(
	payload: CreateReceptionistPayload,
): Promise<Receptionist> {
	const { data } = await httpClient.post<Receptionist>(
		"/receptionists",
		payload,
	);
	return data;
}

export async function updateReceptionist(
	id: string,
	payload: UpdateReceptionistPayload,
): Promise<Receptionist> {
	const { data } = await httpClient.patch<Receptionist>(
		`/receptionists/${id}`,
		payload,
	);
	return data;
}

export async function deactivateReceptionist(
	id: string,
): Promise<Receptionist> {
	const { data } = await httpClient.delete<Receptionist>(
		`/receptionists/${id}`,
	);
	return data;
}

export function getReceptionistApiErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (Array.isArray(message)) {
			return message
				.filter(
					(detail): detail is string =>
						typeof detail === "string",
				)
				.join(" ");
		}
		if (typeof message === "string" && message.trim()) return message;
		if (error.request) {
			return "We couldn't reach the server. Check your connection and try again.";
		}
	}

	return "Something went wrong. Please try again.";
}
