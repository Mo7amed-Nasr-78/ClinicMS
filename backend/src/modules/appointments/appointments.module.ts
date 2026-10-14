import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [AppointmentsController],
	providers: [AppointmentsService],
})
export class AppointmentsModule {}
