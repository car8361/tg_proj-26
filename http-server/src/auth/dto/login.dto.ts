import { PasswordDto, IdentifierDto } from "./auth.dto.js";
import { IntersectionType } from "@nestjs/mapped-types";

export class LoginDto extends IntersectionType(IdentifierDto, PasswordDto) {}