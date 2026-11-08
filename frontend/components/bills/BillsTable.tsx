"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { BillWithRelations } from "@/api/services/billsService";
import { BillPrintButton } from "./BillPrintButton";
import {
	billStatusClass,
	formatAmount,
	formatBillStatus,
} from "./bill-utils";

type BillsTableProps = {
	bills: BillWithRelations[];
	canUpdate: boolean;
	canDelete: boolean;
	isDeleting: boolean;
	onEdit: (bill: BillWithRelations) => void;
	onDelete: (bill: BillWithRelations) => void;
	emptyState: React.ReactNode;
};

export function BillsTable({
	bills,
	canUpdate,
	canDelete,
	isDeleting,
	onEdit,
	onDelete,
	emptyState,
}: BillsTableProps) {
	const columns: ColumnDef<BillWithRelations>[] = [
		{
			accessorKey: "id",
			header: "Bill",
			cell: ({ row }) => (
				<span className="font-medium text-ink">
					#{row.original.id.slice(0, 8)}
				</span>
			),
		},
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) =>
				`${row.original.patient.firstName} ${row.original.patient.lastName}`.trim(),
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => row.original.description,
		},
		{
			id: "appointment",
			header: "Appointment",
			cell: ({ row }) =>
				row.original.appointment
					? row.original.appointment.appointmentDate.slice(
							0,
							10,
						)
					: "—",
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => formatAmount(row.original.amount),
		},
		{
			accessorKey: "dueDate",
			header: "Due date",
			cell: ({ row }) =>
				row.original.dueDate?.slice(0, 10) || "—",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={billStatusClass(row.original.status)}
				>
					{formatBillStatus(row.original.status)}
				</Badge>
			),
		},
	];

	columns.push({
		id: "actions",
		header: () => <div className="text-right">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-end gap-1">
				<BillPrintButton bill={row.original} compact />
				{canUpdate && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Edit bill ${row.original.id.slice(0, 8)}`}
						title="Edit bill"
						onClick={() => onEdit(row.original)}
					>
						<Pencil aria-hidden="true" />
					</Button>
				)}
				{canDelete && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={`Delete bill ${row.original.id.slice(0, 8)}`}
						title="Delete bill"
						disabled={isDeleting}
						onClick={() => onDelete(row.original)}
					>
						<Trash2 aria-hidden="true" />
					</Button>
				)}
			</div>
		),
	});

	return (
		<DataTable
			columns={columns}
			data={bills}
			tableClassName="min-w-220"
			emptyState={emptyState}
		/>
	);
}
