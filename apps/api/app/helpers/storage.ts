import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../utils/env.js";

const client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

/** Upload (or overwrite) an object in the configured bucket. */
export async function putObject({
  key,
  body,
  contentType,
}: PutObjectInput): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Delete an object. Missing keys are ignored. */
export async function removeObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
  );
}

/** Public URL for an object key. */
export function publicUrl(key: string): string {
  const base =
    env.S3_PUBLIC_URL ?? `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}`;
  return `${base.replace(/\/$/, "")}/${key}`;
}
