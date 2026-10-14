import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
	@IsNotEmpty()
	@IsString()
	@IsJWT()
	refreshToken!: string;
}
