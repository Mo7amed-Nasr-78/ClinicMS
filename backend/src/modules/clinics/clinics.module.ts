import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { ClinicsController } from "./clinics.controller";
import { ClinicsService } from "./clinics.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [ClinicsController],
	providers: [ClinicsService],
})
export class ClinicsModule {}
