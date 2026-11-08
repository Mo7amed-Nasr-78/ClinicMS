"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	CalendarClock,
	CheckCircle2,
	FileText,
	LoaderCircle,
	Stethoscope,
} from "lucide-react";
import { useAppointments } from "@/api/hooks/Appointments";
import {
	doctorName,
	formatTime,
	patientName,
} from "@/components/appointments/appointment-utils";

const PAGE_SIZE = 20;

export function WaitingPatientsCard() {
	const [page, setPage] = useState(1);
	const today = format(new Date(), "yyyy-MM-dd");
	const { appointments, pagination, loading, error } = useAppointments(
		page,
		PAGE_SIZE,
		{ appointmentDate: today, status: "checkedIn" },
	);
	const totalPages = Math.max(pagination.totalPages, 1);
	const firstAppointmentNumber =
		appointments.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
	const lastAppointmentNumber =
		firstAppointmentNumber + appointments.length - 1;

	return (
		<section className="flex max-h-[34rem] min-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
			<header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<CheckCircle2 className="size-5" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<h2 className="truncate text-base font-semibold text-ink">
							Waiting patients
						</h2>
						<p className="text-xs text-ink-muted">
							Checked-in patients awaiting their visit
						</p>
					</div>
				</div>
				<span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
					{loading ? "…" : pagination.total} waiting
				</span>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{loading ? (
					<div
						className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted px-4"
						role="status"
					>
						<LoaderCircle
							className="size-4 animate-spin"
							aria-hidden="true"
						/>
						Loading waiting patients…
					</div>
				) : error ? (
					<p
						className="py-8 text-center text-sm text-accent-strong px-4"
						role="alert"
					>
						{error}
					</p>
				) : appointments.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
						<CalendarClock
							className="size-8 text-ink-faint"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-ink">
							No waiting patients
						</p>
						<p className="text-xs text-ink-muted">
							Checked-in patients will appear here.
						</p>
					</div>
				) : (
					<ul className="divide-y divide-line p-2">
						{appointments.map((appointment) => (
							<li key={appointment.id}>
								<Link
									href={`/dashboard/patients/${appointment.patient.id}`}
									className="group flex items-center gap-3 py-3 transition-colors hover:bg-surface-2 px-4 rounded-xl"
								>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium text-ink group-hover:text-brand">
											{patientName(appointment.patient)}
										</span>
										<span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
											<Stethoscope
												className="size-3 shrink-0"
												aria-hidden="true"
											/>
											<span className="truncate">
												{doctorName(appointment.doctor)}
											</span>
										</span>
										{appointment.reason && (
											<span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink-faint">
												<FileText
													className="size-3 shrink-0"
													aria-hidden="true"
												/>
												<span className="truncate">
													{appointment.reason}
												</span>
											</span>
										)}
									</span>
									<span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand/10 px-2 py-1 text-[0.68rem] font-medium text-brand">
										<CheckCircle2
											className="size-3"
											aria-hidden="true"
										/>
										{formatTime(appointment.startAt)}
									</span>
									<ArrowUpRight
										className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand"
										aria-hidden="true"
									/>
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>

			<footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
				{pagination.total > 0 ? (
					<p className="text-xs text-ink-muted">
						Showing {firstAppointmentNumber}–
						{lastAppointmentNumber} of {pagination.total}
					</p>
				) : (
					<Link
						href="/dashboard/appointments"
						className="text-xs font-medium text-brand hover:text-brand-deep"
					>
						Open today&apos;s schedule
					</Link>
				)}
				{totalPages > 1 && (
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() =>
								setPage((currentPage) =>
									Math.max(1, currentPage - 1),
								)
							}
							disabled={page === 1 || loading}
							className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
							aria-label="Previous waiting patients"
						>
							<ChevronLeft
								className="size-4"
								aria-hidden="true"
							/>
						</button>
						<span className="text-xs tabular-nums text-ink-muted">
							{page}/{totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								setPage((currentPage) =>
									Math.min(totalPages, currentPage + 1),
								)
							}
							disabled={page >= totalPages || loading}
							className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
							aria-label="Next waiting patients"
						>
							<ChevronRight
								className="size-4"
								aria-hidden="true"
							/>
						</button>
					</div>
				)}
			</footer>
		</section>
	);
}
