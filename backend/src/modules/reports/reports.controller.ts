import { Controller, Get, Inject, Query, Req, UseGuards } from "@nestjs/common";

import { Permission } from "../../authorization/enums/permission.enum.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { ReportsService } from "./reports.service";

@Controller("reports")
@UseGuards(AuthGuard, PermissionGuard)
export class ReportsController {
	constructor(
		@Inject(ReportsService)
		private readonly reportsService: ReportsService,
	) {}

	@Get("doctors")
	@RequirePermissions(Permission.VIEW_DOCTORS)
	findDoctors(
		@Req() request: AuthenticatedRequest,
		@Query("status") status?: string,
		@Query("specialty") specialty?: string,
		@Query("q") query?: string,
	) {
		return this.reportsService.findDoctors(request.user.sub, {
			status,
			specialty,
			query,
		});
	}

	@Get("patients")
	@RequirePermissions(Permission.VIEW_PATIENTS)
	findPatients(
		@Req() request: AuthenticatedRequest,
		@Query("status") status?: string,
		@Query("gender") gender?: string,
		@Query("q") query?: string,
	) {
		return this.reportsService.findPatients(request.user.sub, {
			status,
			gender,
			query,
		});
	}
}
