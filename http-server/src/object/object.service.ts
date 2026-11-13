import { Injectable } from '@nestjs/common';
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import {AllowedExtensionsInterface, allowedExtensionsContentType, allowedExtensions} from "./dto/object.dto.js";

@Injectable()
export class ObjectService {
	private S3Client: S3Client;
	constructor() {
		if (!process.env.S3_API) {
			throw new Error("Missing S3 API in .env");
		}
		const api = process.env.S3_API;
		const token = process.env.S3_API_TOKEN;
		const accessKeyId = process.env.S3_ACCESS_KEY_ID;
		const accessKey = process.env.S3_SECRET_ACCESS_KEY;
		if (!api || !token || !accessKeyId || !accessKey) {
			throw new Error("S3 .env variables missing")
		}
		this.S3Client = new S3Client({
			region: "auto",
			endpoint: process.env.S3_API,
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: accessKey,
			}
		})
	}
	async uploadImage(fileType: AllowedExtensionsInterface) {
		const ruid = randomUUID();
		const url = await getSignedUrl(this.S3Client, new PutObjectCommand({
			Bucket: `social-media`,
			Key: `${ruid}.${fileType}`,
			ContentType: `${allowedExtensionsContentType[fileType]}`,
		}))
		return { url: url, path: `https://bucket.dnck.dev/pfp/${ruid}` };
	}
}
