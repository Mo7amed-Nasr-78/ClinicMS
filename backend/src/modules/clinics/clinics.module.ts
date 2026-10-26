import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { ClinicsController } from "./clinics.controller";
import { ClinicsService } from "./clinics.service";
import { ClinicLogoStorageService } from "./clinic-logo-storage.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [ClinicsController],
	providers: [ClinicsService, ClinicLogoStorageService],
})
export class ClinicsModule {}
