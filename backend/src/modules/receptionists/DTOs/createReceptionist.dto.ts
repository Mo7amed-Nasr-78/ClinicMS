import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateReceptionistDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	password!: string;

	@IsOptional()
	@IsString()
	phone?: string;
}
