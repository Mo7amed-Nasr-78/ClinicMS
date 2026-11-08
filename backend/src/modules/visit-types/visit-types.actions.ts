import { db } from "../../../prisma/db.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateVisitTypeDto } from "./DTOs/createVisitType.dto.ts";
import type { UpdateVisitTypeDto } from "./DTOs/updateVisitType.dto.ts";

const visitTypeFields = [
	"id",
	"name",
	"defaultDurationMin",
	"price",
	"color",
	"isFollowUp",
	"isActive",
	"createdAt",
	"updatedAt",
] as const;

type VisitTypeId = string;

export function listVisitTypes(clinicId: ClinicId) {
	return db.visitType.findMany({
		where: { clinicId },
		select: {
			id: true,
			clinicId: true,
			name: true,
			defaultDurationMin: true,
			price: true,
			color: true,
			isFollowUp: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { name: "asc" },
	});
}

export function findVisitTypeById(clinicId: ClinicId, visitTypeId: string) {
	return db.visitType.findFirst({
		where: { id: visitTypeId as VisitTypeId, clinicId },
		select: {
			id: true,
			clinicId: true,
			name: true,
			defaultDurationMin: true,
			price: true,
			color: true,
			isFollowUp: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export function createVisitType(clinicId: ClinicId, input: CreateVisitTypeDto) {
	return db.visitType.create({
		data: {
			clinicId,
			name: input.name.trim(),
			defaultDurationMin: input.defaultDurationMin,
			price:
				input.price == null ? input.price : String(input.price),
			color: input.color,
			isFollowUp: input.isFollowUp ?? false,
			isActive: input.isActive ?? true,
		},
		select: {
			id: true,
			clinicId: true,
			name: true,
			defaultDurationMin: true,
			price: true,
			color: true,
			isFollowUp: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export function updateVisitType(
	clinicId: ClinicId,
	visitTypeId: string,
	input: UpdateVisitTypeDto,
) {
	const updateData = {
		...(input.name !== undefined && { name: input.name.trim() }),
		...(input.defaultDurationMin !== undefined && {
			defaultDurationMin: input.defaultDurationMin,
		}),
		...(input.price !== undefined && {
			price:
				input.price == null ? input.price : String(input.price),
		}),
		...(input.color !== undefined && { color: input.color }),
		...(input.isFollowUp !== undefined && {
			isFollowUp: input.isFollowUp,
		}),
		...(input.isActive !== undefined && { isActive: input.isActive }),
	};

	return db.visitType.update({
		where: { id: visitTypeId as VisitTypeId, clinicId },
		data: updateData,
		select: {
			id: true,
			clinicId: true,
			name: true,
			defaultDurationMin: true,
			price: true,
			color: true,
			isFollowUp: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export function deactivateVisitType(clinicId: ClinicId, visitTypeId: string) {
	return db.visitType.update({
		where: { id: visitTypeId as VisitTypeId, clinicId },
		data: { isActive: false },
		select: {
			id: true,
			clinicId: true,
			name: true,
			defaultDurationMin: true,
			price: true,
			color: true,
			isFollowUp: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}
