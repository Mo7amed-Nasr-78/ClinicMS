import { Roles } from "../../../prisma/enums.ts";

export const Role = {
	CLINIC_OWNER: Roles.admin,
	DOCTOR: Roles.doctor,
	RECEPTIONIST: Roles.receptionist,
} as const;

export type Role = (typeof Role)[keyof typeof Role];