import {IsEnum} from "class-validator";
import { z } from "zod";

export const allowedExtensions = ["png", "jpg", "jpeg"];

export const allowedExtensionsContentType: Record <string, string> = {
	"png": "image/png",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
};

export type AllowedExtensionsInterface = "png" | "jpg" | "jpeg";

export class UploadImg {
	@IsEnum(allowedExtensions)
	fileType: AllowedExtensionsInterface;
}