import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

export { db };

type UserId = FieldOutputTypes["public"]["User"]["id"];

export async function listUsers(limit = 10) {
	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"phone",
		"role",
		"avatar",
		"status",
		"lastLoginAt",
		"createdAt",
		"updatedAt",
	)
		.limit(limit)
		.all();
}

export async function findUserById(userId: string) {
	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"phone",
		"role",
		"avatar",
		"status",
		"lastLoginAt",
		"createdAt",
		"updatedAt",
	).first({ id: userId });
}

export async function listUsersForClinic(clinicId: ClinicId) {
	const [clinic, doctors] = await Promise.all([
		db.orm.public.Clinic.select("ownerId").first({ id: clinicId }),
		db.orm.public.Doctor.select("userId").where({ clinicId }).all(),
	]);
	if (!clinic) return [];

	const userIds = [clinic.ownerId, ...doctors.map((doctor) => doctor.userId)];
	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"phone",
		"role",
		"avatar",
		"status",
		"lastLoginAt",
		"createdAt",
		"updatedAt",
	)
		.where({ id: { in: userIds } })
		.all();
}

export async function findUserForClinic(userId: string, clinicId: ClinicId) {
	const doctorProfile = await db.orm.public.Doctor.select("id").first({
		userId: userId as UserId,
		clinicId,
	});
	if (doctorProfile) return findUserById(userId);

	const clinicOwner = await db.orm.public.Clinic.select("id").first({
		id: clinicId,
		ownerId: userId as UserId,
	});
	return clinicOwner ? findUserById(userId) : null;
}

export async function findUserByEmail(email: string) {
	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"phone",
		"role",
		"avatar",
		"status",
		"lastLoginAt",
		"createdAt",
		"updatedAt",
	).first({ email });
}

export async function findUserForAuthentication(email: string) {
	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"role",
		"password",
	).first({ email });
}

// export type User = Awaited<ReturnType<typeof createUser>>;
// export type StarterUser = Awaited<ReturnType<typeof findUser>>;
// export type Users = Awaited<ReturnType<typeof listUsers>>[number];
