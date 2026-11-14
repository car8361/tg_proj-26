import * as querystring from "node:querystring";
import {IsEnum, IsString, Length} from "class-validator";
import { allowedExtensions, allowedExtensionsContentType } from "../../object/dto/object.dto.js";
import type { AllowedExtensionsInterface } from "../../object/dto/object.dto.js";

export class PatchMeDto {
	@IsString()
	@Length(0, 512)
	description: string;
}

export class PostPictureDto {
	@IsEnum(allowedExtensions)
	fileType: AllowedExtensionsInterface;
}