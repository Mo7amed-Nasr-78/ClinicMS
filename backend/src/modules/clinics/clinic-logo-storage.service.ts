import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

type ClinicLogo = {
	buffer: Buffer;
	mimetype: string;
};

const logoExtensions: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
};

function requiredEnvironmentVariable(name: string) {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new InternalServerErrorException(
			`Clinic logo storage is not configured: ${name}`,
		);
	}

	return value;
}

@Injectable()
export class ClinicLogoStorageService {
	async upload(logo: ClinicLogo): Promise<string> {
		const config = {
			endpoint: requiredEnvironmentVariable("SUPABASE_S3_ENDPOINT"),
			region: requiredEnvironmentVariable("SUPABASE_S3_REGION"),
			accessKeyId: requiredEnvironmentVariable(
				"SUPABASE_S3_ACCESS_KEY_ID",
			),
			secretAccessKey: requiredEnvironmentVariable(
				"SUPABASE_S3_SECRET_ACCESS_KEY",
			),
			bucket: requiredEnvironmentVariable("SUPABASE_BUCKET"),
		};
		const extension = logoExtensions[logo.mimetype];
		if (!extension) {
			throw new InternalServerErrorException(
				"Unsupported clinic logo format",
			);
		}

		const key = `clinic-logos/${randomUUID()}.${extension}`;
		const client = new S3Client({
			endpoint: config.endpoint,
			region: config.region,
			forcePathStyle: true,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
		});

		try {
			await client.send(
				new PutObjectCommand({
					Bucket: config.bucket,
					Key: key,
					Body: logo.buffer,
					ContentType: logo.mimetype,
					CacheControl: "public, max-age=31536000, immutable",
				}),
			);
		} finally {
			client.destroy();
		}

		return this.getPublicObjectUrl(config.endpoint, config.bucket, key);
	}

	private getPublicObjectUrl(
		endpoint: string,
		bucket: string,
		key: string,
	) {
		const url = new URL(endpoint);
		url.pathname = `${url.pathname.replace(/\/storage\/v1\/s3\/?$/, "").replace(/\/+$/, "")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key
			.split("/")
			.map(encodeURIComponent)
			.join("/")}`;
		url.search = "";
		url.hash = "";

		if (url.hostname.endsWith(".storage.supabase.co")) {
			const projectRef = url.hostname.slice(
				0,
				-".storage.supabase.co".length,
			);
			url.hostname = `${projectRef}.supabase.co`;
		}

		return url.toString();
	}
}
