import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.ts";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { ReceptionistsController } from "./receptionists.controller.ts";
import { ReceptionistsService } from "./receptionists.service.ts";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [ReceptionistsController],
	providers: [ReceptionistsService],
})
export class ReceptionistsModule {}
