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
import { CreateMedicalRecordDto } from "./DTOs/createMedicalRecord.dto";
import { UpdateMedicalRecordDto } from "./DTOs/updateMedicalRecord.dto";
import { MedicalRecordsService } from "./medical-records.service";

@Controller("medical-records")
@UseGuards(AuthGuard, PermissionGuard)
export class MedicalRecordsController {
	constructor(
		@Inject(MedicalRecordsService)
		private readonly medicalRecordsService: MedicalRecordsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_MEDICAL_RECORDS)
	findAll(
		@Req() request: AuthenticatedRequest,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
		@Query("patientId") patientId?: string,
	) {
		return this.medicalRecordsService.findAll(
			request.user.sub,
			request.user.role,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
			patientId,
		);
	}

	@Get(":medicalRecordId")
	@RequirePermissions(Permission.VIEW_MEDICAL_RECORD_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("medicalRecordId", ParseUUIDPipe) medicalRecordId: string,
	) {
		return this.medicalRecordsService.findOne(
			request.user.sub,
			request.user.role,
			medicalRecordId,
		);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_MEDICAL_RECORDS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateMedicalRecordDto,
	) {
		return this.medicalRecordsService.create(
			request.user.sub,
			request.user.role,
			input,
		);
	}

	@Patch(":medicalRecordId")
	@RequirePermissions(Permission.UPDATE_MEDICAL_RECORDS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("medicalRecordId", ParseUUIDPipe) medicalRecordId: string,
		@Body() input: UpdateMedicalRecordDto,
	) {
		return this.medicalRecordsService.update(
			request.user.sub,
			request.user.role,
			medicalRecordId,
			input,
		);
	}

	@Delete(":medicalRecordId")
	@RequirePermissions(Permission.DELETE_MEDICAL_RECORDS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("medicalRecordId", ParseUUIDPipe) medicalRecordId: string,
	) {
		return this.medicalRecordsService.remove(
			request.user.sub,
			request.user.role,
			medicalRecordId,
		);
	}
}
