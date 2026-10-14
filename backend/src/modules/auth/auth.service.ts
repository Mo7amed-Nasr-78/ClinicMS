import {
	ConflictException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";

import { registerUser, findUserByEmail } from "./auth.actions";
import { findUserForAuthentication } from "../users/users.actions";
import type { RegisterUserDto } from "./DTOs/registerUser.dto";

const accessTokenSecret =
	process.env.JWT_ACCESS_SECRET ?? "development-access-secret-change-me";
const refreshTokenSecret =
	process.env.JWT_REFRESH_SECRET ?? "development-refresh-secret-change-me";

export interface SignInInput {
	email: string;
	password: string;
}

interface RefreshTokenPayload {
	sub: string;
	email: string;
	role: string;
	tokenType: "refresh";
}

@Injectable()
export class AuthService {
	constructor(
		@Inject(JwtService) private readonly jwtService: JwtService,
	) {}

	async register(input: RegisterUserDto) {
		const existingUser = await findUserByEmail(input.email);

		if (existingUser) {
			throw new ConflictException("Email already registered");
		}

		const user = await registerUser(input);
		return this.createTokens(user);
	}

	async signIn(input: SignInInput) {
		const user = await findUserForAuthentication(input.email);
		const passwordMatches = user
			? await bcrypt.compare(input.password, user.password)
			: false;

		if (!user || !passwordMatches) {
			throw new UnauthorizedException("Invalid email or password");
		}

		return this.createTokens(user);
	}

	private async createTokens(user: {
		id: string;
		email: string;
		role: string;
	}) {
		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
				{ ...payload, tokenType: "access" },
				{ secret: accessTokenSecret, expiresIn: "15m" },
			),
			this.jwtService.signAsync(
				{ ...payload, tokenType: "refresh" },
				{ secret: refreshTokenSecret, expiresIn: "7d" },
			),
		]);

		return { accessToken, refreshToken };
	}

	async refresh(refreshToken: string) {
		try {
			const payload =
				await this.jwtService.verifyAsync<RefreshTokenPayload>(
					refreshToken,
					{ secret: refreshTokenSecret },
				);

			if (payload.tokenType !== "refresh") {
				throw new UnauthorizedException(
					"Invalid refresh token",
				);
			}

			return {
				accessToken: await this.jwtService.signAsync(
					{
						sub: payload.sub,
						email: payload.email,
						role: payload.role,
						tokenType: "access",
					},
					{ secret: accessTokenSecret, expiresIn: "15m" },
				),
			};
		} catch {
			throw new UnauthorizedException(
				"Invalid or expired refresh token",
			);
		}
	}
}
