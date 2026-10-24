import { IsIn, IsOptional, IsString } from "class-validator";
import { Status } from "../../../prisma/enums.ts";

export class UpdateReceptionistDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsIn(Object.values(Status))
	status?: (typeof Status)[keyof typeof Status];
}
