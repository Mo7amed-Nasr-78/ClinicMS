import bcrypt from "bcryptjs";

import type { ClinicId } from "../clinics/clinics.actions";
import { db } from "../../../prisma/db.ts";
import { Roles, Status } from "../../../prisma/enums.ts";
import { buildDoctorWhere } from "./doctor-filters.ts";
import type { DoctorFilters } from "./doctor-filters.ts";
import type { CreateDoctorDto } from "./DTOs/createDoctor.dto.ts";
import type { UpdateDoctorDto } from "./DTOs/updateDoctor.dto.ts";

type DoctorId = string;
type UserId = string;

export async function findUserByEmail(email: string) {
	return db.user.findUnique({ where: { email }, select: { id: true } });
}

export function findDoctorById(clinicId: ClinicId, doctorId: string) {
	return db.doctor.findFirst({
		where: { id: doctorId as DoctorId, clinicId },
		select: { id: true, userId: true },
	});
}

export function findDoctorAvailabilityProfile(
	clinicId: ClinicId,
	doctorId: string,
) {
	return db.doctor.findFirst({
		where: { id: doctorId as DoctorId, clinicId },
		select: { id: true, status: true },
	});
}

export function findAllDoctors(
	clinicId: ClinicId,
	filters: DoctorFilters = {},
) {
	return db.doctor.findMany({
		where: buildDoctorWhere(clinicId, filters),
		select: {
			id: true,
			specialty: true,
			licenseNumber: true,
			bio: true,
			consultationDuration: true,
			consultationFee: true,
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
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function createDoctor(input: CreateDoctorDto, clinicId: ClinicId) {
	const passwordHash = await bcrypt.hash(input.password, 12);
	return db.$transaction(async (transaction) => {
		const user = await transaction.user.create({
			data: {
				firstName: input.firstName ?? null,
				lastName: input.lastName ?? null,
				email: input.email,
				password: passwordHash,
				phone: input.phone ?? null,
				role: Roles.doctor,
			},
			select: { id: true },
		});

		return transaction.doctor.create({
			data: {
				specialty: input.specialty,
				licenseNumber: input.licenseNumber,
				bio: "",
				consultationDuration: input.consultationDuration,
				consultationFee: String(input.consultationFee),
				status: Status.active,
				userId: user.id,
				clinicId,
			},
			select: {
				id: true,
				specialty: true,
				licenseNumber: true,
				consultationDuration: true,
				consultationFee: true,
				status: true,
				userId: true,
				clinicId: true,
			},
		});
	});
}

export async function updateDoctor(
	clinicId: ClinicId,
	doctorId: string,
	userId: string,
	input: UpdateDoctorDto,
) {
	const userUpdate = {
		...(input.firstName !== undefined && {
			firstName: input.firstName,
		}),
		...(input.lastName !== undefined && { lastName: input.lastName }),
		...(input.phone !== undefined && { phone: input.phone }),
	};
	return db.$transaction(async (transaction) => {
		if (Object.keys(userUpdate).length > 0) {
			await transaction.user.update({
				where: { id: userId as UserId },
				data: userUpdate,
			});
		}

		return transaction.doctor.update({
			where: { id: doctorId as DoctorId, clinicId },
			data: {
				...(input.specialty !== undefined && {
					specialty: input.specialty,
				}),
				...(input.licenseNumber !== undefined && {
					licenseNumber: input.licenseNumber,
				}),
				...(input.consultationDuration !== undefined && {
					consultationDuration: input.consultationDuration,
				}),
				...(input.consultationFee !== undefined && {
					consultationFee: String(input.consultationFee),
				}),
			},
			select: {
				id: true,
				specialty: true,
				licenseNumber: true,
				consultationDuration: true,
				consultationFee: true,
				status: true,
				userId: true,
				clinicId: true,
			},
		});
	});
}

export async function deactivateDoctor(
	clinicId: ClinicId,
	doctorId: string,
	userId: string,
) {
	return db.$transaction(async (transaction) => {
		await transaction.user.update({
			where: { id: userId as UserId },
			data: { status: Status.inActive },
		});

		return transaction.doctor.update({
			where: { id: doctorId as DoctorId, clinicId },
			data: { status: Status.inActive },
			select: {
				id: true,
				specialty: true,
				licenseNumber: true,
				consultationDuration: true,
				consultationFee: true,
				status: true,
				userId: true,
				clinicId: true,
			},
		});
	});
}
