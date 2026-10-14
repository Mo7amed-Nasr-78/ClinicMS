import { Temporal } from "temporal-polyfill";

export type AvailabilitySchedule = {
	id: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	isActive: boolean;
	slotDuration: number;
	effectiveFrom: Temporal.Instant | null;
	effectiveTo: Temporal.Instant | null;
};

export type AvailabilityAppointment = {
	status: string;
	startTime: string;
	endTime: string;
};

export type UtcDayBounds = {
	start: Temporal.Instant;
	end: Temporal.Instant;
	weekday: number;
};

export function getUtcDayBounds(date: string): UtcDayBounds | undefined {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;

	const startMs = Date.parse(`${date}T00:00:00.000Z`);
	if (
		!Number.isFinite(startMs) ||
		new Date(startMs).toISOString().slice(0, 10) !== date
	) {
		return undefined;
	}

	return {
		start: Temporal.Instant.fromEpochMilliseconds(startMs),
		end: Temporal.Instant.fromEpochMilliseconds(startMs + 86_400_000),
		weekday: new Date(startMs).getUTCDay(),
	};
}

export function parseTimeMinutes(value: string) {
	const normalized = value.trim();
	const twentyFourHourMatch = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(
		normalized,
	);
	if (twentyFourHourMatch) {
		return (
			Number(twentyFourHourMatch[1]) * 60 +
			Number(twentyFourHourMatch[2])
		);
	}

	const twelveHourMatch = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(
		normalized,
	);
	if (!twelveHourMatch) return undefined;

	const hour = Number(twelveHourMatch[1]);
	const meridiem = twelveHourMatch[3].toUpperCase();
	const hour24 =
		hour === 12
			? meridiem === "AM"
				? 0
				: 12
			: meridiem === "PM"
				? hour + 12
				: hour;
	return hour24 * 60 + Number(twelveHourMatch[2]);
}

export function scheduleTimeRangesOverlap(
	firstStartTime: string,
	firstEndTime: string,
	secondStartTime: string,
	secondEndTime: string,
) {
	const firstStart = parseTimeMinutes(firstStartTime);
	const firstEnd = parseTimeMinutes(firstEndTime);
	const secondStart = parseTimeMinutes(secondStartTime);
	let secondEnd = parseTimeMinutes(secondEndTime);
	if (
		secondStart !== undefined &&
		secondEnd !== undefined &&
		secondEnd < secondStart
	) {
		secondEnd += 24 * 60;
	}
	let firstAdjustedEnd = firstEnd;
	if (
		firstStart !== undefined &&
		firstAdjustedEnd !== undefined &&
		firstAdjustedEnd < firstStart
	) {
		firstAdjustedEnd += 24 * 60;
	}

	if (
		firstStart === undefined ||
		firstAdjustedEnd === undefined ||
		secondStart === undefined ||
		secondEnd === undefined ||
		firstAdjustedEnd <= firstStart ||
		secondEnd <= secondStart
	) {
		return false;
	}

	return firstStart < secondEnd && secondStart < firstAdjustedEnd;
}

export function isAppointmentBlocking(status: string) {
	return !["cancelled", "canceled"].includes(status.trim().toLowerCase());
}

export function calculateAvailabilitySlots(
	date: string,
	schedules: AvailabilitySchedule[],
	appointments: AvailabilityAppointment[],
) {
	const bounds = getUtcDayBounds(date);
	if (!bounds) return [];

	const blockingAppointments = appointments
		.filter((appointment) => isAppointmentBlocking(appointment.status))
		.map((appointment) => {
			const start = parseTimeMinutes(appointment.startTime);
			let end = parseTimeMinutes(appointment.endTime);
			if (start !== undefined && end !== undefined && end < start) {
				end += 24 * 60;
			}
			return { start, end };
		})
		.filter(
			(appointment) =>
				appointment.start !== undefined &&
				appointment.end !== undefined &&
				appointment.end > appointment.start,
		)
		.map((appointment) => ({
			start:
				bounds.start.epochMilliseconds +
				appointment.start * 60_000,
			end:
				bounds.start.epochMilliseconds +
				appointment.end * 60_000,
		}));

	const candidates: {
		start: number;
		end: number;
		scheduleId: string;
	}[] = [];

	for (const schedule of schedules) {
		if (
			!schedule.isAvailable ||
			!schedule.isActive ||
			schedule.dayOfWeek !== bounds.weekday ||
			(schedule.effectiveFrom &&
				schedule.effectiveFrom.epochMilliseconds >=
					bounds.end.epochMilliseconds) ||
			(schedule.effectiveTo &&
				schedule.effectiveTo.epochMilliseconds <
					bounds.start.epochMilliseconds)
		) {
			continue;
		}

		const firstMinute = parseTimeMinutes(schedule.startTime);
		let lastMinute = parseTimeMinutes(schedule.endTime);
		const duration = schedule.slotDuration;
		if (
			firstMinute !== undefined &&
			lastMinute !== undefined &&
			lastMinute < firstMinute
		) {
			lastMinute += 24 * 60;
		}

		if (
			firstMinute === undefined ||
			lastMinute === undefined ||
			lastMinute <= firstMinute ||
			!Number.isInteger(duration) ||
			duration <= 0
		) {
			continue;
		}

		for (
			let startMinute = firstMinute;
			startMinute + duration <= lastMinute;
			startMinute += duration
		) {
			const start =
				bounds.start.epochMilliseconds + startMinute * 60_000;
			const end = start + duration * 60_000;
			if (
				!blockingAppointments.some(
					(appointment) =>
						start < appointment.end &&
						end > appointment.start,
				)
			) {
				candidates.push({
					start,
					end,
					scheduleId: schedule.id,
				});
			}
		}
	}

	candidates.sort(
		(left, right) =>
			left.start - right.start ||
			left.end - right.end ||
			left.scheduleId.localeCompare(right.scheduleId),
	);

	const accepted: typeof candidates = [];
	for (const candidate of candidates) {
		if (
			accepted.some(
				(slot) =>
					candidate.start < slot.end &&
					candidate.end > slot.start,
			)
		) {
			continue;
		}
		accepted.push(candidate);
	}

	return accepted.map((slot) => ({
		startTime: new Date(slot.start).toISOString().slice(11, 16),
		endTime: new Date(slot.end).toISOString().slice(11, 16),
	}));
}

export function isAppointmentSlotAvailable(
	date: string,
	startTime: string,
	endTime: string,
	schedules: AvailabilitySchedule[],
	appointments: AvailabilityAppointment[],
) {
	const startMinute = parseTimeMinutes(startTime);
	let endMinute = parseTimeMinutes(endTime);
	if (
		startMinute !== undefined &&
		endMinute !== undefined &&
		endMinute < startMinute
	) {
		endMinute += 24 * 60;
	}
	if (
		!getUtcDayBounds(date) ||
		startMinute === undefined ||
		endMinute === undefined ||
		endMinute <= startMinute ||
		endMinute > 24 * 60
	) {
		return false;
	}

	const startClock = `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`;
	const normalizedEndMinute = endMinute % (24 * 60);
	const endClock = `${String(Math.floor(normalizedEndMinute / 60)).padStart(2, "0")}:${String(normalizedEndMinute % 60).padStart(2, "0")}`;
	return calculateAvailabilitySlots(date, schedules, appointments).some(
		(slot) =>
			slot.startTime === startClock && slot.endTime === endClock,
	);
}
