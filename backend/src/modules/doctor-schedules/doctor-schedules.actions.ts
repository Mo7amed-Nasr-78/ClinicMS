import { db } from "../../prisma/db.ts";
import { Temporal } from "temporal-polyfill";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto.ts";
import type { UpdateDoctorScheduleDto } from "./dto/update-doctor-schedule.dto.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

const doctorScheduleFields = [
	"id",
	"doctorId",
	"dayOfWeek",
	"startTime",
	"endTime",
	"isAvailable",
	"isActive",
	"slotDuration",
	"effectiveFrom",
	"effectiveTo",
	"createdAt",
	"updatedAt",
] as const;

export type DoctorScheduleId =
	FieldOutputTypes["public"]["DoctorSchedule"]["id"];
export type DoctorId = FieldOutputTypes["public"]["Doctor"]["id"];

type UserId = FieldOutputTypes["public"]["User"]["id"];
type OrmContext = Pick<typeof db, "orm">;

function toTemporalInstant(value: string) {
	return Temporal.Instant.from(
		/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value,
	);
}

export async function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	const doctor = await db.orm.public.Doctor.select("id").first({
		userId: userId as UserId,
		clinicId,
	});
	return doctor?.id;
}

export async function listDoctorSchedules(
	clinicId: ClinicId,
	doctorId?: DoctorId,
	client: OrmContext = db,
) {
	return client.orm.public.DoctorSchedule.select(...doctorScheduleFields)
		.where({ clinicId, ...(doctorId && { doctorId }) })
		.orderBy((schedule) => schedule.createdAt.desc())
		.all();
}

export async function findDoctorScheduleById(id: string) {
	return db.orm.public.DoctorSchedule.select(...doctorScheduleFields).first(
		{
			id: id as DoctorScheduleId,
		},
	);
}

export function createDoctorSchedule(
	input: CreateDoctorScheduleDto,
	clinicId: ClinicId,
) {
	return db.orm.public.DoctorSchedule.select(
		...doctorScheduleFields,
	).create({
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

	return db.orm.public.DoctorSchedule.where({
		id: id as DoctorScheduleId,
	})
		.select(...doctorScheduleFields)
		.update(updateData);
}

export function deleteDoctorSchedule(id: string) {
	return db.orm.public.DoctorSchedule.where({
		id: id as DoctorScheduleId,
	}).delete();
}
