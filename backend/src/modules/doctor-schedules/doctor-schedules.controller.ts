import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Req,
	UseGuards,
	Inject,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { DoctorSchedulesService } from "./doctor-schedules.service";
import { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto";
import { UpdateDoctorScheduleDto } from "./dto/update-doctor-schedule.dto";

@Controller("doctor-schedules")
@UseGuards(AuthGuard, PermissionGuard)
export class DoctorSchedulesController {
	constructor(
		@Inject(DoctorSchedulesService)
		private readonly doctorSchedulesService: DoctorSchedulesService,
	) {}

	@Post()
	@RequirePermissions(Permission.CREATE_DOCTOR_SCHEDULES)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() createDoctorScheduleDto: CreateDoctorScheduleDto,
	) {
		return this.doctorSchedulesService.create(
			request.user.sub,
			createDoctorScheduleDto,
		);
	}

	@Get()
	@RequirePermissions(Permission.VIEW_DOCTOR_SCHEDULES)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.doctorSchedulesService.findAll(
			request.user.sub,
			request.user.role,
		);
	}

	@Get(":id")
	@RequirePermissions(Permission.VIEW_DOCTOR_SCHEDULE_DETAILS)
	findOne(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
		return this.doctorSchedulesService.findOne(request.user.sub, id);
	}

	@Patch(":id")
	@RequirePermissions(Permission.UPDATE_DOCTOR_SCHEDULES)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("id") id: string,
		@Body() updateDoctorScheduleDto: UpdateDoctorScheduleDto,
	) {
		return this.doctorSchedulesService.update(
			request.user.sub,
			id,
			updateDoctorScheduleDto,
		);
	}

	@Delete(":id")
	@RequirePermissions(Permission.DELETE_DOCTOR_SCHEDULES)
	remove(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
		return this.doctorSchedulesService.remove(request.user.sub, id);
	}
}
