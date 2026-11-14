import * as querystring from "node:querystring";
import {IsEnum, IsString, Length} from "class-validator";
import { allowedExtensions, allowedExtensionsContentType } from "../../object/dto/object.dto.js";
import type { AllowedExtensionsInterface } from "../../object/dto/object.dto.js";

export class PatchMeDto {
	@IsString()
	@Length(0, 512)
	description: string;
	@IsString()
	@Length(0, 64)
	display_name: string;
}

export class PostPictureDto {
	@IsEnum(allowedExtensions)
	fileType: AllowedExtensionsInterface;
}