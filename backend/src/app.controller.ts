import { Controller, Get } from "@nestjs/common";
import { db } from "./prisma/db";

@Controller()
export class AppController {
	@Get()
	getRoot() {
		return {
			message: "hello from create-prisma + nest",
		};
	}

	@Get("health")
	async getHealth() {
		await db.$queryRaw`SELECT 1`;

		return {
			status: "ok",
			database: "connected",
			timestamp: new Date().toISOString(),
		};
	}
}
