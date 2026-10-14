import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [ReportsController],
	providers: [ReportsService],
})
export class ReportsModule {}
