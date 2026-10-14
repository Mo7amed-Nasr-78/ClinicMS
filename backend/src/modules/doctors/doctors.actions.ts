import bcrypt from "bcryptjs";

import type { ClinicId } from "../clinics/clinics.actions";
import { db } from "../../prisma/db.ts";
import { Roles, Status } from "../../prisma/enums.ts";
import type { CreateDoctorDto } from "./DTOs/createDoctor.dto.ts";
import type { UpdateDoctorDto } from "./DTOs/updateDoctor.dto.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";

type DoctorId = FieldOutputTypes["public"]["Doctor"]["id"];
type UserId = FieldOutputTypes["public"]["User"]["id"];

export async function findUserByEmail(email: string) {
	return db.orm.public.User.select("id").first({ email });
}

export function findDoctorById(clinicId: ClinicId, doctorId: string) {
	return db.orm.public.Doctor.select("id", "userId").first({
		id: doctorId as DoctorId,
		clinicId,
	});
}

export function findDoctorAvailabilityProfile(
	clinicId: ClinicId,
	doctorId: string,
) {
	return db.orm.public.Doctor.select("id", "status").first({
		id: doctorId as DoctorId,
		clinicId,
	});
}

export function findAllDoctors(clinicId: ClinicId) {
	return db.orm.public.Doctor.select(
		"id",
		"specialty",
		"licenseNumber",
		"bio",
		"consultationDuration",
		"consultationFee",
		"status",
		"userId",
		"clinicId",
		"createdAt",
		"updatedAt",
	)
		.where({ clinicId })
		.include("user", (user) =>
			user.select(
				"id",
				"firstName",
				"lastName",
				"email",
				"phone",
				"avatar",
			),
		)
		.orderBy((doctor) => doctor.createdAt.desc())
		.all();
}

export async function createDoctor(input: CreateDoctorDto, clinicId: ClinicId) {
	const passwordHash = await bcrypt.hash(input.password, 12);
	const user = await db.orm.public.User.select("id", "email").create({
		firstName: input.firstName ?? null,
		lastName: input.lastName ?? null,
		email: input.email,
		password: passwordHash,
		phone: input.phone ?? null,
		role: Roles.DOCTOR,
	});

	return db.orm.public.Doctor.select(
		"id",
		"specialty",
		"licenseNumber",
		"consultationDuration",
		"consultationFee",
		"status",
		"userId",
		"clinicId",
	).create({
		specialty: input.specialty,
		licenseNumber: input.licenseNumber,
		bio: "",
		consultationDuration: String(input.consultationDuration),
		consultationFee: String(input.consultationFee),
		status: Status.ACTIVE,
		userId: user.id,
		clinicId,
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
	if (Object.keys(userUpdate).length > 0) {
		await db.orm.public.User.where({ id: userId as UserId }).update(
			userUpdate,
		);
	}

	return db.orm.public.Doctor.where({
		id: doctorId as DoctorId,
		clinicId,
	})
		.select(
			"id",
			"specialty",
			"licenseNumber",
			"consultationDuration",
			"consultationFee",
			"status",
			"userId",
			"clinicId",
		)
		.update({
			...(input.specialty !== undefined && {
				specialty: input.specialty,
			}),
			...(input.licenseNumber !== undefined && {
				licenseNumber: input.licenseNumber,
			}),
			...(input.consultationDuration !== undefined && {
				consultationDuration: String(
					input.consultationDuration,
				),
			}),
			...(input.consultationFee !== undefined && {
				consultationFee: String(input.consultationFee),
			}),
		});
}

export async function deactivateDoctor(
	clinicId: ClinicId,
	doctorId: string,
	userId: string,
) {
	await db.orm.public.User.where({ id: userId as UserId }).update({
		status: Status.INACTIVE,
	});

	return db.orm.public.Doctor.where({
		id: doctorId as DoctorId,
		clinicId,
	})
		.select(
			"id",
			"specialty",
			"licenseNumber",
			"consultationDuration",
			"consultationFee",
			"status",
			"userId",
			"clinicId",
		)
		.update({ status: Status.INACTIVE });
}
