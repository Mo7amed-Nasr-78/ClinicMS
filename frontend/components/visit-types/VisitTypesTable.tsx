"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import type { VisitType } from "@/api/services/visitTypesService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useClinicStore } from "@/stores/clinicStore";
import { hasPermission } from "@/lib/permissions";

type VisitTypesTableProps = {
	visitTypes: VisitType[];
	onEdit: (visitType: VisitType) => void;
	onDeactivate: (visitType: VisitType) => void;
};

function formatPrice(price: VisitType["price"]) {
	if (price == null) return "Not set";
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2,
	}).format(Number(price));
}

export function VisitTypesTable({
	visitTypes,
	onEdit,
	onDeactivate,
}: VisitTypesTableProps) {
	const { data: session } = useSession();
	const clinicPermissions = useClinicStore(
		(state) => state.user?.permissions,
	);
	const permissions = session?.user?.permissions?.length
		? session.user.permissions
		: clinicPermissions;
	const canUpdate = hasPermission(permissions, "update:visit-types");
	const canDelete = hasPermission(permissions, "delete:visit-types");
	const columns: ColumnDef<VisitType>[] = [
		{
			id: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 font-medium">
					{row.original.color && (
						<span
							aria-label={`Color ${row.original.color}`}
							className="size-3 rounded-full border border-line"
							style={{
								backgroundColor: row.original.color,
							}}
						/>
					)}
					{row.original.name}
				</div>
			),
		},
		{
			id: "duration",
			header: "Duration",
			cell: ({ row }) => `${row.original.defaultDurationMin} min`,
		},
		{
			id: "price",
			header: "Price",
			cell: ({ row }) => formatPrice(row.original.price),
		},
		{
			id: "type",
			header: "Type",
			cell: ({ row }) =>
				row.original.isFollowUp ? "Follow-up" : "Standard",
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={
						row.original.isActive
							? "border-brand/30 text-brand-deep"
							: "border-line text-ink-muted"
					}
				>
					{row.original.isActive ? "Active" : "Inactive"}
				</Badge>
			),
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
							aria-label={`Edit ${row.original.name}`}
							title="Edit visit type"
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
							aria-label={`Deactivate ${row.original.name}`}
							title="Deactivate visit type"
							disabled={!row.original.isActive}
							onClick={() => onDeactivate(row.original)}
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
			data={visitTypes}
			tableClassName="min-w-150"
			emptyState={
				<span className="text-ink-muted">
					No visit types yet. Add one to start configuring
					appointments.
				</span>
			}
		/>
	);
}
