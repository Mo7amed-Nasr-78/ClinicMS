import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service.ts";
import { PermissionGuard } from "./guards/permission.guard.ts";

@Module({
	providers: [AuthorizationService, PermissionGuard],
	exports: [AuthorizationService, PermissionGuard],
})
export class AuthorizationModule {}