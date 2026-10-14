import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authApiUrl = process.env.AUTH_API_URL ?? "http://localhost:3000";

interface BackendAuthResponse {
	accessToken: string;
}

interface BackendRefreshResponse {
	accessToken: string;
}

interface CurrentUser {
	id?: string;
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	phone?: string | null;
	role?: string;
	avatar?: string | null;
	status?: string;
	permissions: string[];
}

interface CurrentUserResponse {
	user?: Omit<CurrentUser, "permissions"> & {
		permissions?: unknown;
	};
}

interface AuthToken {
	accessToken?: string;
	refreshToken?: string;
	accessTokenExpires?: number;
	currentUser?: CurrentUser | null;
	error?: string;
}

async function getCurrentUser(
	accessToken: string,
): Promise<CurrentUser | null> {
	try {
		const response = await fetch(`${authApiUrl}/clinics/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});
		if (!response.ok) return null;

		const data = (await response.json()) as CurrentUserResponse;
		if (!data.user) return null;

		return {
			...data.user,
			permissions: Array.isArray(data.user.permissions)
				? data.user.permissions.filter(
						(permission): permission is string =>
							typeof permission === "string",
					)
				: [],
		};
	} catch {
		return null;
	}
}

declare module "next-auth" {
	interface User {
		accessToken: string;
		refreshToken: string;
	}

	interface Session {
		user: DefaultSession["user"] & {
			id?: string;
			firstName?: string | null;
			lastName?: string | null;
			phone?: string | null;
			role?: string;
			avatar?: string | null;
			status?: string;
			permissions?: string[];
		};
		accessToken?: string;
		error?: string;
	}
}

async function refreshAccessToken(refreshToken: string) {
	const response = await fetch(`${authApiUrl}/auth/refresh`, {
		method: "POST",
		headers: {
			Cookie: `refreshToken=${refreshToken}`,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Refresh token was rejected");
	}

	const data = (await response.json()) as BackendRefreshResponse;
	if (!data.accessToken) {
		throw new Error("Refresh response did not include an access token");
	}

	return data.accessToken;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.AUTH_SECRET,
	providers: [
		Credentials({
			credentials: {
				action: { label: "Action", type: "text" },
				firstName: { label: "First name", type: "text" },
				lastName: { label: "Last name", type: "text" },
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const isRegistration =
					credentials.action === "register";
				if (
					typeof credentials.email !== "string" ||
					typeof credentials.password !== "string" ||
					(isRegistration &&
						(typeof credentials.firstName !==
							"string" ||
							typeof credentials.lastName !==
								"string"))
				) {
					return null;
				}

				const endpoint = isRegistration ? "register" : "signin";
				const body = isRegistration
					? {
							firstName: credentials.firstName,
							lastName: credentials.lastName,
							email: credentials.email,
							password: credentials.password,
						}
					: {
							email: credentials.email,
							password: credentials.password,
						};
				const response = await fetch(
					`${authApiUrl}/auth/${endpoint}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(body),
						cache: "no-store",
					},
				);

				if (!response.ok) {
					return null;
				}

				const data =
					(await response.json()) as BackendAuthResponse;
				const refreshTokenCookie = response.headers
					.getSetCookie()
					.find((cookie) =>
						cookie.startsWith("refreshToken="),
					);
				const refreshTokenFromCookie = refreshTokenCookie
					?.split(";", 1)[0]
					?.slice("refreshToken=".length);

				if (!data.accessToken || !refreshTokenFromCookie) {
					return null;
				}

				return {
					id: credentials.email,
					email: credentials.email,
					accessToken: data.accessToken,
					refreshToken: refreshTokenFromCookie,
				};
			},
		}),
	],
	session: { strategy: "jwt" },
	callbacks: {
		async jwt({ token, user, trigger }) {
			const authToken = token as typeof token & AuthToken;

			if (user) {
				authToken.accessToken = user.accessToken;
				authToken.refreshToken = user.refreshToken;
				authToken.accessTokenExpires =
					Date.now() + 14 * 60 * 1000;
				authToken.currentUser = await getCurrentUser(
					user.accessToken,
				);
				return token;
			}

			if (
				trigger !== "update" &&
				authToken.accessToken &&
				authToken.accessTokenExpires &&
				Date.now() < authToken.accessTokenExpires
			) {
				return token;
			}

			if (!authToken.refreshToken) {
				authToken.error = "RefreshAccessTokenError";
				return token;
			}

			try {
				authToken.accessToken = await refreshAccessToken(
					authToken.refreshToken,
				);
				authToken.accessTokenExpires =
					Date.now() + 14 * 60 * 1000;
				authToken.currentUser = await getCurrentUser(
					authToken.accessToken,
				);
				delete authToken.error;
			} catch {
				authToken.error = "RefreshAccessTokenError";
			}

			return token;
		},
		async session({ session, token }) {
			const authToken = token as typeof token & AuthToken;
			const currentUser = authToken.currentUser;
			session.accessToken = authToken.accessToken;
			if (currentUser) {
				if (currentUser.id) session.user.id = currentUser.id;
				session.user.firstName = currentUser.firstName;
				session.user.lastName = currentUser.lastName;
				session.user.email =
					currentUser.email ?? session.user.email;
				session.user.phone = currentUser.phone;
				session.user.role = currentUser.role;
				session.user.avatar = currentUser.avatar;
				session.user.status = currentUser.status;
				session.user.name =
					[currentUser.firstName, currentUser.lastName]
						.filter(Boolean)
						.join(" ") || session.user.name;
				session.user.image =
					currentUser.avatar ?? session.user.image;
			}
			session.user.permissions = currentUser?.permissions ?? [];
			session.error = authToken.error;
			return session;
		},
	},
	events: {
		async signOut(message) {
			const refreshToken =
				"token" in message
					? message.token?.refreshToken
					: undefined;
			const headers = refreshToken
				? { Cookie: `refreshToken=${refreshToken}` }
				: undefined;

			try {
				await fetch(`${authApiUrl}/auth/logout`, {
					method: "POST",
					headers,
					cache: "no-store",
				});
			} catch {}
		},
	},
});
