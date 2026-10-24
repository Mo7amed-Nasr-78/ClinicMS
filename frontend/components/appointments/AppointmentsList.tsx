"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
	CalendarPlus,
	ChevronLeft,
	ChevronRight,
	LoaderCircle,
	Pencil,
	RefreshCw,
	Search,
	Trash2,
} from "lucide-react";
import type {
	AppointmentWithRelations,
	AppointmentsResponse,
} from "@/api/services/appointmentsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
	appointmentStatusClass,
	doctorName,
	formatDate,
	formatTime,
	patientName,
} from "./appointment-utils";
import { PermissionGate } from "../auth/PermissionGate";
import { hasPermission } from "@/lib/permissions";

type AppointmentsListProps = {
	appointments: AppointmentWithRelations[];
	pagination: AppointmentsResponse["pagination"];
	page: number;
	onPageChange: (page: number) => void;
	loading: boolean;
	error: string | null;
	onRetry: () => void;
	onCreate: () => void;
	onEdit: (appointment: AppointmentWithRelations) => void;
	onDelete: (appointment: AppointmentWithRelations) => void;
	isDeleting: boolean;
};

function getAppointmentColumns(
	onEdit: (appointment: AppointmentWithRelations) => void,
	onDelete: (appointment: AppointmentWithRelations) => void,
	isDeleting: boolean,
	canUpdate: boolean,
	canDelete: boolean,
): ColumnDef<AppointmentWithRelations>[] {
	const columns: ColumnDef<AppointmentWithRelations>[] = [
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => {
				const patient = row.original.patient;
				return (
					<div className="flex min-w-40 flex-col font-medium">
						<span>{patientName(patient)}</span>
					</div>
				);
			},
		},
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => row.original.patient.email,
		},
		{
			id: "doctor",
			header: "Doctor",
			cell: ({ row }) => doctorName(row.original.doctor),
		},
		{
			id: "date",
			header: "Date",
			cell: ({ row }) => formatDate(row.original.appointmentDate),
		},
		{
			id: "time",
			header: "Time",
			cell: ({ row }) => (
				<span className="whitespace-nowrap">
					{formatTime(row.original.startTime)} –{" "}
					{formatTime(row.original.endTime)}
				</span>
			),
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={appointmentStatusClass(
						row.original.status,
					)}
				>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: "reason",
			header: "Reason",
			cell: ({ row }) => (
				<span className="max-w-48 truncate">
					{row.original.reason}
				</span>
			),
		},
	];

	if (canUpdate || canDelete) {
		columns.push({
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					<PermissionGate
						permissions={["update:appointments"]}
					>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Edit appointment for ${patientName(row.original.patient)}`}
							title="Edit appointment"
							onClick={() => onEdit(row.original)}
						>
							<Pencil aria-hidden="true" />
						</Button>
					</PermissionGate>
					<PermissionGate
						permissions={["delete:appointments"]}
					>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Delete appointment for ${patientName(row.original.patient)}`}
							title="Delete appointment"
							disabled={isDeleting}
							onClick={() => onDelete(row.original)}
						>
							<Trash2 aria-hidden="true" />
						</Button>
					</PermissionGate>
				</div>
			),
		});
	}

	return columns;
}

export function AppointmentsList({
	appointments,
	pagination,
	page,
	onPageChange,
	loading,
	error,
	onRetry,
	onCreate,
	onEdit,
	onDelete,
	isDeleting,
}: AppointmentsListProps) {
	const [search, setSearch] = useState("");
	const { data: session } = useSession();
	const canUpdate = hasPermission(
		session?.user?.permissions,
		"update:appointments",
	);
	const canDelete = hasPermission(
		session?.user?.permissions,
		"delete:appointments",
	);
	const visibleAppointments = appointments.filter((appointment) => {
		const patient = appointment.patient;
		const doctor = appointment.doctor;
		return [
			patientName(patient),
			patient?.email,
			doctorName(doctor),
			appointment.reason,
			appointment.status,
		]
			.join(" ")
			.toLowerCase()
			.includes(search.trim().toLowerCase());
	});
	const columns = getAppointmentColumns(
		onEdit,
		onDelete,
		isDeleting,
		canUpdate,
		canDelete,
	);

	return (
		<main className="mx-auto w-full pb-10">
			<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="mt-2 text-sm text-ink-muted">
						{pagination.total} appointment record
						{pagination.total === 1 ? "" : "s"}
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row ml-auto">
					<div className="relative w-full sm:w-72">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
							aria-hidden="true"
						/>
						<Input
							aria-label="Search appointments"
							className="pl-9"
							value={search}
							onChange={(event) =>
								setSearch(event.target.value)
							}
							placeholder="Search appointments"
						/>
					</div>
					<PermissionGate
						permissions={["create:appointments"]}
					>
						<Button type="button" onClick={onCreate}>
							<CalendarPlus aria-hidden="true" />
							Add appointment
						</Button>
					</PermissionGate>
				</div>
			</header>

			{loading ? (
				<div
					className="flex min-h-56 items-center justify-center"
					role="status"
					aria-label="Loading appointments"
				>
					<LoaderCircle
						className="size-7 animate-spin text-brand"
						aria-hidden="true"
					/>
				</div>
			) : error ? (
				<div className="flex flex-col items-center px-5 py-16 text-center">
					<p className="text-sm font-medium text-ink">
						Couldn&apos;t load appointments
					</p>
					<p className="mt-1 max-w-md text-sm text-ink-muted">
						{error}
					</p>
					<Button
						className="mt-4"
						variant="outline"
						onClick={onRetry}
					>
						<RefreshCw aria-hidden="true" />
						Try again
					</Button>
				</div>
			) : (
				<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
					<DataTable
						columns={columns}
						data={visibleAppointments}
						tableClassName="min-w-240"
						emptyState={
							<div>
								<p className="font-medium text-ink">
									{appointments.length === 0
										? "No appointments yet"
										: "No matching appointments"}
								</p>
								<p className="mt-1 text-sm text-ink-muted">
									{appointments.length === 0
										? "Appointments created for your clinic will appear here."
										: "Try another patient, doctor, reason, or status."}
								</p>
							</div>
						}
					/>
					{pagination.totalPages > 1 && (
						<div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
							<p
								className="text-sm text-ink-muted"
								aria-live="polite"
							>
								Page {pagination.page} of{" "}
								{pagination.totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									aria-label="Previous page"
									disabled={page <= 1}
									onClick={() =>
										onPageChange(
											Math.max(
												1,
												page -
													1,
											),
										)
									}
								>
									<ChevronLeft aria-hidden="true" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon"
									aria-label="Next page"
									disabled={
										page >=
										pagination.totalPages
									}
									onClick={() =>
										onPageChange(
											Math.min(
												pagination.totalPages,
												page +
													1,
											),
										)
									}
								>
									<ChevronRight aria-hidden="true" />
								</Button>
							</div>
						</div>
					)}
				</section>
			)}
		</main>
	);
}
