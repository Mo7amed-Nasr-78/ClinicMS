import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [PatientsController],
	providers: [PatientsService],
})
export class PatientsModule {}
