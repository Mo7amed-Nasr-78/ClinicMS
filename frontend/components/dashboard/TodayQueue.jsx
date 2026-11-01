"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
	ArrowRight,
	Ban,
	CalendarClock,
	CalendarDays,
	Check,
	CheckCircle2,
	CircleAlert,
	Clock3,
	FileText,
	Stethoscope,
	UserCheck,
	UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/api/hooks/Appointments";
import {
	doctorName,
	patientName,
} from "@/components/appointments/appointment-utils";

const APPOINTMENT_STATUS_META = {
	scheduled: {
		label: "Scheduled",
		icon: CalendarClock,
		className: "border-line bg-surface-2 text-ink-muted",
	},
	confirmed: {
		label: "Confirmed",
		icon: CheckCircle2,
		className: "border-brand/20 bg-brand/10 text-brand",
	},
	checkedin: {
		label: "Checked in",
		icon: UserCheck,
		className: "border-gold/30 bg-gold/10 text-ink",
	},
	inprogress: {
		label: "In progress",
		icon: Stethoscope,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	completed: {
		label: "Completed",
		icon: Check,
		className: "border-brand/20 bg-brand/10 text-brand",
	},
	cancelled: {
		label: "Cancelled",
		icon: Ban,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	noshow: {
		label: "No-show",
		icon: UserX,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	rescheduled: {
		label: "Rescheduled",
		icon: Clock3,
		className: "border-gold/30 bg-gold/10 text-ink",
	},
};

function getStatusMeta(status = "") {
	const normalizedStatus = status.toLowerCase().replace(/[_\s-]/g, "");
	return (
		APPOINTMENT_STATUS_META[normalizedStatus] ?? {
			label: "Unknown status",
			icon: CalendarClock,
			className: "border-line bg-surface-2 text-ink-muted",
		}
	);
}

function formatQueueTime(value) {
	if (/^\d{2}:\d{2}$/.test(value)) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

export function TodayQueue() {
	const today = format(new Date(), "yyyy-MM-dd");
	const { appointments, loading, error } = useAppointments(1, 100, {
		appointmentDate: today,
	});
	const todaysAppointments = [...appointments].sort((first, second) =>
		first.startTime.localeCompare(second.startTime),
	);

	return (
		<section className="flex h-full min-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
			<header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<CalendarDays
							className="size-5"
							aria-hidden="true"
						/>
					</span>
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-ink">
							Today&apos;s schedule
						</h2>
						<p className="mt-0.5 truncate text-xs text-ink-muted">
							{format(new Date(), "EEEE, MMMM d")}
						</p>
					</div>
					<span className="hidden shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted sm:inline-flex">
						{loading
							? "Loading"
							: `${todaysAppointments.length} ${
									todaysAppointments.length === 1
										? "appointment"
										: "appointments"
								}`}
					</span>
				</div>
				<Link
					href="/dashboard/appointments"
					className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-brand transition-colors hover:bg-surface-2 hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
				>
					View all
					<ArrowRight
						className="size-4"
						aria-hidden="true"
					/>
				</Link>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto px-5">
				{loading ? (
					<ul
						className="divide-y divide-line"
						role="status"
						aria-label="Loading today's appointments"
					>
						{[0, 1, 2].map((item) => (
							<li
								key={item}
								className="flex items-center gap-4 py-4"
							>
								<span className="h-10 w-16 animate-pulse rounded-lg bg-surface-2" />
								<span className="flex-1 space-y-2">
									<span className="block h-3.5 w-2/5 animate-pulse rounded bg-surface-2" />
									<span className="block h-3 w-3/5 animate-pulse rounded bg-surface-2" />
								</span>
								<span className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
							</li>
						))}
					</ul>
				) : error ? (
					<div
						className="flex flex-col items-center gap-2 py-10 text-center"
						role="alert"
					>
						<CircleAlert
							className="size-7 text-accent-strong"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-ink">
							Unable to load today&apos;s schedule
						</p>
						<p className="max-w-sm text-xs text-ink-muted">
							{error}
						</p>
					</div>
				) : todaysAppointments.length === 0 ? (
					<div className="flex min-h-56 flex-col items-center justify-center gap-2 py-8 text-center">
						<CalendarDays
							className="mb-1 size-8 text-ink-faint"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-ink">
							Your day is clear
						</p>
						<p className="text-xs text-ink-muted">
							No appointments are scheduled for today.
						</p>
					</div>
				) : (
					<ul className="divide-y divide-line">
						{todaysAppointments.map((appointment) => {
							const status = getStatusMeta(
								appointment.status,
							);
							const StatusIcon = status.icon;

							return (
								<li
									key={appointment.id}
									className="flex items-center gap-3 py-3.5 sm:gap-4"
								>
									<div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-2 px-2 py-2 text-center">
										<Clock3
											className="mb-1 size-3.5 text-brand"
											aria-hidden="true"
										/>
										<time className="font-mono text-xs font-semibold tabular-nums text-ink">
											{formatQueueTime(
												appointment.startAt,
											)}
										</time>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-ink">
											{patientName(
												appointment.patient,
											)}
										</p>
										<div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
											<span className="inline-flex min-w-0 items-center gap-1.5">
												<Stethoscope
													className="size-3.5 shrink-0"
													aria-hidden="true"
												/>
												<span className="truncate">
													{doctorName(
														appointment.doctor,
													)}
												</span>
											</span>
											{appointment.reason && (
												<span className="inline-flex min-w-0 items-center gap-1.5">
													<FileText
														className="size-3.5 shrink-0"
														aria-hidden="true"
													/>
													<span className="truncate">
														{appointment.reason}
													</span>
												</span>
											)}
										</div>
									</div>
									<Badge
										variant="outline"
										className={`h-7 shrink-0 gap-1.5 px-2 text-[0.7rem] ${status.className}`}
									>
										<StatusIcon
											aria-hidden="true"
										/>
										<span className="hidden sm:inline">
											{status.label}
										</span>
									</Badge>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{!loading && !error && todaysAppointments.length > 0 && (
				<footer className="flex items-center justify-between border-t border-line bg-surface-2/40 px-5 py-3">
					<p className="text-xs text-ink-muted">
						Sorted by appointment time
					</p>
					<Link
						href="/dashboard/appointments"
						className="text-xs font-medium text-brand transition-colors hover:text-brand-deep"
					>
						Manage schedule
					</Link>
				</footer>
			)}
		</section>
	);
}
