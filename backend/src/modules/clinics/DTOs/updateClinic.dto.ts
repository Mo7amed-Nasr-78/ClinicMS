import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateClinicDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsString()
	address?: string;

	@IsOptional()
	@IsString()
	logo?: string;
}
