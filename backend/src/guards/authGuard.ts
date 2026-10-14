import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import "dotenv/config";

const accessTokenSecret =
	process.env.JWT_ACCESS_SECRET ?? "development-access-secret-change-me";

export interface AccessTokenPayload {
	sub: string;
	email: string;
	role: string;
	tokenType: "access";
}

export interface AuthenticatedRequest extends Request {
	user: AccessTokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		@Inject(JwtService) private readonly jwtService: JwtService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context
			.switchToHttp()
			.getRequest<AuthenticatedRequest>();
		const authorization = request.headers.authorization;
		const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

		if (!token) {
			throw new UnauthorizedException(
				"Bearer access token is required",
			);
		}

		try {
			const payload =
				await this.jwtService.verifyAsync<AccessTokenPayload>(
					token,
					{ secret: accessTokenSecret },
				);

			if (payload.tokenType !== "access" || !payload.sub) {
				throw new UnauthorizedException("Invalid access token");
			}

			request.user = payload;
			return true;
		} catch {
			throw new UnauthorizedException(
				"Invalid or expired access token",
			);
		}
	}
}
