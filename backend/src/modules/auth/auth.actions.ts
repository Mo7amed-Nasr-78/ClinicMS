import bcrypt from "bcryptjs";

import { db } from "../../prisma/db.ts";
import { Roles } from "../../prisma/enums.ts";
import type { RegisterUserDto } from "./DTOs/registerUser.dto.ts";

export async function findUserByEmail(email: string) {
	return db.orm.public.User.select("id").first({ email });
}

export async function registerUser(input: RegisterUserDto) {
	const passwordHash = await bcrypt.hash(input.password, 12);

	return db.orm.public.User.select(
		"id",
		"firstName",
		"lastName",
		"email",
		"role",
	).create({
		firstName: input.firstName ?? null,
		lastName: input.lastName ?? null,
		email: input.email,
		password: passwordHash,
		role: Roles.ADMIN,
	});
}
