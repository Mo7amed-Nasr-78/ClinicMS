"use client";

import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/components/ui/button";

type DoctorsPageHeaderProps = {
	total: number;
	onAdd: () => void;
};

export function DoctorsPageHeader({ onAdd }: DoctorsPageHeaderProps) {
	return (
		<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
			<PermissionGate permissions={["create:doctors"]}>
				<Button type="button" onClick={onAdd}>
					Add doctor
				</Button>
			</PermissionGate>
		</header>
	);
}
