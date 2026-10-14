import { IntersectionType } from "@nestjs/mapped-types";
import { CodeDto } from "./auth.dto.js";

/**
 * Přijímá:
 * - code
 */

export class $2faDto extends IntersectionType(CodeDto) {}