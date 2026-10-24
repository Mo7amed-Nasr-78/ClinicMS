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
import { CreatePrescriptionDto } from "./DTOs/createPrescription.dto";
import { UpdatePrescriptionDto } from "./DTOs/updatePrescription.dto";
import { PrescriptionsService } from "./prescriptions.service";

@Controller("prescriptions")
@UseGuards(AuthGuard, PermissionGuard)
export class PrescriptionsController {
	constructor(
		@Inject(PrescriptionsService)
		private readonly prescriptionsService: PrescriptionsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_PRESCRIPTIONS)
	findAll(
		@Req() request: AuthenticatedRequest,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
		@Query("patientId") patientId?: string,
	) {
		return this.prescriptionsService.findAll(
			request.user.sub,
			request.user.role,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
			patientId,
		);
	}

	@Get(":prescriptionId")
	@RequirePermissions(Permission.VIEW_PRESCRIPTION_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("prescriptionId", ParseUUIDPipe) prescriptionId: string,
	) {
		return this.prescriptionsService.findOne(
			request.user.sub,
			request.user.role,
			prescriptionId,
		);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_PRESCRIPTIONS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreatePrescriptionDto,
	) {
		return this.prescriptionsService.create(
			request.user.sub,
			request.user.role,
			input,
		);
	}

	@Patch(":prescriptionId")
	@RequirePermissions(Permission.UPDATE_PRESCRIPTIONS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("prescriptionId", ParseUUIDPipe) prescriptionId: string,
		@Body() input: UpdatePrescriptionDto,
	) {
		return this.prescriptionsService.update(
			request.user.sub,
			request.user.role,
			prescriptionId,
			input,
		);
	}

	@Delete(":prescriptionId")
	@RequirePermissions(Permission.DELETE_PRESCRIPTIONS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("prescriptionId", ParseUUIDPipe) prescriptionId: string,
	) {
		return this.prescriptionsService.remove(
			request.user.sub,
			request.user.role,
			prescriptionId,
		);
	}
}
