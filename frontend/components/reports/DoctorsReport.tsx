"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/doctorsService";
import { getDoctorsReport } from "@/api/services/reportsService";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportPageLayout } from "@/components/reports/ReportPageLayout";

const doctorStatuses = [
	{ value: "active", label: "Active" },
	{ value: "inActive", label: "Inactive" },
	{ value: "suspended", label: "Suspended" },
];

export function DoctorsReport() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [specialty, setSpecialty] = useState("");
	const reportQuery = useQuery({
		queryKey: ["reports", "doctors", status, specialty, search],
		queryFn: ({ signal }) =>
			getDoctorsReport(
				{
					status: status || undefined,
					specialty: specialty.trim() || undefined,
					q: search.trim() || undefined,
				},
				signal,
			),
	});
	const doctors = reportQuery.data ?? [];

	return (
		<ReportPageLayout
			title="Doctors report"
			activeItem="Doctors report"
		>
			<ReportFilters
				searchLabel="Search doctors"
				searchPlaceholder="Name, email, or license"
				searchValue={search}
				fields={[
					{
						key: "status",
						label: "All doctor statuses",
						options: doctorStatuses,
					},
					{
						key: "specialty",
						label: "Specialty",
						placeholder: "Exact specialty",
					},
				]}
				values={{ status, specialty }}
				onSearchChange={setSearch}
				onFieldChange={(key, value) => {
					if (key === "status") setStatus(value);
					if (key === "specialty") setSpecialty(value);
				}}
				onReset={() => {
					setSearch("");
					setStatus("");
					setSpecialty("");
				}}
			/>

			<div className="mb-3 flex items-center justify-between print:hidden">
				<h2 className="text-sm font-semibold text-ink">
					Doctor directory
				</h2>
				<p className="text-sm text-ink-muted">
					{doctors.length}{" "}
					{doctors.length === 1 ? "doctor" : "doctors"}
				</p>
			</div>
			{reportQuery.isPending ? (
				<p className="py-10 text-center text-sm text-ink-muted">
					Loading doctors report...
				</p>
			) : reportQuery.error ? (
				<p
					role="alert"
					className="py-10 text-center text-sm text-accent-strong"
				>
					{getApiErrorMessage(reportQuery.error)}
				</p>
			) : doctors.length === 0 ? (
				<p className="py-10 text-center text-sm text-ink-muted">
					No doctors match these filters.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="print-report-table w-full min-w-190 border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
								<th className="py-3 pr-3 font-semibold">
									Doctor
								</th>
								<th className="px-3 py-3 font-semibold">
									Specialty
								</th>
								<th className="px-3 py-3 font-semibold">
									License
								</th>
								<th className="px-3 py-3 font-semibold">
									Contact
								</th>
								<th className="px-3 py-3 font-semibold">
									Consultation
								</th>
								<th className="py-3 pl-3 text-right font-semibold">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{doctors.map((doctor) => {
								const name =
									[
										doctor.user
											.firstName,
										doctor.user
											.lastName,
									]
										.filter(Boolean)
										.join(" ") ||
									"Doctor";
								return (
									<tr
										key={doctor.id}
										className="border-b border-line last:border-0 print:break-inside-avoid"
									>
										<td className="py-3 pr-3">
											<p className="font-medium text-ink">
												{name}
											</p>
											<p className="mt-0.5 text-xs text-ink-muted">
												{
													doctor
														.user
														.email
												}
											</p>
										</td>
										<td className="px-3 py-3">
											{
												doctor.specialty
											}
										</td>
										<td className="px-3 py-3">
											{
												doctor.licenseNumber
											}
										</td>
										<td className="px-3 py-3">
											{doctor.user
												.phone ??
												"Not provided"}
										</td>
										<td className="px-3 py-3">
											{
												doctor.consultationDuration
											}{" "}
											min ·{" "}
											{
												doctor.consultationFee
											}
										</td>
										<td className="py-3 pl-3 text-right">
											{doctorStatuses.find(
												(
													item,
												) =>
													item.value ===
													doctor.status,
											)?.label ??
												doctor.status}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</ReportPageLayout>
	);
}
