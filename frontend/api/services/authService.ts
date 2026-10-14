import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type RegisterPayload = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

/**
 * POST /auth/register — adjust the path / field names to match your backend.
 */
export async function registerUser(payload: RegisterPayload) {
	const { data } = await axios.post(`${API_URL}/auth/register`, payload, {
		withCredentials: true,
	});
	return data;
}
