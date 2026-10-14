"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "cn";

function Calendar({ className, classNames, ...props }: DayPickerProps) {
	return (
		<DayPicker
			className={cn("w-fit", className)}
			classNames={{
				months: "flex flex-col",
				month: "space-y-4",
				month_caption:
					"relative flex h-8 items-center justify-center",
				caption_label: "text-sm font-medium text-ink",
				nav: "absolute inset-x-0 flex items-center justify-between",
				button_previous:
					"inline-flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-muted hover:text-ink",
				button_next:
					"inline-flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-muted hover:text-ink",
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday: "w-9 text-center text-xs font-normal text-ink-muted",
				week: "mt-1 flex w-full",
				day: "relative size-9 p-0 text-center text-sm",
				day_button:
					"inline-flex size-9 items-center justify-center rounded-md text-sm text-ink outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand/50",
				selected: "[&>button]:bg-brand [&>button]:font-medium [&>button]:text-white [&>button]:hover:bg-brand",
				today: "[&>button]:bg-muted [&>button]:font-semibold",
				outside: "text-ink-faint opacity-50",
				disabled: "text-ink-faint opacity-40",
				hidden: "invisible",
				...classNames,
			}}
			{...props}
		/>
	);
}

export { Calendar };
