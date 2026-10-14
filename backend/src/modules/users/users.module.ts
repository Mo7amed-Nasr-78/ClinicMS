import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
