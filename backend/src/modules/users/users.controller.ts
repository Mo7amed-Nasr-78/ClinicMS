import { Controller, Get, Inject, Param, Req, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
	constructor(
		@Inject(UsersService) private readonly usersService: UsersService,
	) {}

	@Get("me")
	getCurrentUser(@Req() request: AuthenticatedRequest) {
		return this.usersService.getCurrentUser(request.user.sub);
	}

	@Get(":id")
	@RequirePermissions(Permission.VIEW_RECEPTIONIST_DETAILS)
	findUser(
		@Req() request: AuthenticatedRequest,
		@Param("id") userId: string,
	) {
		return this.usersService.findUser(request.user.sub, userId);
	}

	@Get()
	@RequirePermissions(Permission.VIEW_RECEPTIONISTS)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.usersService.findAll(request.user.sub);
	}
}
