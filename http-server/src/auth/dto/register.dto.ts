import { IntersectionType } from "@nestjs/mapped-types";
import { UsernameDto, PasswordDto, EmailDto } from "./auth.dto.js";

/**
 * Přijímá:
 * - username
 * - email
 * - password
 */

export class RegisterDto extends IntersectionType(UsernameDto, EmailDto, PasswordDto) {}