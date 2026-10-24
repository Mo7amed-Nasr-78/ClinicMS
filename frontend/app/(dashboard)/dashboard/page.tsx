"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TodayQueue } from "@/components/dashboard/TodayQueue";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WaitingPatientsCard } from "@/components/dashboard/WaitingPatientsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";

export default function DashboardHome() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { data: session } = useSession();
	const isDoctor = session?.user?.role?.toLowerCase() === "doctor";
	const isReceptionist =
		session?.user?.role?.toLowerCase() === "receptionist";

	return (
		<div className="h-screen bg-bg text-ink font-sans antialiased flex overflow-hidden">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			<div className="h-full flex-1 flex flex-col min-w-0 overflow-y-scroll px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} title={"dashboard"}/>

				<main className="w-full pt-3 pb-5">
					<PageHeader />
					<StatsGrid />

					<div className={`grid grid-cols-1 ${isDoctor || isReceptionist? 'xl:grid-cols-4': 'xl:grid-cols-3'} gap-4 mt-4`}>
						<div className="xl:col-span-2">
							<TodayQueue />
						</div>
						<div className={`flex flex-col gap-4 ${isDoctor || isReceptionist? 'xl:col-span-2': 'col-span-1'}`}>
							{isDoctor || isReceptionist ? (
								<WaitingPatientsCard />
							) : (
								<QuickActions />
							)}
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
