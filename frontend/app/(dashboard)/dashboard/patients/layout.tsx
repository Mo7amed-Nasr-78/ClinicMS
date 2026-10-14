import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/components/ui/button";

function PatientAccessDenied() {
	return (
		<div className="min-h-screen bg-bg text-ink">
			<header className="flex h-16 items-center border-b border-line bg-surface px-5 sm:px-8">
				<Link
					href="/dashboard"
					className="flex items-center gap-3 text-brand-deep"
				>
					<span className="flex size-9 items-center justify-center rounded-lg bg-brand text-chip">
						<ShieldAlert size={19} aria-hidden="true" />
					</span>
					<span>
						<span className="block font-semibold leading-tight">
							Wardline
						</span>
						<span className="block font-mono text-[0.62rem] tracking-[0.12em] text-ink-faint">
							CLINIC MANAGEMENT
						</span>
					</span>
				</Link>
			</header>

			<main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-5 py-12 sm:px-8">
				<section
					aria-labelledby="access-denied-title"
					className="grid w-full gap-8 border-y border-line py-10 sm:gap-12 sm:py-14 md:grid-cols-[10rem_minmax(0,1fr)] md:items-center"
				>
					<div className="flex size-28 items-center justify-center border border-line bg-surface-2 text-brand sm:size-36">
						<ShieldAlert
							className="size-12 sm:size-14"
							strokeWidth={1.4}
							aria-hidden="true"
						/>
					</div>
					<div className="max-w-2xl">
						<p className="font-mono text-xs font-medium tracking-[0.12em] text-accent-strong">
							ACCESS RESTRICTED / PATIENTS
						</p>
						<h1
							id="access-denied-title"
							className="mt-3 font-serif text-4xl font-normal leading-tight text-ink sm:text-5xl"
						>
							Patient records are restricted
						</h1>
						<p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
							Your account does not have permission to view
							patient records. Contact your clinic
							administrator if you need access.
						</p>
						<Button asChild className="mt-7">
							<Link href="/dashboard">
								<ArrowLeft aria-hidden="true" />
								Back to dashboard
							</Link>
						</Button>
					</div>
				</section>
			</main>
		</div>
	);
}

export default function PatientsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["view:patients"]}
			fallback={<PatientAccessDenied />}
		>
			{children}
		</PermissionGate>
	);
}