import { PasswordDto, IdentifierDto } from "./auth.dto.js";
import { IntersectionType } from "@nestjs/mapped-types";

/**
 * Přijímá:
 * - identifier (= username nebo e-mail)
 * - password
 */

export class LoginDto extends IntersectionType(IdentifierDto, PasswordDto) {}