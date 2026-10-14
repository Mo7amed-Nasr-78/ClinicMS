"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { getMyClinic } from "@/api/services/clinicService";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";

type ReportPageLayoutProps = {
	title: string;
	activeItem: "Doctors report" | "Patients report";
	children: ReactNode;
};

export function ReportPageLayout({
	title,
	activeItem,
	children,
}: ReportPageLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const clinicQuery = useQuery({
		queryKey: ["reports", "clinic"],
		queryFn: getMyClinic,
	});

	return (
		<div className="print-report-shell flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<div className="print:hidden">
				<Sidebar
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
					activeItem={activeItem}
				/>
			</div>
			<div className="print-report-content flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<div className="print:hidden">
					<Topbar
						onMenuClick={() => setSidebarOpen(true)}
					/>
				</div>
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 border-b border-line pb-4 pt-3 sm:flex-row sm:items-end sm:justify-between print:hidden">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
								Clinic reports
							</p>
							<h1 className="mt-1 font-serif text-4xl font-normal text-ink">
								{title}
							</h1>
						</div>
						<Button
							type="button"
							className="gap-2"
							onClick={() => window.print()}
						>
							<Printer aria-hidden="true" />
							Print report
						</Button>
					</header>

					<div
						data-print-report
						className="mt-5 rounded-lg border border-line bg-surface p-4 sm:p-6"
					>
						<header className="mb-5 border-b border-line pb-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
								{title}
							</p>
							<h2 className="mt-1 font-serif text-3xl font-normal text-ink">
								{clinicQuery.data?.name ??
									"Clinic"}
							</h2>
							<p className="mt-1 text-sm text-ink-muted">
								{clinicQuery.data?.address ??
									"Clinic address unavailable"}
							</p>
						</header>
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
