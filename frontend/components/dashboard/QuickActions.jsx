"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { QUICK_ACTIONS } from "./data";

export function QuickActions() {
	const router = useRouter();
	const { data: session } = useSession();
	const visibleActions = QUICK_ACTIONS.filter((action) => {
		if (action.label === "Add patient") {
			return hasPermission(
				session?.user?.permissions,
				"create:patients",
			);
		}
		if (action.label === "New appointment") {
			return hasPermission(
				session?.user?.permissions,
				"create:appointments",
			);
		}
		return true;
	});

	return (
		<div className="bg-surface border border-line rounded-2xl p-5">
			<h2 className="text-[1rem] font-semibold text-ink mb-4">
				Quick actions
			</h2>
			<div className="grid grid-cols-2 gap-3">
				{visibleActions.map((action) => {
					const Icon = action.icon;
					const href =
						action.label === "Add patient"
							? "/dashboard/register-patient"
							: action.label === "New appointment"
								? "/dashboard/appointments?action=create"
								: undefined;
					return (
						<button
							key={action.label}
							type="button"
							onClick={() => {
								if (href)
									router.push(href, {
										scroll: false,
									});
							}}
							className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-line hover:border-brand hover:bg-surface-2 transition-colors duration-150 text-left"
						>
							<span className="text-brand">
								<Icon
									size={18}
									strokeWidth={1.8}
								/>
							</span>
							<span className="text-[0.82rem] font-medium text-ink leading-tight">
								{action.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
