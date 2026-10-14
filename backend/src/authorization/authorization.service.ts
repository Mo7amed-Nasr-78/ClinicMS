import { Injectable } from "@nestjs/common";
import { ROLE_PERMISSIONS } from "./constants/role-permissions.constant.ts";
import { Role } from "./enums/role.enum.ts";
import type { Permission } from "./enums/permission.enum.ts";

@Injectable()
export class AuthorizationService {
	getPermissionsForRole(role: string): readonly Permission[] {
		if (!Object.values(Role).includes(role as Role)) {
			return [];
		}

		return ROLE_PERMISSIONS[role as Role];
	}
}