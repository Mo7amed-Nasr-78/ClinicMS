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
import { Permission } from "../../authorization/enums/permission.enum.ts";
import { RequirePermissions } from "../../authorization/decorators/require-permissions.decorator.ts";
import { PermissionGuard } from "../../authorization/guards/permission.guard.ts";
import { AuthGuard } from "../../guards/authGuard";
import type { AuthenticatedRequest } from "../../guards/authGuard";
import { CreateBillDto } from "./DTOs/createBill.dto";
import { UpdateBillDto } from "./DTOs/updateBill.dto";
import { BillsService } from "./bills.service";

@Controller("bills")
@UseGuards(AuthGuard, PermissionGuard)
export class BillsController {
	constructor(
		@Inject(BillsService)
		private readonly billsService: BillsService,
	) {}

	@Get()
	@RequirePermissions(Permission.VIEW_BILLS)
	findAll(
		@Req() request: AuthenticatedRequest,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
		@Query("status") status?: string,
		@Query("patientId") patientId?: string,
	) {
		return this.billsService.findAll(
			request.user.sub,
			page ? Number(page) : 1,
			limit ? Number(limit) : 20,
			status,
			patientId,
		);
	}

	@Get(":billId")
	@RequirePermissions(Permission.VIEW_BILL_DETAILS)
	findOne(
		@Req() request: AuthenticatedRequest,
		@Param("billId", ParseUUIDPipe) billId: string,
	) {
		return this.billsService.findOne(request.user.sub, billId);
	}

	@Post()
	@RequirePermissions(Permission.CREATE_BILLS)
	create(
		@Req() request: AuthenticatedRequest,
		@Body() input: CreateBillDto,
	) {
		return this.billsService.create(request.user.sub, input);
	}

	@Patch(":billId")
	@RequirePermissions(Permission.UPDATE_BILLS)
	update(
		@Req() request: AuthenticatedRequest,
		@Param("billId", ParseUUIDPipe) billId: string,
		@Body() input: UpdateBillDto,
	) {
		return this.billsService.update(request.user.sub, billId, input);
	}

	@Delete(":billId")
	@RequirePermissions(Permission.DELETE_BILLS)
	remove(
		@Req() request: AuthenticatedRequest,
		@Param("billId", ParseUUIDPipe) billId: string,
	) {
		return this.billsService.remove(request.user.sub, billId);
	}
}
