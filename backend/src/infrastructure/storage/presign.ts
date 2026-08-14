import { env } from "../../config/env";

export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
}

/**
 * Generates a presigned upload target for image elements.
 * In local/dev this points at an S3-compatible endpoint (e.g. MinIO)
 * configured via STORAGE_* env vars. Swap this implementation for your
 * cloud provider's SDK (AWS S3, Cloudflare R2, etc.) in production.
 */
export function createPresignedUpload(fileName: string, contentType: string): PresignedUpload {
  const bucket = env.STORAGE_BUCKET ?? "whiteboard-uploads";
  const endpoint = env.STORAGE_ENDPOINT ?? "http://localhost:9000";
  const key = `${Date.now()}-${fileName}`;

  // Placeholder: a real implementation signs this URL with the storage
  // provider's SDK (e.g. @aws-sdk/s3-request-presigner). Kept intentionally
  // swappable so local dev does not require cloud credentials.
  return {
    uploadUrl: `${endpoint}/${bucket}/${key}`,
    fileUrl: `${endpoint}/${bucket}/${key}`,
    fields: { key, "Content-Type": contentType },
  };
}
