import { Injectable } from '@nestjs/common';
import {S3Client} from "@aws-sdk/client-s3";
import multer from "multer";

@Injectable()
export class ObjectService {
	private r2Client: S3Client;
	private readonly storage: multer.StorageEngine;
	private upload: multer.Multer;
	constructor() {
		const api = process.env.S3_API;
		const token = process.env.S3_API_TOKEN;
		const accessKeyId = process.env.S3_ACCESS_KEY_ID;
		const accessKey = process.env.S3_SECRET_ACCESS_KEY;
		if (!api || !token || !accessKeyId || !accessKey) {
			throw new Error("S3 .env variables missing")
		}
		this.r2Client = new S3Client({
			region: "auto",
			endpoint: process.env.S3_API,
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: accessKey,
			}
		})
		this.storage = multer.memoryStorage();
		this.upload = multer({ storage: this.storage,
			limits: {
				fileSize: 5 * 1024 * 1024,
				files: 3,
			}
		});
	}
	async uploadImage() {

	}
}
