import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { VisitTypesController } from "./visit-types.controller";
import { VisitTypesService } from "./visit-types.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [VisitTypesController],
	providers: [VisitTypesService],
})
export class VisitTypesModule {}
