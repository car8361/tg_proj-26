import { IsEmail, IsNotEmpty, IsString, Length, Matches} from "class-validator";

export class UsernameDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 64, {message: "Jméno může mít 3 - 64 znaků"})
    @Matches(/^[a-zA-Z0-9_]+$/, {message: "Jméno obsahuje nepovolené znaky"})
    username: string;
}

export class IdentifierDto {
    @IsString({message: "DTO"})
    @IsNotEmpty({message: "DTO"})
    @Length(3, 64, {message: "Identifikátor může mít 3 - 64 znaků"})
    identifier: string;
}

export class PasswordDto {
    @IsString({message: "DTO"})
    @IsNotEmpty({message: "DTO"})
    @Length(3, 64, {message: "Heslo může mít 3 - 64 znaků"})
    password: string;
}

export class ConfirmPasswordDto {
    @IsString({message: "DTO"})
    @IsNotEmpty({message: "DTO"})
    @Length(3, 64, {message: "Heslo může mít 3 - 64 znaků"})
    confirmPassword: string;
}


export class EmailDto {
    @IsString({message: "DTO"})
    @IsEmail()
    @IsNotEmpty({message: "DTO"})
    @Length(3, 128, {message: "E-mail může mít 3 - 64 znaků"})
    email: string;
}

export class CodeDto {
    @IsString({message: "DTO"})
    @Length(6, 6, {message: "Kód musí mít 6 znaků"})
    code: string;
}