import "dotenv/config";
import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/client.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL must be set before the application starts");
}

export const db = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

export type PrismaTransaction = Pick<
	typeof db,
	"$queryRaw" | "appointment" | "bill" | "doctorSchedule"
>;

@Injectable()
export class PrismaLifecycle implements OnModuleInit, OnModuleDestroy {
	async onModuleInit() {
		await db.$connect();
	}

	async onModuleDestroy() {
		await db.$disconnect();
	}
}
