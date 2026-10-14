import { Body, Controller, Inject, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./DTOs/registerUser.dto";
import { SignInDto } from "./DTOs/signIn.dto";

const refreshCookieName = "refreshToken";
const refreshCookieMaxAge = 7 * 24 * 60 * 60 * 1000;
const refreshCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/auth/refresh",
	maxAge: refreshCookieMaxAge,
};

@Controller("auth")
export class AuthController {
	constructor(
		@Inject(AuthService) private readonly authService: AuthService,
	) {}

	@Post("register")
	async register(
		@Body() input: RegisterUserDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const { accessToken, refreshToken } =
			await this.authService.register(input);

		response.cookie(
			refreshCookieName,
			refreshToken,
			refreshCookieOptions,
		);

		return { accessToken };
	}

	@Post("signin")
	async signIn(
		@Body() input: SignInDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const { accessToken, refreshToken } =
			await this.authService.signIn(input);

		response.cookie(
			refreshCookieName,
			refreshToken,
			refreshCookieOptions,
		);

		return { accessToken };
	}

	@Post("refresh")
	refresh(@Req() request: Request) {
		const refreshToken = request.cookies?.[refreshCookieName];

		return this.authService.refresh(refreshToken ?? "");
	}

	@Post("logout")
	logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie(refreshCookieName, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/auth/refresh",
		});

		return { message: "Logged out successfully" };
	}
}
