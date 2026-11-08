"use client";

import Link from "next/link";
import { useState } from "react";
import {
	ArrowLeft,
	Check,
	LockKeyhole,
	ShieldAlert,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";

export function AccessDeniedPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Access restricted"
				/>
				<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
					<section
						aria-labelledby="access-denied-title"
						className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1fr_0.78fr] md:gap-16 md:py-16"
					>
						<div className="max-w-2xl">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-strong/25 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-strong">
								<LockKeyhole
									size={15}
									aria-hidden="true"
								/>
								Access restricted
							</div>
							<h2
								id="access-denied-title"
								className="font-serif text-5xl leading-[1.05] text-ink sm:text-6xl"
							>
								You don&apos;t have access to this page.
							</h2>
							<p className="mt-6 max-w-xl text-base leading-7 text-ink-muted">
								Your account doesn&apos;t have permission to
								open this part of the clinic workspace. If you
								need access, your clinic administrator can help.
							</p>
							<Button asChild className="mt-8 min-h-10 px-4">
								<Link href="/dashboard">
									<ArrowLeft aria-hidden="true" />
									Return to dashboard
								</Link>
							</Button>
						</div>

						<aside
							aria-label="Access information"
							className="relative mx-auto w-full max-w-md"
						>
							<div
								aria-hidden="true"
								className="absolute -inset-5 rounded-[2rem] bg-brand/5 blur-2xl"
							/>
							<div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
								<div className="relative flex min-h-64 items-center justify-center overflow-hidden border-b border-line bg-surface-2/60 px-6 py-10 sm:min-h-72">
									<div
										aria-hidden="true"
										className="absolute size-52 rounded-full border border-brand/10 sm:size-60"
									/>
									<div
										aria-hidden="true"
										className="absolute size-40 rounded-full border border-brand/15 sm:size-48"
									/>
									<div className="relative flex size-28 items-center justify-center rounded-[1.75rem] border border-accent-strong/15 bg-surface text-accent-strong shadow-sm sm:size-32">
										<ShieldAlert
											className="size-14 sm:size-16"
											strokeWidth={1.35}
											aria-hidden="true"
										/>
										<span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-4 border-surface bg-accent text-chip">
											<LockKeyhole
												size={13}
												aria-hidden="true"
											/>
										</span>
									</div>
								</div>
								<div className="p-5 sm:p-6">
									<div className="flex items-start gap-3">
										<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
											<Check
												size={15}
												strokeWidth={2.2}
												aria-hidden="true"
											/>
										</span>
										<div>
											<h3 className="text-sm font-semibold text-ink">
												Your account is still secure
											</h3>
											<p className="mt-1 text-sm leading-6 text-ink-muted">
												You&apos;re signed in. This
												area is simply limited to
												accounts with the right
												access.
											</p>
										</div>
									</div>
								</div>
							</div>
						</aside>
					</section>
					<footer className="flex flex-col gap-2 border-t border-line py-4 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
						<span>Wardline · Clinic management</span>
						<span>Need access? Contact your clinic administrator.</span>
					</footer>
				</main>
			</div>
		</div>
	);
}
