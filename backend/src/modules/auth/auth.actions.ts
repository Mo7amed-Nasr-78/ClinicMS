import bcrypt from "bcryptjs";

import { db } from "../../../prisma/db.ts";
import { Roles } from "../../../prisma/enums.ts";
import type { RegisterUserDto } from "./DTOs/registerUser.dto.ts";

export async function findUserByEmail(email: string) {
	return db.user.findUnique({ where: { email }, select: { id: true } });
}

export async function registerUser(input: RegisterUserDto) {
	const passwordHash = await bcrypt.hash(input.password, 12);

	return db.user.create({
		data: {
			firstName: input.firstName ?? null,
			lastName: input.lastName ?? null,
			email: input.email,
			password: passwordHash,
			role: Roles.admin,
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
		},
	});
}
