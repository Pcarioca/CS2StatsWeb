import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.resolve("uploads");

export async function uploadFile(buffer: Buffer, filename: string, type: string, mimeType?: string): Promise<string> {
  // If S3 is configured, try to upload there
  const bucket = process.env.S3_BUCKET;
  if (bucket) {
    try {
      // dynamic import to keep dependency optional
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3") as any;
      const client = new S3Client({ region: process.env.AWS_REGION });

      const key = `${type}/${filename}`;

      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType || undefined,
        ACL: "public-read",
      }));

      // Construct URL: allow override via S3_BASE_URL (e.g., https://cdn.example.com)
      const base = process.env.S3_BASE_URL ?? `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
      return `${base}/${key}`;
    } catch (err) {
      console.error("S3 upload failed, falling back to local storage:", err);
    }
  }

  // Ensure local directory exists
  const destDir = path.join(UPLOADS_DIR, type || "misc");
  await fs.promises.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  await fs.promises.writeFile(destPath, buffer);

  // Return relative URL served by express static
  return `/uploads/${type || "misc"}/${filename}`;
}
