import { db } from "../../../prisma/db.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

export { db };

type UserId = string;

const userFields = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	phone: true,
	role: true,
	avatar: true,
	status: true,
	lastLoginAt: true,
	createdAt: true,
	updatedAt: true,
} as const;

export async function listUsers(limit = 10) {
	return db.user.findMany({ take: limit, select: userFields });
}

export async function findUserById(userId: string) {
	return db.user.findUnique({ where: { id: userId }, select: userFields });
}

export async function listUsersForClinic(clinicId: ClinicId) {
	const [clinic, doctors] = await Promise.all([
		db.clinic.findUnique({
			where: { id: clinicId },
			select: { ownerId: true },
		}),
		db.doctor.findMany({
			where: { clinicId },
			select: { userId: true },
		}),
	]);
	if (!clinic) return [];

	const userIds = [
		clinic.ownerId,
		...doctors.map((doctor) => doctor.userId),
	];
	return db.user.findMany({
		where: { id: { in: userIds } },
		select: userFields,
	});
}

export async function findUserForClinic(userId: string, clinicId: ClinicId) {
	const doctorProfile = await db.doctor.findFirst({
		where: { userId: userId as UserId, clinicId },
		select: { id: true },
	});
	if (doctorProfile) return findUserById(userId);

	const clinicOwner = await db.clinic.findFirst({
		where: { id: clinicId, ownerId: userId as UserId },
		select: { id: true },
	});
	return clinicOwner ? findUserById(userId) : null;
}

export async function findUserByEmail(email: string) {
	return db.user.findUnique({ where: { email }, select: userFields });
}

export async function findUserForAuthentication(email: string) {
	return db.user.findUnique({
		where: { email },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			password: true,
		},
	});
}

// export type User = Awaited<ReturnType<typeof createUser>>;
// export type StarterUser = Awaited<ReturnType<typeof findUser>>;
// export type Users = Awaited<ReturnType<typeof listUsers>>[number];
