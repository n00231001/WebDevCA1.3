import fs from "node:fs";
import { getFilePath } from "../services/storage.service.js";
import { isValidSignature } from "../utils/signedUrl.js";
import { HttpError } from "../utils/httpError.js";

// Sends a file saved by the local storage driver.
// Only works with a link from createSignedUrl(), before it expires.
export function serveFile(req, res) {
  const { key } = req.params;
  const { expires, signature, name, type } = req.query;

  if (!isValidSignature(key, expires, signature)) {
    throw new HttpError(403, "This link is invalid or has expired");
  }

  const filePath = getFilePath(key);

  // The file is no longer in the uploads folder
  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, "File not found on the server");
  }

  // "attachment" makes the browser download the file, and never open it as a page.
  // This stops an uploaded HTML file from running scripts on the API's domain.
  // Images still show in an <img> tag.
  res.attachment(name);
  res.type(type || "application/octet-stream");
  // Helmet blocks other sites from showing API responses in <img> tags.
  // Allow it here, so images work on the frontend, like S3 presigned URLs do.
  res.set("Cross-Origin-Resource-Policy", "cross-origin");
  res.sendFile(filePath);
}
