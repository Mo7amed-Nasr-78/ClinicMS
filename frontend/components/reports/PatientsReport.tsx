"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/services/doctorsService";
import { getPatientsReport } from "@/api/services/reportsService";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportPageLayout } from "@/components/reports/ReportPageLayout";

const patientStatuses = [
	{ value: "upcoming", label: "Upcoming" },
	{ value: "waiting", label: "Waiting" },
	{ value: "in_room", label: "In room" },
	{ value: "complete", label: "Complete" },
];

const patientGenders = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
];

export function PatientsReport() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [gender, setGender] = useState("");
	const reportQuery = useQuery({
		queryKey: ["reports", "patients", status, gender, search],
		queryFn: ({ signal }) =>
			getPatientsReport(
				{
					status: status || undefined,
					gender: gender || undefined,
					q: search.trim() || undefined,
				},
				signal,
			),
	});
	const patients = reportQuery.data ?? [];

	return (
		<ReportPageLayout
			title="Patients report"
			activeItem="Patients report"
		>
			<ReportFilters
				searchLabel="Search patients"
				searchPlaceholder="Name, email, or phone"
				searchValue={search}
				fields={[
					{
						key: "status",
						label: "All patient statuses",
						options: patientStatuses,
					},
					{
						key: "gender",
						label: "All genders",
						options: patientGenders,
					},
				]}
				values={{ status, gender }}
				onSearchChange={setSearch}
				onFieldChange={(key, value) => {
					if (key === "status") setStatus(value);
					if (key === "gender") setGender(value);
				}}
				onReset={() => {
					setSearch("");
					setStatus("");
					setGender("");
				}}
			/>

			<div className="mb-3 flex items-center justify-between print:hidden">
				<h2 className="text-sm font-semibold text-ink">
					Patient registry
				</h2>
				<p className="text-sm text-ink-muted">
					{patients.length}{" "}
					{patients.length === 1 ? "patient" : "patients"}
				</p>
			</div>
			{reportQuery.isPending ? (
				<p className="py-10 text-center text-sm text-ink-muted">
					Loading patients report...
				</p>
			) : reportQuery.error ? (
				<p
					role="alert"
					className="py-10 text-center text-sm text-accent-strong"
				>
					{getApiErrorMessage(reportQuery.error)}
				</p>
			) : patients.length === 0 ? (
				<p className="py-10 text-center text-sm text-ink-muted">
					No patients match these filters.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="print-report-table w-full min-w-190 border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
								<th className="py-3 pr-3 font-semibold">
									Patient
								</th>
								<th className="px-3 py-3 font-semibold">
									Email
								</th>
								<th className="px-3 py-3 font-semibold">
									Date of birth
								</th>
								<th className="px-3 py-3 font-semibold">
									Gender
								</th>
								<th className="px-3 py-3 font-semibold">
									Blood type
								</th>
								<th className="px-3 py-3 font-semibold">
									Contact
								</th>
								<th className="py-3 pl-3 text-right font-semibold">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{patients.map((patient) => (
								<tr
									key={patient.id}
									className="border-b border-line last:border-0 print:break-inside-avoid"
								>
									<td className="py-3 pr-3 font-medium text-ink">
										{patient.firstName}{" "}
										{patient.lastName}
									</td>
									<td className="px-3 py-3">
										{patient.email ??
											"Not provided"}
									</td>
									<td className="px-3 py-3">
										{
											patient.dateOfBirth
										}
									</td>
									<td className="px-3 py-3">
										{patient.gender}
									</td>
									<td className="px-3 py-3">
										{patient.bloodType}
									</td>
									<td className="px-3 py-3">
										{patient.phone}
									</td>
									<td className="py-3 pl-3 text-right">
										{patientStatuses.find(
											(item) =>
												item.value ===
												patient.status,
										)?.label ??
											patient.status}
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
