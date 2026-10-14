import assert from "node:assert/strict";
import test from "node:test";
import { Temporal } from "temporal-polyfill";
import {
	calculateAvailabilitySlots,
	getUtcDayBounds,
	isAppointmentBlocking,
	isAppointmentSlotAvailable,
	parseTimeMinutes,
	scheduleTimeRangesOverlap,
	type AvailabilityAppointment,
	type AvailabilitySchedule,
} from "./availability.ts";

const date = "2026-10-18";
const schedule = (
	fields: Partial<AvailabilitySchedule> = {},
): AvailabilitySchedule => ({
	id: "schedule-1",
	dayOfWeek: 0,
	startTime: "09:00",
	endTime: "12:00",
	isAvailable: true,
	isActive: true,
	slotDuration: 30,
	effectiveFrom: null,
	effectiveTo: null,
	...fields,
});

const appointment = (
	startTime: string,
	endTime: string,
	status = "scheduled",
): AvailabilityAppointment => ({
	status,
	startTime,
	endTime,
});

test("returns fixed-duration slots inside an applicable recurring schedule", () => {
	assert.deepEqual(calculateAvailabilitySlots(date, [schedule()], []), [
		{ startTime: "09:00", endTime: "09:30" },
		{ startTime: "09:30", endTime: "10:00" },
		{ startTime: "10:00", endTime: "10:30" },
		{ startTime: "10:30", endTime: "11:00" },
		{ startTime: "11:00", endTime: "11:30" },
		{ startTime: "11:30", endTime: "12:00" },
	]);
});

test("returns no slots for a different weekday or an inactive schedule", () => {
	assert.deepEqual(calculateAvailabilitySlots(date, [], []), []);
	assert.deepEqual(
		calculateAvailabilitySlots(date, [schedule({ dayOfWeek: 1 })], []),
		[],
	);
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[schedule({ isActive: false })],
			[],
		),
		[],
	);
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[schedule({ isAvailable: false })],
			[],
		),
		[],
	);
});

test("respects inclusive effective date bounds", () => {
	const before = Temporal.Instant.from("2026-10-19T00:00:00Z");
	const after = Temporal.Instant.from("2026-10-17T23:59:59Z");
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[schedule({ effectiveFrom: before })],
			[],
		),
		[],
	);
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[schedule({ effectiveTo: after })],
			[],
		),
		[],
	);
	assert.equal(
		calculateAvailabilitySlots(
			date,
			[
				schedule({
					effectiveFrom: Temporal.Instant.from(
						"2026-10-18T00:00:00Z",
					),
					effectiveTo: Temporal.Instant.from(
						"2026-10-18T23:59:59Z",
					),
				}),
			],
			[],
		).length,
		6,
	);
});

test("supports multiple periods, deduplicates equal slots, and resolves overlaps deterministically", () => {
	const slots = calculateAvailabilitySlots(
		date,
		[
			schedule({ id: "morning", endTime: "10:00" }),
			schedule({
				id: "overlap",
				startTime: "09:30",
				endTime: "10:30",
			}),
			schedule({
				id: "afternoon",
				startTime: "13:00",
				endTime: "14:00",
			}),
		],
		[],
	);
	assert.deepEqual(slots, [
		{ startTime: "09:00", endTime: "09:30" },
		{ startTime: "09:30", endTime: "10:00" },
		{ startTime: "10:00", endTime: "10:30" },
		{ startTime: "13:00", endTime: "13:30" },
		{ startTime: "13:30", endTime: "14:00" },
	]);
});

test("excludes exact and partial appointment overlaps but allows adjacent slots", () => {
	const appointments = [
		appointment("09:00", "09:30"),
		appointment("10:10", "10:20"),
	];
	assert.deepEqual(
		calculateAvailabilitySlots(date, [schedule()], appointments),
		[
			{ startTime: "09:30", endTime: "10:00" },
			{ startTime: "10:30", endTime: "11:00" },
			{ startTime: "11:00", endTime: "11:30" },
			{ startTime: "11:30", endTime: "12:00" },
		],
	);
});

test("canceled statuses do not block; all current and unknown statuses do", () => {
	assert.equal(isAppointmentBlocking("cancelled"), false);
	assert.equal(isAppointmentBlocking("canceled"), false);
	assert.equal(isAppointmentBlocking("inWalk"), true);
	assert.equal(isAppointmentBlocking("scheduled"), true);
	assert.equal(isAppointmentBlocking("Telemedicine"), true);
	assert.equal(isAppointmentBlocking("followUp"), true);
	assert.equal(isAppointmentBlocking("pending"), true);
});

test("validates bookable appointment intervals against generated slots", () => {
	assert.equal(
		isAppointmentSlotAvailable(
			date,
			"09:30",
			"10:00",
			[schedule()],
			[],
		),
		true,
	);
	assert.equal(
		isAppointmentSlotAvailable(
			date,
			"09:15",
			"09:45",
			[schedule()],
			[],
		),
		false,
	);
	assert.equal(
		isAppointmentSlotAvailable(
			date,
			"09:00:30",
			"09:30:30",
			[schedule()],
			[],
		),
		false,
	);
});

test("rejects malformed and impossible dates", () => {
	assert.equal(getUtcDayBounds("2026-10-18")?.weekday, 0);
	assert.equal(getUtcDayBounds("2026-02-30"), undefined);
	assert.equal(getUtcDayBounds("18-10-2026"), undefined);
});

test("uses the schedule duration instead of a hard-coded default", () => {
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[schedule({ slotDuration: 60, endTime: "11:00" })],
			[],
		),
		[
			{ startTime: "09:00", endTime: "10:00" },
			{ startTime: "10:00", endTime: "11:00" },
		],
	);
});

test("parses AM/PM schedule hours and returns normalized 24-hour slots", () => {
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[
				schedule({
					startTime: "09:00 PM",
					endTime: "10:00 PM",
					slotDuration: 30,
				}),
			],
			[],
		),
		[
			{ startTime: "21:00", endTime: "21:30" },
			{ startTime: "21:30", endTime: "22:00" },
		],
	);
});

test("generates slots through midnight for an overnight schedule", () => {
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[
				schedule({
					startTime: "09:00 PM",
					endTime: "12:00 AM",
					slotDuration: 30,
				}),
			],
			[],
		),
		[
			{ startTime: "21:00", endTime: "21:30" },
			{ startTime: "21:30", endTime: "22:00" },
			{ startTime: "22:00", endTime: "22:30" },
			{ startTime: "22:30", endTime: "23:00" },
			{ startTime: "23:00", endTime: "23:30" },
			{ startTime: "23:30", endTime: "00:00" },
		],
	);
});

test("parses noon, midnight, lowercase markers, and unpadded hours", () => {
	assert.equal(parseTimeMinutes("12:00"), 720);
	assert.equal(parseTimeMinutes("12:00 AM"), 0);
	assert.equal(parseTimeMinutes("12:00 PM"), 720);
	assert.equal(parseTimeMinutes("12:00 am"), 0);
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[
				schedule({
					startTime: "12:00 am",
					endTime: "1:00 AM",
					slotDuration: 60,
				}),
			],
			[],
		),
		[{ startTime: "00:00", endTime: "01:00" }],
	);
	assert.deepEqual(
		calculateAvailabilitySlots(
			date,
			[
				schedule({
					startTime: "12:00 PM",
					endTime: "1:00 PM",
					slotDuration: 60,
				}),
			],
			[],
		),
		[{ startTime: "12:00", endTime: "13:00" }],
	);
});

test("detects schedule overlaps while allowing adjacent ranges", () => {
	assert.equal(
		scheduleTimeRangesOverlap("09:00", "10:00", "09:45", "11:00"),
		true,
	);
	assert.equal(
		scheduleTimeRangesOverlap("09:00", "10:00", "10:00", "11:00"),
		false,
	);
	assert.equal(
		scheduleTimeRangesOverlap(
			"09:00 PM",
			"10:00 PM",
			"09:30 PM",
			"11:00 PM",
		),
		true,
	);
	assert.equal(
		scheduleTimeRangesOverlap(
			"09:00 PM",
			"12:00 AM",
			"09:00 PM",
			"10:00 PM",
		),
		true,
	);
});

test("accepts the final overnight slot ending at midnight", () => {
	assert.equal(
		isAppointmentSlotAvailable(
			date,
			"11:30 PM",
			"12:00 AM",
			[
				schedule({
					startTime: "09:00 PM",
					endTime: "12:00 AM",
				}),
			],
			[],
		),
		true,
	);
});
