import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../../authorization/authorization.module.ts";
import { BillsController } from "./bills.controller";
import { BillsService } from "./bills.service";

@Module({
	imports: [AuthModule, AuthorizationModule],
	controllers: [BillsController],
	providers: [BillsService],
})
export class BillsModule {}
