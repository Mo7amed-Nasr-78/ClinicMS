"use client";

import type { ReactNode } from "react";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
	type RowData,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type DataTableProps<TData extends RowData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	emptyState: ReactNode;
	tableClassName?: string;
};

export function DataTable<TData extends RowData, TValue>({
	columns,
	data,
	emptyState,
	tableClassName,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table className={tableClassName}>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow
						key={headerGroup.id}
						className="hover:bg-transparent"
					>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column
												.columnDef
												.header,
											header.getContext(),
										)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							className="odd:bg-surface-2/50"
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(
										cell.column
											.columnDef
											.cell,
										cell.getContext(),
									)}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell
							colSpan={columns.length}
							className="h-36 text-center"
						>
							{emptyState}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
