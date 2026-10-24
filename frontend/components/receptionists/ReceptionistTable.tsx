"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, UserRoundX } from "lucide-react";
import type { Receptionist } from "@/api/services/receptionistsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	formatReceptionistDate,
	receptionistName,
	receptionistStatusClass,
	receptionistStatusLabel,
} from "./receptionist-utils";

type ReceptionistTableProps = {
	receptionists: Receptionist[];
	onEdit: (receptionist: Receptionist) => void;
	onDeactivate: (receptionist: Receptionist) => void;
	canUpdate: boolean;
	canDelete: boolean;
	emptyState: React.ReactNode;
};

export function ReceptionistTable({
	receptionists,
	onEdit,
	onDeactivate,
	canUpdate,
	canDelete,
	emptyState,
}: ReceptionistTableProps) {
	const columns: ColumnDef<Receptionist>[] = [
		{
			id: "name",
			header: "Receptionist",
			cell: ({ row }) => (
				<span className="font-medium">
					{receptionistName(row.original)}
				</span>
			),
		},
		{
			id: "email",
			header: "Email",
			cell: ({ row }) => row.original.user.email,
		},
		{
			id: "phone",
			header: "Phone",
			cell: ({ row }) => row.original.user.phone || "—",
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={receptionistStatusClass(
						row.original.status,
					)}
				>
					{receptionistStatusLabel(row.original.status)}
				</Badge>
			),
		},
		{
			id: "createdAt",
			header: "Added",
			cell: ({ row }) =>
				formatReceptionistDate(row.original.createdAt),
		},
	];

	if (canUpdate || canDelete) {
		columns.push({
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					{canUpdate && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Edit ${receptionistName(row.original)}`}
							title="Edit receptionist"
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
							aria-label={`Deactivate ${receptionistName(row.original)}`}
							title="Deactivate receptionist"
							disabled={
								row.original.status.toLowerCase() !==
								"active"
							}
							onClick={() =>
								onDeactivate(row.original)
							}
						>
							<UserRoundX aria-hidden="true" />
						</Button>
					)}
				</div>
			),
		});
	}

	return (
		<DataTable
			columns={columns}
			data={receptionists}
			tableClassName="min-w-180"
			emptyState={emptyState}
		/>
	);
}
