import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class RegisterUserDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsEnum(["admin", "doctor", "receptionist", "patient"])
	role?: string;

	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	password!: string;
}
