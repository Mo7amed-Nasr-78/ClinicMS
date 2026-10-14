import { Check } from "lucide-react";

type StepperProps = {
	steps: { label: string }[];
	current: number; // zero-based
};

export function Stepper({ steps, current }: StepperProps) {
	return (
		<div className="mb-10">
			<p
				className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-4"
				aria-live="polite"
			>
				Step {current + 1} of {steps.length}
			</p>
			<ol className="flex gap-2">
				{steps.map((step, i) => {
					const done = i < current;
					const active = i === current;
					return (
						<li
							key={step.label}
							className="flex-1"
							aria-current={active ? "step" : undefined}
						>
							<div
								className={`h-1 rounded-full transition-colors duration-300 ${
									done || active ? "bg-brand" : "bg-line"
								}`}
							/>
							<span
								className={`mt-2 flex items-center gap-1 text-[0.78rem] ${
									active
										? "text-ink font-medium"
										: done
											? "text-ink-muted"
											: "text-ink-faint"
								}`}
							>
								{done && <Check size={12} strokeWidth={2.4} className="text-brand" />}
								{step.label}
							</span>
						</li>
					);
				})}
			</ol>
		</div>
	);
}
