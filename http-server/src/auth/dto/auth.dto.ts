import { IsEmail, IsNotEmpty, IsString, Length, Matches, minLength } from "class-validator";

export class UsernameDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 64)
    @Matches(/[^a-zA-Z0-9_]/,)
    username: string;
}

export class IdentifierDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 64)
    identifier: string;
}

export class PasswordDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 64)
    password: string;
}

export class EmailDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @Length(3, 128)
    email: string;
}

export class CodeDto {
    @IsString()
    @Length(6)
    code: string;
}