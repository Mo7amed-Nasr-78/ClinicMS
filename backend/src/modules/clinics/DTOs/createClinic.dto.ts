import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClinicDto {
	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	phone!: string;

	@IsNotEmpty()
	@IsString()
	address!: string;

	@IsOptional()
	@IsString()
	logo?: string;
}
