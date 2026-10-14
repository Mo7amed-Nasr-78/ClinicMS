import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthGuard } from "../../guards/authGuard.ts";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, AuthGuard],
	exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
