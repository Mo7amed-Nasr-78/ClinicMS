"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { useClinicStore } from "@/stores/clinicStore";
import { useAccessTokenStore } from "@/stores/accessTokenStore";

const ACCESS_TOKEN_REFRESH_INTERVAL_MS = 13 * 60 * 1000;

function RefreshSession({ children }: { children: ReactNode }) {
	const { data, status, update } = useSession();
	const pathname = usePathname();
	const fetchMyClinic = useClinicStore((state) => state.fetchMyClinic);
	const setAccessToken = useAccessTokenStore(
		(state) => state.setAccessToken,
	);
	const clearAccessToken = useAccessTokenStore(
		(state) => state.clearAccessToken,
	);
	const refreshStarted = useRef(false);
	const lastRefreshAt = useRef(0);
	const refreshPromise = useRef<Promise<boolean> | null>(null);

	const refreshAccessToken = useCallback(() => {
		if (refreshPromise.current) return refreshPromise.current;

		const pending = update()
			.then((session) => {
				if (!session?.accessToken || session.error) {
					clearAccessToken();
					return false;
				}

				setAccessToken(session.accessToken);
				lastRefreshAt.current = Date.now();
				return true;
			})
			.catch(() => {
				clearAccessToken();
				return false;
			})
			.finally(() => {
				refreshPromise.current = null;
			});

		refreshPromise.current = pending;
		return pending;
	}, [clearAccessToken, setAccessToken, update]);

	useEffect(() => {
		if (data?.accessToken) {
			setAccessToken(data.accessToken);
		} else if (status === "unauthenticated") {
			clearAccessToken();
		}
	}, [clearAccessToken, data?.accessToken, setAccessToken, status]);

	useEffect(() => {
		if (status === "loading" || refreshStarted.current) return;
		refreshStarted.current = true;

		if (status === "unauthenticated") {
			clearAccessToken();
			void signOut({ redirectTo: "/login" });
			return;
		}

		void refreshAccessToken().then(async (isValid) => {
			if (!isValid) {
				void signOut({ redirectTo: "/login" });
				return;
			}

			if (pathname !== "/onboarding") {
				try {
					await fetchMyClinic();
				} catch {
					// Clinic loading should not invalidate a refreshed session.
				}
			}
		});
	}, [
		clearAccessToken,
		fetchMyClinic,
		pathname,
		refreshAccessToken,
		status,
	]);

	useEffect(() => {
		if (status !== "authenticated") return;

		const refreshIfNeeded = () => {
			if (
				Date.now() - lastRefreshAt.current <
				ACCESS_TOKEN_REFRESH_INTERVAL_MS
			) {
				return;
			}

			void refreshAccessToken().then((isValid) => {
				if (!isValid) void signOut({ redirectTo: "/login" });
			});
		};

		const interval = window.setInterval(refreshIfNeeded, 60_000);
		document.addEventListener("visibilitychange", refreshIfNeeded);
		return () => {
			window.clearInterval(interval);
			document.removeEventListener(
				"visibilitychange",
				refreshIfNeeded,
			);
		};
	}, [refreshAccessToken, status]);

	return children;
}

export function RefreshSessionOnMount({
	children,
	session,
}: {
	children: ReactNode;
	session: Session;
}) {
	return (
		<SessionProvider session={session}>
			<RefreshSession>{children}</RefreshSession>
		</SessionProvider>
	);
}
