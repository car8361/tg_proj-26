import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import { IntersectionType } from "@nestjs/mapped-types";
import { UsernameDto, PasswordDto, EmailDto } from "./auth.dto.js";

export class RegisterDto extends IntersectionType(UsernameDto, EmailDto, PasswordDto) {}