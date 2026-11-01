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
	Req,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { CreateVisitTypeDto } from "./DTOs/createVisitType.dto";
import { UpdateVisitTypeDto } from "./DTOs/updateVisitType.dto";
import { VisitTypesService } from "./visit-types.service";

@Controller("visit-types")
@UseGuards(AuthGuard, PermissionGuard)
export class VisitTypesController {
	constructor(
		@Inject(VisitTypesService)
		private readonly visitTypesService: VisitTypesService,
	) {}

	@Post()
	@RequirePermissions(Permission.CREATE_VISIT_TYPES)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateVisitTypeDto,
	) {
		return this.visitTypesService.create(request.user.sub, input);
	}

	@Get()
	@RequirePermissions(Permission.VIEW_VISIT_TYPES)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.visitTypesService.findAll(request.user.sub);
	}

	@Get(":visitTypeId")
	@RequirePermissions(Permission.VIEW_VISIT_TYPE_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("visitTypeId", ParseUUIDPipe) visitTypeId: string,
	) {
		return this.visitTypesService.findOne(
			request.user.sub,
			visitTypeId,
		);
	}

	@Patch(":visitTypeId")
	@RequirePermissions(Permission.UPDATE_VISIT_TYPES)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("visitTypeId", ParseUUIDPipe) visitTypeId: string,
		@Body() input: UpdateVisitTypeDto,
	) {
		return this.visitTypesService.update(
			request.user.sub,
			visitTypeId,
			input,
		);
	}

	@Delete(":visitTypeId")
	@RequirePermissions(Permission.DELETE_VISIT_TYPES)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("visitTypeId", ParseUUIDPipe) visitTypeId: string,
	) {
		return this.visitTypesService.remove(
			request.user.sub,
			visitTypeId,
		);
	}
}
