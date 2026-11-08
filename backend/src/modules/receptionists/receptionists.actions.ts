import bcrypt from "bcryptjs";

import { db } from "../../../prisma/db.ts";
import { Roles, Status } from "../../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateReceptionistDto } from "./DTOs/createReceptionist.dto.ts";
import type { UpdateReceptionistDto } from "./DTOs/updateReceptionist.dto.ts";

type ReceptionistId = string;
type UserId = string;

const receptionistFields = [
	"id",
	"status",
	"userId",
	"clinicId",
	"createdAt",
	"updatedAt",
] as const;

export function findAllReceptionists(clinicId: ClinicId) {
	return db.receptionist.findMany({
		where: { clinicId },
		select: {
			id: true,
			status: true,
			userId: true,
			clinicId: true,
			createdAt: true,
			updatedAt: true,
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
					avatar: true,
					status: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export function findReceptionistById(
	clinicId: ClinicId,
	receptionistId: string,
) {
	return db.receptionist.findFirst({
		where: { id: receptionistId as ReceptionistId, clinicId },
		select: {
			id: true,
			status: true,
			userId: true,
			clinicId: true,
			createdAt: true,
			updatedAt: true,
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
					avatar: true,
					status: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	});
}

export function findReceptionistUserByEmail(email: string) {
	return db.user.findUnique({ where: { email }, select: { id: true } });
}

export async function createReceptionist(
	input: CreateReceptionistDto,
	clinicId: ClinicId,
) {
	const password = await bcrypt.hash(input.password, 12);

	const receptionist = await db.$transaction(async (transaction) => {
		const user = await transaction.user.create({
			data: {
				firstName: input.firstName ?? null,
				lastName: input.lastName ?? null,
				email: input.email,
				password,
				phone: input.phone ?? null,
				role: Roles.receptionist,
				status: Status.active,
			},
			select: { id: true },
		});

		return transaction.receptionist.create({
			data: {
				userId: user.id,
				clinicId,
				status: Status.active,
			},
			select: { id: true },
		});
	});

	return findReceptionistById(clinicId, receptionist.id);
}

export async function updateReceptionist(
	clinicId: ClinicId,
	receptionistId: string,
	userId: string,
	input: UpdateReceptionistDto,
) {
	await db.$transaction(async (transaction) => {
		const userUpdate = {
			...(input.firstName !== undefined && {
				firstName: input.firstName,
			}),
			...(input.lastName !== undefined && {
				lastName: input.lastName,
			}),
			...(input.phone !== undefined && { phone: input.phone }),
			...(input.status !== undefined && { status: input.status }),
		};
		if (Object.keys(userUpdate).length > 0) {
			await transaction.user.update({
				where: { id: userId as UserId },
				data: userUpdate,
			});
		}

		if (input.status !== undefined) {
			await transaction.receptionist.update({
				where: {
					id: receptionistId as ReceptionistId,
					clinicId,
				},
				data: { status: input.status },
			});
		}
	});

	return findReceptionistById(clinicId, receptionistId);
}

export async function deactivateReceptionist(
	clinicId: ClinicId,
	receptionistId: string,
	userId: string,
) {
	await db.$transaction(async (transaction) => {
		await transaction.user.update({
			where: { id: userId as UserId },
			data: { status: Status.inActive },
		});

		await transaction.receptionist.update({
			where: { id: receptionistId as ReceptionistId, clinicId },
			data: { status: Status.inActive },
		});
	});

	return findReceptionistById(clinicId, receptionistId);
}
