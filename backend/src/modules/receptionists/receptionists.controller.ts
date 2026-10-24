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

import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { AuthGuard } from "../../guards/authGuard.ts";
import type { AuthenticatedRequest } from "../../guards/authGuard.ts";
import { CreateReceptionistDto } from "./DTOs/createReceptionist.dto.ts";
import { UpdateReceptionistDto } from "./DTOs/updateReceptionist.dto.ts";
import { ReceptionistsService } from "./receptionists.service.ts";

@Controller("receptionists")
@UseGuards(AuthGuard, PermissionGuard)
export class ReceptionistsController {
	constructor(
		@Inject(ReceptionistsService)
		private readonly receptionistsService: ReceptionistsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_RECEPTIONISTS)
	findAll(@Req() request: AuthenticatedRequest) {
		return this.receptionistsService.findAll(request.user.sub);
	}

	@Get(":receptionistId")
	@RequirePermissions(Permission.VIEW_RECEPTIONIST_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("receptionistId", ParseUUIDPipe) receptionistId: string,
	) {
		return this.receptionistsService.findOne(
			request.user.sub,
			receptionistId,
		);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_RECEPTIONISTS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateReceptionistDto,
	) {
		return this.receptionistsService.create(request.user.sub, input);
	}

	@Patch(":receptionistId")
	@RequirePermissions(Permission.UPDATE_RECEPTIONISTS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("receptionistId", ParseUUIDPipe) receptionistId: string,
		@Body() input: UpdateReceptionistDto,
	) {
		return this.receptionistsService.update(
			request.user.sub,
			receptionistId,
			input,
		);
	}

	@Delete(":receptionistId")
	@RequirePermissions(Permission.DELETE_RECEPTIONISTS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("receptionistId", ParseUUIDPipe) receptionistId: string,
	) {
		return this.receptionistsService.remove(
			request.user.sub,
			receptionistId,
		);
	}
}
