import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { MedicalRecordsController } from "./medical-records.controller";
import { MedicalRecordsService } from "./medical-records.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [MedicalRecordsController],
	providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
