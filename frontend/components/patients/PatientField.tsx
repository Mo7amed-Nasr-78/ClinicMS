"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PatientFieldProps = ComponentProps<typeof Input> & {
	label: string;
	error?: string;
};

export function PatientField({
	id,
	label,
	error,
	required,
	...props
}: PatientFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-sm font-medium text-ink">
				{label}{" "}
				{required && (
					<span
						className="text-accent-strong"
						aria-hidden="true"
					>
						*
					</span>
				)}
			</Label>
			<Input
				id={id}
				required={required}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
				{...props}
			/>
			{error && (
				<p
					id={`${id}-error`}
					role="alert"
					className="text-xs text-accent-strong"
				>
					{error}
				</p>
			)}
		</div>
	);
}
