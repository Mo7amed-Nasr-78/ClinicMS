"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	displayDay,
	displayTime,
	getDoctorName,
	type ScheduleRow,
} from "./doctor-schedule-utils";

type DoctorScheduleTableProps = {
	schedules: ScheduleRow[];
	isUpdating: boolean;
	isDeleting: boolean;
	emptyState: React.ReactNode;
	onEdit: (schedule: ScheduleRow) => void;
	onDelete: (schedule: ScheduleRow) => void;
};

export function DoctorScheduleTable({
	schedules,
	isUpdating,
	isDeleting,
	emptyState,
	onEdit,
	onDelete,
}: DoctorScheduleTableProps) {
	const { data: session } = useSession();
	const canUpdate = hasPermission(
		session?.user?.permissions,
		"update:doctor-schedules",
	);
	const canDelete = hasPermission(
		session?.user?.permissions,
		"delete:doctor-schedules",
	);
	const columns: ColumnDef<ScheduleRow>[] = [
		{
			id: "doctor",
			header: "Doctor Name",
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.doctor
						? getDoctorName(row.original.doctor)
						: "Doctor"}
				</div>
			),
		},
		{
			id: "specialty",
			header: "Specialty",
			cell: ({ row }) => (
				<div className="text-sm">
					{row.original.doctor?.specialty}
				</div>
			),
		},
		{
			accessorKey: "dayOfWeek",
			header: "Day",
			cell: ({ row }) => displayDay(row.original.dayOfWeek),
		},
		{
			id: "hours",
			header: "Available hours",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 text-sm">
					<Clock3
						className="size-4 text-ink-faint"
						aria-hidden="true"
					/>
					{displayTime(row.original.startTime)} –{" "}
					{displayTime(row.original.endTime)}
				</div>
			),
		},
		{
			accessorKey: "isAvailable",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant="outline"
					className={
						row.original.isAvailable &&
						row.original.isActive
							? "border-transparent bg-brand/10 text-brand"
							: "border-line text-ink-muted"
					}
				>
					{!row.original.isActive
						? "Inactive"
						: row.original.isAvailable
							? "Available"
							: "Not available"}
				</Badge>
			),
		},
	];
	if (canUpdate || canDelete) {
		columns.push({
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex items-center justify-end gap-1">
					{canUpdate && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Edit schedule"
							title="Edit schedule"
							disabled={isUpdating || isDeleting}
							onClick={() => onEdit(row.original)}
						>
							<Pencil aria-hidden="true" />
						</Button>
					)}
					{canDelete && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Delete schedule"
							title="Delete schedule"
							disabled={isUpdating || isDeleting}
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
			data={schedules}
			tableClassName="min-w-160"
			emptyState={emptyState}
		/>
	);
}
