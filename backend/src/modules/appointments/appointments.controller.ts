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
import { CreateAppointmentDto } from "./DTOs/createAppointment.dto";
import { UpdateAppointmentDto } from "./DTOs/updateAppointment.dto";
import { AppointmentsService } from "./appointments.service";

@Controller("appointments")
@UseGuards(AuthGuard, PermissionGuard)
export class AppointmentsController {
	constructor(
		@Inject(AppointmentsService)
		private readonly appointmentsService: AppointmentsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_APPOINTMENTS)
	findAll(
		@Req() request: AuthenticatedRequest,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
		@Query("appointmentDate") appointmentDate?: string,
		@Query("status") status?: string,
	) {
		return this.appointmentsService.findAll(
			request.user.sub,
			request.user.role,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
			appointmentDate,
			status,
		);
	}

	@Get(":appointmentId")
	@RequirePermissions(Permission.VIEW_APPOINTMENT_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("appointmentId", ParseUUIDPipe) appointmentId: string,
	) {
		return this.appointmentsService.findOne(
			request.user.sub,
			appointmentId,
		);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_APPOINTMENTS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateAppointmentDto,
	) {
		return this.appointmentsService.create(request.user.sub, input);
	}

	@Patch(":appointmentId")
	@RequirePermissions(Permission.UPDATE_APPOINTMENTS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("appointmentId", ParseUUIDPipe) appointmentId: string,
		@Body() input: UpdateAppointmentDto,
	) {
		return this.appointmentsService.update(
			request.user.sub,
			appointmentId,
			input,
		);
	}

	@Delete(":appointmentId")
	@RequirePermissions(Permission.DELETE_APPOINTMENTS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("appointmentId", ParseUUIDPipe) appointmentId: string,
	) {
		return this.appointmentsService.remove(
			request.user.sub,
			appointmentId,
		);
	}
}
