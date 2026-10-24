import bcrypt from "bcryptjs";

import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import { Roles, Status } from "../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateReceptionistDto } from "./DTOs/createReceptionist.dto.ts";
import type { UpdateReceptionistDto } from "./DTOs/updateReceptionist.dto.ts";

type ReceptionistId =
	FieldOutputTypes["public"]["Receptionist"]["id"];
type UserId = FieldOutputTypes["public"]["User"]["id"];

const receptionistFields = [
	"id",
	"status",
	"userId",
	"clinicId",
	"createdAt",
	"updatedAt",
] as const;

export function findAllReceptionists(clinicId: ClinicId) {
	return db.orm.public.Receptionist.select(...receptionistFields)
		.where({ clinicId })
		.include("user", (user) =>
			user.select(
				"id",
				"firstName",
				"lastName",
				"email",
				"phone",
				"avatar",
				"status",
				"createdAt",
				"updatedAt",
			),
		)
		.orderBy((receptionist) => receptionist.createdAt.desc())
		.all();
}

export function findReceptionistById(
	clinicId: ClinicId,
	receptionistId: string,
) {
	return db.orm.public.Receptionist.select(...receptionistFields)
		.include("user", (user) =>
			user.select(
				"id",
				"firstName",
				"lastName",
				"email",
				"phone",
				"avatar",
				"status",
				"createdAt",
				"updatedAt",
			),
		)
		.first({
			id: receptionistId as ReceptionistId,
			clinicId,
		});
}

export function findReceptionistUserByEmail(email: string) {
	return db.orm.public.User.select("id").first({ email });
}

export async function createReceptionist(
	input: CreateReceptionistDto,
	clinicId: ClinicId,
) {
	const password = await bcrypt.hash(input.password, 12);

	const receptionist = await db.transaction(async (transaction) => {
		const user = await transaction.orm.public.User.select("id").create({
			firstName: input.firstName ?? null,
			lastName: input.lastName ?? null,
			email: input.email,
			password,
			phone: input.phone ?? null,
			role: Roles.RECEPTIONIST,
			status: Status.ACTIVE,
		});

		return transaction.orm.public.Receptionist.select(
			...receptionistFields,
		)
			.create({
				userId: user.id,
				clinicId,
				status: Status.ACTIVE,
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
	await db.transaction(async (transaction) => {
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
			await transaction.orm.public.User.where({
				id: userId as UserId,
			}).update(userUpdate);
		}

		if (input.status !== undefined) {
			await transaction.orm.public.Receptionist.where({
				id: receptionistId as ReceptionistId,
				clinicId,
			}).update({ status: input.status });
		}
	});

	return findReceptionistById(clinicId, receptionistId);
}

export async function deactivateReceptionist(
	clinicId: ClinicId,
	receptionistId: string,
	userId: string,
) {
	await db.transaction(async (transaction) => {
		await transaction.orm.public.User.where({
			id: userId as UserId,
		}).update({ status: Status.INACTIVE });

		await transaction.orm.public.Receptionist.where({
			id: receptionistId as ReceptionistId,
			clinicId,
		}).update({ status: Status.INACTIVE });
	});

	return findReceptionistById(clinicId, receptionistId);
}
