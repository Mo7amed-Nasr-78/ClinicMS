import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { PrescriptionsController } from "./prescriptions.controller";
import { PrescriptionsService } from "./prescriptions.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [PrescriptionsController],
	providers: [PrescriptionsService],
})
export class PrescriptionsModule {}
