"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, LoaderCircle } from "lucide-react";
import { useAppointments } from "@/api/hooks/Appointments";
import {
	doctorName,
	patientName,
} from "@/components/appointments/appointment-utils";
import { STATUS_META } from "./data";

function getStatusMeta(status) {
	const normalizedStatus = status.toLowerCase();
	if (normalizedStatus === "waiting") return STATUS_META.waiting;
	if (normalizedStatus === "in_room") return STATUS_META["in-room"];
	if (normalizedStatus === "complete") return STATUS_META.complete;
	return STATUS_META.upcoming;
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
		<div className="bg-surface border border-line rounded-2xl p-5 h-full flex flex-col">
			<div className="flex items-center justify-between mb-4 pb-4 border-b border-line shrink-0">
				<h2 className="text-[1rem] font-semibold text-ink">
					Today&apos;s schedule
				</h2>
				<Link
					href="/dashboard/appointments"
					className="text-[0.82rem] text-brand hover:text-brand-deep"
				>
					View all
				</Link>
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				{loading ? (
					<div
						className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted"
						role="status"
					>
						<LoaderCircle
							className="size-4 animate-spin"
							aria-hidden="true"
						/>
						Loading today&apos;s appointments...
					</div>
				) : error ? (
					<p
						className="py-8 text-center text-sm text-accent-strong"
						role="alert"
					>
						{error}
					</p>
				) : todaysAppointments.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center text-sm text-ink-muted">
						<CalendarDays
							className="size-7 text-ink-faint"
							aria-hidden="true"
						/>
						<p>No appointments scheduled for today.</p>
					</div>
				) : (
					todaysAppointments.map((appointment) => {
						const status = getStatusMeta(
							appointment.patient.status,
						);
						return (
							<div
								key={appointment.id}
								className="flex items-center gap-4 py-3 border-b border-line last:border-b-0"
							>
								<span className="font-mono text-[0.8rem] text-ink-faint w-11.5 shrink-0">
									{formatQueueTime(
										appointment.startTime,
									)}
								</span>
								<div className="flex-1 min-w-0">
									<p className="text-[0.92rem] font-medium text-ink truncate">
										{patientName(
											appointment.patient,
										)}
									</p>
									<p className="text-[0.78rem] text-ink-faint truncate">
										{doctorName(
											appointment.doctor,
										)}{" "}
										·{" "}
										{appointment.reason}
									</p>
								</div>
								<span className="flex items-center gap-1.75 text-[0.78rem] text-ink-muted shrink-0">
									<span
										className={`w-1.75 h-1.75 rounded-full shrink-0 ${status.dot}`}
									/>
									{status.label}
								</span>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
