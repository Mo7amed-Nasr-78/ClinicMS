"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	RefreshCw,
	Server,
	WifiOff,
} from "lucide-react";
import { API_BASE_URL } from "@/api/httpClient";

type BackendHealth = {
	status: "ok";
	database: "connected";
	timestamp: string;
	responseMs: number;
	checkedAt: string;
};

type BackendAvailabilityState = "checking" | "online" | "offline";

type BackendAvailabilityContextValue = {
	state: BackendAvailabilityState;
	health: BackendHealth | null;
	isChecking: boolean;
	retry: () => void;
};

const BackendAvailabilityContext =
	createContext<BackendAvailabilityContextValue | null>(null);

async function checkBackend(): Promise<BackendHealth> {
	const startedAt = performance.now();
	const response = await fetch(
		`${API_BASE_URL.replace(/\/+$/, "")}/health`,
		{
			cache: "no-store",
			signal: AbortSignal.timeout(5_000),
		},
	);

	if (!response.ok) {
		throw new Error(`Backend health check returned ${response.status}`);
	}

	const result = (await response.json()) as {
		status?: string;
		database?: string;
		timestamp?: string;
	};
	if (result.status !== "ok" || result.database !== "connected") {
		throw new Error("Backend or database is unavailable");
	}

	return {
		status: "ok",
		database: "connected",
		timestamp: result.timestamp ?? new Date().toISOString(),
		responseMs: Math.round(performance.now() - startedAt),
		checkedAt: new Date().toISOString(),
	};
}

function BackendUnavailableScreen({
	isChecking,
	retry,
}: Pick<BackendAvailabilityContextValue, "isChecking" | "retry">) {
	return (
		<main className="min-h-screen bg-bg px-5 py-8 text-ink sm:px-8 sm:py-12">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
				<header className="flex items-center gap-3 border-b border-line pb-5">
					<div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
						<Server aria-hidden="true" size={19} />
					</div>
					<div>
						<p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">
							Wardline / System status
						</p>
						<p className="text-sm font-semibold">
							Clinic management
						</p>
					</div>
				</header>

				<section className="grid flex-1 items-center gap-10 py-14 md:grid-cols-[1fr_0.72fr] md:py-20">
					<div>
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-strong/25 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-strong">
							<span className="size-2 rounded-full bg-accent-strong" />
							Backend unavailable
						</div>
						<h1 className="max-w-2xl font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
							We can&apos;t reach the clinic server.
						</h1>
						<p className="mt-6 max-w-xl text-base leading-7 text-ink-muted">
							The app will reconnect automatically.
							Until then, changes cannot be loaded
							or saved.
						</p>
						<button
							type="button"
							onClick={retry}
							disabled={isChecking}
							className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-chip transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70"
						>
							<RefreshCw
								aria-hidden="true"
								size={16}
								className={
									isChecking
										? "animate-spin"
										: undefined
								}
							/>
							{isChecking
								? "Checking connection"
								: "Try again"}
						</button>
					</div>

					<aside className="border-y border-line py-6 md:border-l md:border-y-0 md:py-2 md:pl-8">
						<div className="flex items-center gap-3 text-accent-strong">
							<WifiOff
								aria-hidden="true"
								size={20}
							/>
							<h2 className="text-sm font-semibold">
								Connection check
							</h2>
						</div>
						<p className="mt-3 text-sm leading-6 text-ink-muted">
							We check the API and database every 15
							seconds. This page will close as soon
							as both respond again.
						</p>
						<div
							className="mt-5 h-1 overflow-hidden rounded-full bg-surface-2"
							role="progressbar"
							aria-label="Waiting for backend recovery"
						>
							<div className="h-full w-1/3 animate-pulse rounded-full bg-accent-strong" />
						</div>
					</aside>
				</section>

				<footer className="flex items-center gap-2 border-t border-line pt-4 font-mono text-xs text-ink-faint">
					<Activity aria-hidden="true" size={14} />
					Automatic recovery checks are active
				</footer>
			</div>
		</main>
	);
}

export function BackendAvailability({ children }: { children: ReactNode }) {
	const query = useQuery({
		queryKey: ["backend-health"],
		queryFn: checkBackend,
		retry: false,
		refetchInterval: 15_000,
		refetchOnWindowFocus: true,
	});
	const state: BackendAvailabilityState = query.isError
		? "offline"
		: query.data
			? "online"
			: "checking";
	const value: BackendAvailabilityContextValue = {
		state,
		health: query.data ?? null,
		isChecking: query.isFetching,
		retry: () => {
			void query.refetch();
		},
	};

	return (
		<BackendAvailabilityContext.Provider value={value}>
			{query.isError ? (
				<BackendUnavailableScreen
					isChecking={query.isFetching}
					retry={value.retry}
				/>
			) : (
				children
			)}
		</BackendAvailabilityContext.Provider>
	);
}

export function useBackendAvailability() {
	const context = useContext(BackendAvailabilityContext);
	if (!context) {
		throw new Error(
			"useBackendAvailability must be used inside BackendAvailability",
		);
	}
	return context;
}

export function BackendStatusPage() {
	const { state, isChecking, retry } = useBackendAvailability();
	if (state !== "offline") return null;

	return (
		<BackendUnavailableScreen
			isChecking={isChecking}
			retry={retry}
		/>
	);
}
