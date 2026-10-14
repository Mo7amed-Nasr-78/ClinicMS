"use client";

import type { Dispatch, SetStateAction } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock3 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DAYS } from "./doctor-schedule-utils";

type ScheduleFieldsValue = {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	slotDuration: number;
	effectiveFrom: string;
	effectiveTo: string;
};

export function DatePickerField({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const selectedDate = value ? parseISO(value) : undefined;

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id={id}
						type="button"
						variant="outline"
						className="w-full justify-start gap-2 border-line bg-surface text-left font-normal hover:bg-muted"
					>
						<CalendarDays
							className="size-4 text-ink-muted"
							aria-hidden="true"
						/>
						{selectedDate &&
						!Number.isNaN(selectedDate.getTime())
							? format(
									selectedDate,
									"EEE, MMM d, yyyy",
								)
							: "Choose a date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto p-1">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(day) => {
							if (day)
								onChange(
									format(day, "yyyy-MM-dd"),
								);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export function TimePickerField({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const [hour = "09", minute = "00"] = value.split(":");

	return (
		<div className="space-y-1.5">
			<Label htmlFor={`${id}-hour`}>{label}</Label>
			<div className="flex items-center gap-2">
				<Clock3
					className="size-4 shrink-0 text-ink-muted"
					aria-hidden="true"
				/>
				<Select
					value={hour}
					onValueChange={(nextHour) =>
						onChange(`${nextHour}:${minute}`)
					}
				>
					<SelectTrigger
						id={`${id}-hour`}
						className="flex-1 bg-surface"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent position="popper" align="start">
						{Array.from({ length: 24 }, (_, item) =>
							String(item).padStart(2, "0"),
						).map((item) => (
							<SelectItem key={item} value={item}>
								{item}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className="font-medium text-ink-muted">:</span>
				<Select
					value={minute}
					onValueChange={(nextMinute) =>
						onChange(`${hour}:${nextMinute}`)
					}
				>
					<SelectTrigger className="flex-1 bg-surface">
						<SelectValue />
					</SelectTrigger>
					<SelectContent position="popper" align="end">
						{["00", "15", "30", "45"].map((item) => (
							<SelectItem key={item} value={item}>
								{item}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export function ScheduleFields<T extends ScheduleFieldsValue>({
	form,
	setForm,
	prefix,
}: {
	form: T;
	setForm: Dispatch<SetStateAction<T>>;
	prefix: string;
}) {
	return (
		<>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-day`}>Day of week</Label>
				<Select
					value={String(form.dayOfWeek)}
					onValueChange={(dayOfWeek) =>
						setForm((current) => ({
							...current,
							dayOfWeek: Number(dayOfWeek),
						}))
					}
				>
					<SelectTrigger
						id={`${prefix}-day`}
						className="w-full"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{DAYS.map((day) => (
							<SelectItem
								key={day.value}
								value={String(day.value)}
							>
								{day.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
				<TimePickerField
					id={`${prefix}-start`}
					label="Start time"
					value={form.startTime}
					onChange={(startTime) =>
						setForm((current) => ({
							...current,
							startTime,
						}))
					}
				/>
				<TimePickerField
					id={`${prefix}-end`}
					label="End time"
					value={form.endTime}
					onChange={(endTime) =>
						setForm((current) => ({
							...current,
							endTime,
						}))
					}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div className="space-y-1.5">
					<Label htmlFor={`${prefix}-duration`}>
						Slot duration (minutes)
					</Label>
					<Input
						id={`${prefix}-duration`}
						type="number"
						min={1}
						step={1}
						value={form.slotDuration}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								slotDuration: Number(
									event.target.value,
								),
							}))
						}
						required
					/>
				</div>
				<DatePickerField
					id={`${prefix}-effective-from`}
					label="Effective from"
					value={form.effectiveFrom}
					onChange={(effectiveFrom) =>
						setForm((current) => ({
							...current,
							effectiveFrom,
						}))
					}
				/>
				<DatePickerField
					id={`${prefix}-effective-to`}
					label="Effective to"
					value={form.effectiveTo}
					onChange={(effectiveTo) =>
						setForm((current) => ({
							...current,
							effectiveTo,
						}))
					}
				/>
			</div>
		</>
	);
}

export function ScheduleSwitch({
	label,
	value,
	onChange,
	onText,
	offText,
}: {
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
	onText: string;
	offText: string;
}) {
	return (
		<div className="flex items-center justify-between border-t border-line pt-4">
			<div>
				<p className="text-sm font-medium text-ink">{label}</p>
				<p className="text-xs text-ink-muted">
					{value ? onText : offText}
				</p>
			</div>
			<button
				aria-label={label}
				aria-checked={value}
				className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${value ? "bg-brand" : "bg-line"}`}
				onClick={() => onChange(!value)}
				role="switch"
				type="button"
			>
				<span
					className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
				/>
			</button>
		</div>
	);
}
