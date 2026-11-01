import { db, type PrismaTransaction } from "../../prisma/db.ts";
import { Temporal } from "temporal-polyfill";
import type { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto.ts";
import type { UpdateDoctorScheduleDto } from "./dto/update-doctor-schedule.dto.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

const doctorScheduleSelect = {
	id: true,
	doctorId: true,
	clinicId: true,
	dayOfWeek: true,
	startTime: true,
	endTime: true,
	isAvailable: true,
	isActive: true,
	slotDuration: true,
	effectiveFrom: true,
	effectiveTo: true,
	createdAt: true,
	updatedAt: true,
} as const;

export type DoctorScheduleId = string;
export type DoctorId = string;

type UserId = string;
type OrmContext = Pick<PrismaTransaction, "doctorSchedule">;

function toTemporalInstant(value: string) {
	return new Date(
		/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value,
	);
}

export async function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	const doctor = await db.doctor.findFirst({
		where: { userId: userId as UserId, clinicId },
		select: { id: true },
	});
	return doctor?.id;
}

export async function listDoctorSchedules(
	clinicId: ClinicId,
	doctorId?: DoctorId,
	client: OrmContext = db,
) {
	return client.doctorSchedule.findMany({
		where: { clinicId, ...(doctorId && { doctorId }) },
		select: doctorScheduleSelect,
		orderBy: { createdAt: "desc" },
	});
}

export async function findDoctorScheduleById(id: string) {
	return db.doctorSchedule.findUnique({
		where: { id: id as DoctorScheduleId },
		select: doctorScheduleSelect,
	});
}

export function createDoctorSchedule(
	input: CreateDoctorScheduleDto,
	clinicId: ClinicId,
) {
	return db.doctorSchedule.create({
		data: {
			doctorId: input.doctorId as DoctorId,
			clinicId,
			dayOfWeek: input.dayOfWeek,
			startTime: input.startTime,
			endTime: input.endTime,
			isAvailable: input.isAvailable,
			isActive: input.isActive,
			slotDuration: input.slotDuration,
			effectiveFrom: toTemporalInstant(input.effectiveFrom),
			effectiveTo: toTemporalInstant(input.effectiveTo),
		},
		select: doctorScheduleSelect,
	});
}

export function updateDoctorSchedule(
	id: string,
	input: UpdateDoctorScheduleDto,
) {
	const updateData = {
		...(input.dayOfWeek !== undefined && {
			dayOfWeek: input.dayOfWeek,
		}),
		...(input.startTime !== undefined && {
			startTime: input.startTime,
		}),
		...(input.endTime !== undefined && { endTime: input.endTime }),
		...(input.isAvailable !== undefined && {
			isAvailable: input.isAvailable,
		}),
		...(input.isActive !== undefined && { isActive: input.isActive }),
		...(input.slotDuration !== undefined && {
			slotDuration: input.slotDuration,
		}),
		...(input.effectiveFrom !== undefined && {
			effectiveFrom: toTemporalInstant(input.effectiveFrom),
		}),
		...(input.effectiveTo !== undefined && {
			effectiveTo: toTemporalInstant(input.effectiveTo),
		}),
	};

	return db.doctorSchedule.update({
		where: { id: id as DoctorScheduleId },
		data: updateData,
		select: doctorScheduleSelect,
	});
}

export function deleteDoctorSchedule(id: string) {
	return db.doctorSchedule.delete({
		where: { id: id as DoctorScheduleId },
	});
}
