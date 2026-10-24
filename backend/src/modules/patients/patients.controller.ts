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
import { CreatePatientDto } from "./DTOs/createPatient.dto";
import { UpdatePatientDto } from "./DTOs/updatePatient.dto";
import { PatientsService } from "./patients.service";

@Controller("patients")
@UseGuards(AuthGuard, PermissionGuard)
export class PatientsController {
	constructor(
		@Inject(PatientsService)
		private readonly patientsService: PatientsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_PATIENTS)
	findAll(
		@Req() request: AuthenticatedRequest,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
		@Query("status") status?: string,
	) {
		return this.patientsService.findAll(
			request.user.sub,
			request.user.role,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
			status,
		);
	}

	@Get(":patientId")
	@RequirePermissions(Permission.VIEW_PATIENT_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("patientId", ParseUUIDPipe) patientId: string,
	) {
		return this.patientsService.findOne(request.user.sub, patientId);
	}

	@Get(":patientId/medical-records")
	@RequirePermissions(Permission.VIEW_MEDICAL_RECORDS)
	findMedicalRecords(
		@Req() request: AuthenticatedRequest,
		@Param("patientId", ParseUUIDPipe) patientId: string,
	) {
		return this.patientsService.findMedicalRecords(
			request.user.sub,
			patientId,
		);
	}

	@Get(":patientId/prescriptions")
	@RequirePermissions(Permission.VIEW_PRESCRIPTIONS)
	findPrescriptions(
		@Req() request: AuthenticatedRequest,
		@Param("patientId", ParseUUIDPipe) patientId: string,
	) {
		return this.patientsService.findPrescriptions(
			request.user.sub,
			patientId,
		);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_PATIENTS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreatePatientDto,
	) {
		return this.patientsService.create(request.user.sub, input);
	}

	@Patch(":patientId")
	@RequirePermissions(Permission.UPDATE_PATIENTS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("patientId", ParseUUIDPipe) patientId: string,
		@Body() input: UpdatePatientDto,
	) {
		return this.patientsService.update(
			request.user.sub,
			patientId,
			input,
		);
	}

	@Delete(":patientId")
	@RequirePermissions(Permission.DELETE_PATIENTS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("patientId", ParseUUIDPipe) patientId: string,
	) {
		return this.patientsService.remove(request.user.sub, patientId);
	}
}
