"use client";

import type { Dispatch, SetStateAction } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, RefreshCw } from "lucide-react";
import type { Doctor } from "@/api/services/doctorsService";
import { Button } from "@/components/ui/button";
import { DoctorTable } from "./DoctorTable";

type DoctorsRecordsProps = {
	doctors: Doctor[];
	loading: boolean;
	error: string | null;
	onRetry: () => void;
	onEdit: (doctor: Doctor) => void;
	onDeactivate: (doctor: Doctor) => void;
	total: number;
	currentPage: number;
	totalPages: number;
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
};

export function DoctorsRecords({
	doctors,
	loading,
	error,
	onRetry,
	onEdit,
	onDeactivate,
	total,
	currentPage,
	totalPages,
	page,
	setPage,
}: DoctorsRecordsProps) {
	return (
		<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
			{/* <DoctorsSearch value={search} onChange={onSearchChange} /> */}

			{loading ? (
				<div
					className="flex min-h-56 items-center justify-center"
					role="status"
					aria-label="Loading doctors"
				>
					<LoaderCircle
						className="size-7 animate-spin text-brand"
						aria-hidden="true"
					/>
				</div>
			) : error ? (
				<div className="flex flex-col items-center px-5 py-16 text-center">
					<p className="text-sm font-medium text-ink">
						Couldn&apos;t load doctor records
					</p>
					<p className="mt-1 max-w-md text-sm text-ink-muted">{error}</p>
					<Button
						className="mt-4"
						variant="outline"
						onClick={onRetry}
					>
						<RefreshCw size={15} aria-hidden="true" />
						Try again
					</Button>
				</div>
			) : (
				<>
					<DoctorTable
						doctors={doctors}
						onEdit={onEdit}
						onDeactivate={onDeactivate}
						emptyState={
							<p className="text-center text-ink-muted">
								{total === 0
									? "No doctors registered with this clinic yet."
									: "No matching doctors. Try a different search, specialty, or license number."}
							</p>
						}
					/>
					{totalPages > 1 && (
						<div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-ink-muted" aria-live="polite">
								Page {currentPage} of {totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									aria-label="Previous page"
									disabled={page <= 1}
									onClick={() =>
										setPage((current) =>
											Math.max(1, current - 1),
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
									disabled={page >= totalPages}
									onClick={() =>
										setPage((current) =>
											Math.min(totalPages, current + 1),
										)
									}
								>
									<ChevronRight aria-hidden="true" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</section>
	);
}
