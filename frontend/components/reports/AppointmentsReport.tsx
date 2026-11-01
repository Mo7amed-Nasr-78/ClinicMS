"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isValid, parse, parseISO } from "date-fns";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { getTodaysAppointmentsReport } from "@/api/services/reportsService";
import { ReportPageLayout } from "@/components/reports/ReportPageLayout";

function displayTime(value: string | null | undefined) {
	if (!value) return "Time unavailable";
	const time = parse(value, "HH:mm", new Date());
	return isValid(time) ? format(time, "h:mm a") : value;
}

function doctorName(firstName: string | null, lastName: string | null) {
	return [firstName, lastName].filter(Boolean).join(" ") || "Doctor";
}

export function AppointmentsReport() {
	const reportQuery = useQuery({
		queryKey: ["reports", "appointments", "today"],
		queryFn: ({ signal }) => getTodaysAppointmentsReport(signal),
	});
	const appointments = reportQuery.data ?? [];
	const utcDate = new Date().toISOString().slice(0, 10);
	const date = parseISO(`${utcDate}T00:00:00`);
	const dateLabel = isValid(date)
		? format(date, "EEEE, MMMM d, yyyy")
		: "Today";

	return (
		<ReportPageLayout
			title="Appointments report"
			activeItem="Appointments report"
		>
			<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-sm font-semibold text-ink">
						Today&apos;s schedule
					</h2>
					<p className="mt-1 text-sm text-ink-muted">
						{dateLabel} · UTC
					</p>
				</div>
				<p
					className="text-sm text-ink-muted"
					aria-live="polite"
				>
					{appointments.length}{" "}
					{appointments.length === 1
						? "appointment"
						: "appointments"}
				</p>
			</div>

			{reportQuery.isPending ? (
				<p
					className="py-10 text-center text-sm text-ink-muted"
					role="status"
				>
					Loading today&apos;s appointments...
				</p>
			) : reportQuery.isError ? (
				<p
					role="alert"
					className="py-10 text-center text-sm text-accent-strong"
				>
					{getApiErrorMessage(reportQuery.error)}
				</p>
			) : appointments.length === 0 ? (
				<p className="py-10 text-center text-sm text-ink-muted">
					No appointments are scheduled for today.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="print-report-table w-full min-w-190 border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
								<th className="py-3 pr-3 font-semibold">
									Time
								</th>
								<th className="px-3 py-3 font-semibold">
									Patient
								</th>
								<th className="px-3 py-3 font-semibold">
									Doctor
								</th>
								<th className="px-3 py-3 font-semibold">
									Visit
								</th>
								<th className="py-3 pl-3 text-right font-semibold">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{appointments.map((appointment) => (
								<tr
									key={appointment.id}
									className="border-b border-line last:border-0 print:break-inside-avoid"
								>
									<td className="whitespace-nowrap py-3 pr-3 font-medium text-ink">
										{displayTime(
											appointment.startAt,
										)}
										<span className="px-1.5 text-ink-faint">
											–
										</span>
										{displayTime(
											appointment.endAt,
										)}
									</td>
									<td className="px-3 py-3">
										<p className="font-medium text-ink">
											{
												appointment
													.patient
													.firstName
											}{" "}
											{
												appointment
													.patient
													.lastName
											}
										</p>
										<p className="mt-0.5 text-xs text-ink-muted">
											{appointment
												.patient
												.email ??
												"No email"}
										</p>
									</td>
									<td className="px-3 py-3">
										<p className="font-medium text-ink">
											Dr.{" "}
											{doctorName(
												appointment
													.doctor
													.user
													.firstName,
												appointment
													.doctor
													.user
													.lastName,
											)}
										</p>
										<p className="mt-0.5 text-xs text-ink-muted">
											{
												appointment
													.doctor
													.specialty
											}
										</p>
									</td>
									<td className="max-w-64 px-3 py-3">
										<p className="truncate text-ink">
											{appointment.reason ||
												"Appointment"}
										</p>
										{appointment.notes && (
											<p className="mt-0.5 truncate text-xs text-ink-muted">
												{
													appointment.notes
												}
											</p>
										)}
									</td>
									<td className="py-3 pl-3 text-right capitalize text-ink-muted">
										{appointment.status.replaceAll(
											"_",
											" ",
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</ReportPageLayout>
	);
}
