"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TodayQueue } from "@/components/dashboard/TodayQueue";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";

export default function DashboardHome() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="h-screen bg-bg text-ink font-sans antialiased flex overflow-hidden">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			<div className="h-full flex-1 flex flex-col min-w-0 overflow-y-scroll px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} />

				<main className="w-full pt-3 pb-5">
					{/* <PageHeader /> */}
					<StatsGrid />

					<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
						<div className="xl:col-span-2">
							<TodayQueue />
						</div>
						<div className="flex flex-col gap-6">
							<QuickActions />
							<ActivityFeed />
						</div>
					</div>

					{/* <div className="mt-6">
						<WeeklyOverview />
					</div> */}
				</main>
			</div>
		</div>
	);
}
