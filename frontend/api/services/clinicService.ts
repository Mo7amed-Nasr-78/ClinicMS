import axios from "axios";
import { httpClient } from "@/api/httpClient";

export type CreateClinicPayload = {
	name: string;
	email: string;
	phone: string;
	address: string;
	logo: File | null;
};

export type Clinic = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	logoUrl?: string | null;
};

export type ClinicUser = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	phone: string | null;
	role: string;
	avatar: string | null;
	status: string;
	permissions: string[];
};

export type MyClinic = Clinic & {
	logo: string;
	ownerId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	user: ClinicUser;
};

export async function getMyClinic(): Promise<MyClinic> {
	const { data } = await httpClient.get<MyClinic>("/clinics/me");
	return data;
}

/**
 * POST /clinics — multipart/form-data so the logo can travel with the fields.
 * Adjust the path / field names to match your backend contract.
 * (Axios sets the multipart boundary itself — don't set Content-Type by hand.)
 */
export async function createClinic(
	payload: CreateClinicPayload,
): Promise<Clinic> {
	const form = new FormData();
	form.append("name", payload.name);
	form.append("email", payload.email);
	form.append("phone", payload.phone);
	form.append("address", payload.address);
	if (payload.logo) form.append("logo", payload.logo);

	const { data } = await httpClient.post<Clinic>("/clinics", form);
	return data;
}

export function getApiErrorMessage(err: unknown): string {
	if (axios.isAxiosError(err)) {
		return (
			err.response?.data?.message ??
			(err.request
				? "We couldn't reach the server. Check your connection and try again."
				: "Something went wrong. Please try again.")
		);
	}
	return "Something went wrong. Please try again.";
}
