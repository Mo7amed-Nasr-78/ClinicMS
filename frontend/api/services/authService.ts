import axios from "axios";
import { API_BASE_URL } from "../httpClient";

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
	const { data } = await axios.post(
		`${API_BASE_URL}/auth/register`,
		payload,
		{
			withCredentials: true,
		},
	);
	return data;
}
