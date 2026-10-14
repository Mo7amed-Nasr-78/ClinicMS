import {
	ForbiddenException,
	Inject,
	Injectable,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "../../guards/authGuard.ts";
import { AuthorizationService } from "../authorization.service.ts";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator.ts";
import type { Permission } from "../enums/permission.enum.ts";

@Injectable()
export class PermissionGuard implements CanActivate {
	constructor(
		@Inject(Reflector) private readonly reflector: Reflector,
		@Inject(AuthorizationService)
		private readonly authorizationService: AuthorizationService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.getAllAndOverride<
			Permission[]
		>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

		if (!requiredPermissions?.length) {
			return true;
		}

		const request = context
			.switchToHttp()
			.getRequest<AuthenticatedRequest>();
		if (!request.user) {
			return false;
		}
		const userPermissions = new Set(
			this.authorizationService.getPermissionsForRole(
				request.user.role,
			),
		);
		const hasAllPermissions = requiredPermissions.every((permission) =>
			userPermissions.has(permission),
		);

		if (!hasAllPermissions) {
			throw new ForbiddenException(
				"You do not have permission to perform this action",
			);
		}

		return true;
	}
}