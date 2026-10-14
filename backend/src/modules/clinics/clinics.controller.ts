import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Patch,
	Param,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { AuthGuard } from "../../guards/authGuard";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { CreateClinicDto } from "./DTOs/createClinic.dto";
import { UpdateClinicDto } from "./DTOs/updateClinic.dto";
import { ClinicsService } from "./clinics.service";

const allowedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

type UploadedClinicLogo = {
	buffer: Buffer;
	mimetype: string;
};

@Controller("clinics")
@UseGuards(AuthGuard, PermissionGuard)
export class ClinicsController {
	constructor(
		@Inject(ClinicsService)
		private readonly clinicsService: ClinicsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_CLINICS)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.clinicsService.findAll(request.user.sub);
	}

	@Get("me")
	findMine(@Req() request: AuthenticatedRequest) {
		return this.clinicsService.findMine(request.user.sub);
	}

	@Get(":clinicId/doctors")
	@RequirePermissions(Permission.VIEW_DOCTORS)
	findDoctors(
		@Req() request: AuthenticatedRequest,
		@Param("clinicId") clinicId: string,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
	) {
		return this.clinicsService.findDoctors(
			request.user.sub,
			clinicId,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
		);
	}

	@Get(":clinicId/patients")
	@RequirePermissions(Permission.VIEW_PATIENTS)
	findPatients(
		@Req() request: AuthenticatedRequest,
		@Param("clinicId") clinicId: string,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
	) {
		return this.clinicsService.findPatients(
			request.user.sub,
			clinicId,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
		);
	}

	@Post()
	@UseInterceptors(
		FileInterceptor("logo", {
			limits: { fileSize: 2 * 1024 * 1024 },
			fileFilter: (_request, file, callback) => {
				if (!allowedLogoTypes.has(file.mimetype)) {
					callback(
						new BadRequestException(
							"Use a PNG, JPG, or WebP logo.",
						),
						false,
					);
					return;
				}

				callback(null, true);
			},
		}),
	)
	@RequirePermissions(Permission.CREATE_CLINICS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateClinicDto,
		@UploadedFile() logo?: UploadedClinicLogo,
	) {
		return this.clinicsService.create(request.user.sub, {
			...input,
			logo: logo
				? `data:${logo.mimetype};base64,${logo.buffer.toString("base64")}`
				: input.logo,
		});
	}

	@Patch(":clinicId")
	@RequirePermissions(Permission.UPDATE_CLINICS)
	updateById(
		@Req() request: AuthenticatedRequest,
		@Param("clinicId") clinicId: string,
		@Body() input: UpdateClinicDto,
	) {
		return this.clinicsService.updateById(
			request.user.sub,
			clinicId,
			input,
		);
	}

	@Delete("me")
	@RequirePermissions(Permission.DELETE_CLINICS)
	remove(@Req() request: AuthenticatedRequest) {
		return this.clinicsService.remove(request.user.sub);
	}
}
