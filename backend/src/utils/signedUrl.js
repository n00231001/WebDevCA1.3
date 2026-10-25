import crypto from "node:crypto";
import config from "../config.js";

// The local version of S3's presigned URLs: a link to the /api/storage route
// that works for 1 hour. The signature proves this server made the link, so
// nobody can make their own, or change the key or expiry time.

export function createSignedUrl(key, downloadName, mimeType) {
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  const query = new URLSearchParams({
    expires,
    signature: sign(`${key}:${expires}`),
    name: downloadName,
    type: mimeType,
  });
  return `${config.API_URL}/api/storage/${key}?${query}`;
}

// Checks a link made by createSignedUrl(): not expired, and signed by this server
export function isValidSignature(key, expires, signature) {
  return (
    Number(expires) > Date.now() && signature === sign(`${key}:${expires}`)
  );
}

// An HMAC: a code that can only be made by someone who knows APP_SECRET
function sign(text) {
  return crypto
    .createHmac("sha256", config.APP_SECRET)
    .update(text)
    .digest("hex");
}
