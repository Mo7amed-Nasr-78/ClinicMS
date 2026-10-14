import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { DoctorSchedulesController } from "./doctor-schedules.controller";
import { DoctorSchedulesService } from "./doctor-schedules.service";
import { DoctorsService } from "../doctors/doctors.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [DoctorSchedulesController],
	providers: [DoctorSchedulesService, DoctorsService],
})
export class DoctorSchedulesModule {}
