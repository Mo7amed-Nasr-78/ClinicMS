"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import type { Patient } from "@/api/services/patientService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { displayLabel, displayName, patientStatusClass } from "./patient-utils";

type PatientTableProps = {
	patients: Patient[];
	onEdit: (patient: Patient) => void;
	onDelete: (patient: Patient) => void;
	onSchedule: (patient: Patient) => void;
	isDeleting: boolean;
	isCreatingAppointment: boolean;
	emptyState: React.ReactNode;
};

export function PatientTable({
	patients,
	onEdit,
	onDelete,
	onSchedule,
	isDeleting,
	isCreatingAppointment,
	emptyState,
}: PatientTableProps) {
	const { data: session } = useSession();
	const canCreateAppointments = hasPermission(
		session?.user?.permissions,
		"create:appointments",
	);
	const canUpdatePatients = hasPermission(
		session?.user?.permissions,
		"update:patients",
	);
	const canDeletePatients = hasPermission(
		session?.user?.permissions,
		"delete:patients",
	);
	const columns: ColumnDef<Patient>[] = [
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => (
				<div className="flex min-w-48 flex-col font-medium">
					<Link
						href={`/dashboard/patients/${row.original.id}`}
						className="text-ink hover:text-brand"
					>
						{displayName(
							row.original.firstName,
							row.original.lastName,
						)}
					</Link>
				</div>
			),
		},
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => row.original.email,
		},
		{
			accessorKey: "dateOfBirth",
			header: "Date of birth",
			cell: ({ row }) => row.original.dateOfBirth || "Not provided",
		},
		{
			accessorKey: "gender",
			header: "Gender",
			cell: ({ row }) => displayLabel(row.original.gender),
		},
		{
			accessorKey: "bloodType",
			header: "Blood type",
			cell: ({ row }) => row.original.bloodType || "Not provided",
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={patientStatusClass(
						row.original.status,
					)}
				>
					{displayLabel(row.original.status)}
				</Badge>
			),
		},
	];
	if (canCreateAppointments || canUpdatePatients || canDeletePatients) {
		columns.push({
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					{canCreateAppointments && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Add appointment for ${displayName(row.original.firstName, row.original.lastName)}`}
							title="Add appointment"
							disabled={isCreatingAppointment}
							onClick={() =>
								onSchedule(row.original)
							}
						>
							<CalendarPlus aria-hidden="true" />
						</Button>
					)}
					{canUpdatePatients && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Edit ${displayName(row.original.firstName, row.original.lastName)}`}
							title="Edit patient"
							onClick={() => onEdit(row.original)}
						>
							<Pencil aria-hidden="true" />
						</Button>
					)}
					{canDeletePatients && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Delete ${displayName(row.original.firstName, row.original.lastName)}`}
							title="Delete patient"
							disabled={isDeleting}
							onClick={() => onDelete(row.original)}
						>
							<Trash2 aria-hidden="true" />
						</Button>
					)}
				</div>
			),
		});
	}

	return (
		<DataTable
			columns={columns}
			data={patients}
			tableClassName="min-w-190"
			emptyState={emptyState}
		/>
	);
}
