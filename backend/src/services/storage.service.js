import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import multerS3 from "multer-s3";
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config.js";
import { createSignedUrl } from "../utils/signedUrl.js";

if (config.STORAGE_DRIVER !== "local" && config.STORAGE_DRIVER !== "s3") {
  throw new Error(
    `STORAGE_DRIVER must be "local" or "s3", not "${config.STORAGE_DRIVER}"`,
  );
}

const useS3 = config.STORAGE_DRIVER === "s3";

if (useS3 && (!config.S3_BUCKET || !config.AWS_REGION)) {
  throw new Error(
    "S3_BUCKET and AWS_REGION must be set when STORAGE_DRIVER is s3",
  );
}

// The folder for local files
const uploadDir = path.resolve(config.UPLOAD_DIR);

// Where Multer saves uploaded files. Each file gets a random UUID as its key.
let s3;
let storage;
if (useS3) {
  s3 = new S3Client({ region: config.AWS_REGION });

  storage = multerS3({
    s3,
    bucket: config.S3_BUCKET,
    key: (_req, _file, cb) => cb(null, crypto.randomUUID()),
    // Store the file's type, so S3 sends it back with the right type
    contentType: (_req, file, cb) => cb(null, file.mimetype),
  });
} else {
  storage = multer.diskStorage({
    destination: uploadDir, // Multer creates the folder if it doesn't exist
    filename: (_req, file, cb) => {
      // multer-s3 calls this file.key, so use the same name here
      file.key = crypto.randomUUID();
      cb(null, file.key);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024 },
  defParamCharset: "utf8",
});

// Saves a file that is already in memory. Only used by the seed script:
// the app itself saves uploads with the Multer middleware above.
export async function saveFile(key, buffer, mimeType) {
  if (useS3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  } else {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(getFilePath(key), buffer);
  }
}

export async function deleteFile(key) {
  if (useS3) {
    await s3.send(
      new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: key }),
    );
  } else {
    await fs.rm(getFilePath(key), { force: true });
  }
}

// A link to the file, for the frontend to use in <img src> and download links.
// Both drivers give a link that works for 1 hour, for anyone who has it.
export async function getUrl(key, downloadName, mimeType) {
  if (useS3) {
    // A presigned URL: a link straight to the file in S3 that works for 1 hour.
    // The bucket stays private. Only people with this link can get the file.
    const command = new GetObjectCommand({
      Bucket: config.S3_BUCKET,
      Key: key,
      // Download the file with its real name, instead of opening it as a page.
      // encodeURIComponent makes names with spaces or accents safe to send.
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    });
    return getSignedUrl(s3, command, { expiresIn: 60 * 60 }); // 1 hour, in seconds
  } else {
    // The local version of a presigned URL, see utils/signedUrl.js
    return createSignedUrl(key, downloadName, mimeType);
  }
}

// The full path to a local file on disk
export function getFilePath(key) {
  return path.join(uploadDir, key);
}
