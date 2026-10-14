import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { DoctorsController } from "./doctors.controller";
import { DoctorsService } from "./doctors.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [DoctorsController],
	providers: [DoctorsService],
})
export class DoctorsModule {}
