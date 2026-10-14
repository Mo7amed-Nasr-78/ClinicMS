import {
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { CreateDoctorDto } from "./DTOs/createDoctor.dto";
import { DoctorAvailabilityQueryDto } from "./DTOs/doctorAvailabilityQuery.dto";
import { UpdateDoctorDto } from "./DTOs/updateDoctor.dto";
import { DoctorsService } from "./doctors.service";

@Controller("doctors")
@UseGuards(AuthGuard, PermissionGuard)
export class DoctorsController {
	constructor(
		@Inject(DoctorsService)
		private readonly doctorsService: DoctorsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_DOCTORS)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.doctorsService.findAll(request.user.sub);
	}

	@Get(":id/availability")
	@RequirePermissions(Permission.VIEW_DOCTOR_SCHEDULES)
	getAvailability(
		@Req() request: AuthenticatedRequest,
		@Param("id", ParseUUIDPipe) doctorId: string,
		@Query() query: DoctorAvailabilityQueryDto,
	) {
		return this.doctorsService.getAvailability(
			request.user.sub,
			request.user.role,
			doctorId,
			query.date,
		);
	}

	@Get(":id/schedules")
	@RequirePermissions(Permission.VIEW_DOCTOR_SCHEDULES)
	getSchedules(
		@Req() request: AuthenticatedRequest,
		@Param("id", ParseUUIDPipe) doctorId: string,
	) {
		return this.doctorsService.getSchedules(request.user.sub, doctorId);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_DOCTORS)
	createDoctor(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateDoctorDto,
	) {
		return this.doctorsService.createDoctor(request.user.sub, input);
	}

	@Patch(":id")
	@RequirePermissions(Permission.UPDATE_DOCTORS)
	updateDoctor(
		@Req() request: AuthenticatedRequest,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() input: UpdateDoctorDto,
	) {
		return this.doctorsService.updateDoctor(
			request.user.sub,
			id,
			input,
		);
	}

	@Delete(":id")
	@RequirePermissions(Permission.DELETE_DOCTORS)
	removeDoctor(
		@Req() request: AuthenticatedRequest,
		@Param("id", ParseUUIDPipe) id: string,
	) {
		return this.doctorsService.deactivateDoctor(request.user.sub, id);
	}
}
