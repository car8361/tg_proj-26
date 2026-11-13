import * as querystring from "node:querystring";
import {IsEnum, IsString, Length} from "class-validator";

export class PatchMeDto {
	@IsString()
	@Length(0, 512)
	description: string;
}

export const allowedExtensions = ["png", "jpg", "jpeg"];

export const allowedExtensionsContentType: Record <string, string> = {
	"png": "image/png",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
};

export type AllowedExtensionsInterface = "png" | "jpg" | "jpeg";

export class PostPictureDto {
	@IsEnum(allowedExtensions)
	fileType: AllowedExtensionsInterface;
}