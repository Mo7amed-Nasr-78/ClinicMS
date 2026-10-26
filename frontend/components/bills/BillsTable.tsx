"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { BillWithRelations } from "@/api/services/billsService";
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
	const [printingBill, setPrintingBill] =
		useState<BillWithRelations | null>(null);

	useEffect(() => {
		if (!printingBill) return;

		const handleAfterPrint = () => setPrintingBill(null);
		window.addEventListener("afterprint", handleAfterPrint);
		window.print();

		return () => {
			window.removeEventListener("afterprint", handleAfterPrint);
		};
	}, [printingBill]);

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
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={`Print receipt for bill ${row.original.id.slice(0, 8)}`}
					title="Print receipt"
					onClick={() => setPrintingBill(row.original)}
				>
					<Printer aria-hidden="true" />
				</Button>
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
		<>
			<DataTable
				columns={columns}
				data={bills}
				tableClassName="min-w-220"
				emptyState={emptyState}
			/>
			{printingBill &&
				createPortal(
					<article
						data-print-receipt
						className="mx-auto hidden w-full max-w-[80mm] bg-white p-4 text-sm text-black print:block"
					>
						<header className="mb-5 border-b border-dashed border-gray-400 pb-4 text-center">
							<h1 className="text-xl font-semibold">Receipt</h1>
							<p>
								Bill #{printingBill.id.slice(0, 8)}
							</p>
						</header>
						<section className="space-y-2 border-b border-dashed border-gray-400 pb-4">
							<p className="break-words">
								{printingBill.patient.firstName}{" "}
								{printingBill.patient.lastName}
							</p>
							{printingBill.patient.phone && (
								<p>Phone: {printingBill.patient.phone}</p>
							)}
							{printingBill.patient.email && (
								<p className="break-all">
									Email: {printingBill.patient.email}
								</p>
							)}
							<p>
								Date:{" "}
								{new Date(
									printingBill.createdAt,
								).toLocaleDateString()}
							</p>
							{printingBill.appointment && (
								<p>
									Appointment:{" "}
									{printingBill.appointment.appointmentDate.slice(
										0,
										10,
									)}
								</p>
							)}
						</section>
						<section className="space-y-2 border-b border-dashed border-gray-400 py-4">
							<p className="font-medium">
								{printingBill.description}
							</p>
							{printingBill.dueDate && (
								<p>
									Due date:{" "}
									{printingBill.dueDate.slice(0, 10)}
								</p>
							)}
							<p>
								Status:{" "}
								{formatBillStatus(printingBill.status)}
							</p>
							{printingBill.notes && (
								<p className="break-words">
									Notes: {printingBill.notes}
								</p>
							)}
						</section>
						<footer className="flex justify-between py-4 text-base font-semibold">
							<span>Total</span>
							<span>
								{formatAmount(printingBill.amount)}
							</span>
						</footer>
						<p className="border-t border-dashed border-gray-400 pt-4 text-center text-xs text-gray-600">
							Thank you.
						</p>
					</article>,
					document.body,
				)}
		</>
	);
}
