"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Doctor } from "@/api/services/doctorsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	doctorDisplayName,
	doctorStatusClass,
	formatCurrency,
	formatDoctorDate,
	isDoctorInactive,
} from "./doctor-utils";

type DoctorTableProps = {
	doctors: Doctor[];
	onEdit: (doctor: Doctor) => void;
	onDeactivate: (doctor: Doctor) => void;
	emptyState: React.ReactNode;
};

export function DoctorTable({
	doctors,
	onEdit,
	onDeactivate,
	emptyState,
}: DoctorTableProps) {
	const columns: ColumnDef<Doctor>[] = [
		{
			id: "doctor",
			header: "Doctor",
			cell: ({ row }) => (
				<div className="flex min-w-44 flex-col font-medium">
					<span>{doctorDisplayName(row.original)}</span>
				</div>
			),
		},
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => (
				<div className="flex min-w-44 flex-col">
					<span className="text-ink-muted">
						{row.original.user?.email ?? "-"}
					</span>
				</div>
			),
		},
		{ accessorKey: "specialty", header: "Specialty" },
		{ accessorKey: "licenseNumber", header: "License" },
		{
			id: "duration",
			header: "Duration",
			cell: ({ row }) => (
				<>{row.original.consultationDuration} min</>
			),
		},
		{
			id: "fee",
			header: "Fee",
			cell: ({ row }) =>
				formatCurrency(row.original.consultationFee),
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={doctorStatusClass(row.original.status)}
				>
					{row.original.status?.toLowerCase() ?? "active"}
				</Badge>
			),
		},
		{
			id: "created",
			header: "Created",
			cell: ({ row }) => formatDoctorDate(row.original.createdAt),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Edit ${doctorDisplayName(row.original)}`}
						title="Edit doctor"
						onClick={() => onEdit(row.original)}
					>
						<Pencil aria-hidden="true" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Deactivate ${doctorDisplayName(row.original)}`}
						title="Deactivate doctor"
						disabled={isDoctorInactive(row.original)}
						onClick={() => onDeactivate(row.original)}
					>
						<Trash2 aria-hidden="true" />
					</Button>
				</div>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={doctors}
			tableClassName="min-w-240"
			emptyState={emptyState}
		/>
	);
}
