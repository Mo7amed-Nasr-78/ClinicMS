import axios from "axios";
import { getSession } from "next-auth/react";

export const httpClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
	withCredentials: true,
});

httpClient.interceptors.request.use(async (config) => {
	const session = await getSession();
	if (session?.accessToken) {
		config.headers.set(
			"Authorization",
			`Bearer ${session.accessToken}`,
		);
	}

	return config;
});
