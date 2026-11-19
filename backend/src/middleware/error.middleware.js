import multer from "multer";
import config from "../config.js";

// Any URL that did not match a route
export function unknownEndpoint(_req, res) {
  res.status(404).json({ error: "Not found" });
}

// Any error thrown in a route ends up here
export function errorHandler(err, _req, res, _next) {
  // Errors from Multer while uploading. Multer has already removed any files it saved.
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: `Files must be ${config.MAX_UPLOAD_MB} MB or smaller` });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: `Unexpected file in "${err.field}". Check the form field name and the number of files.`,
      });
    }
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;

  if (status >= 500 || !err.message) {
    console.error(err);
    return res.status(status).json({ error: "Internal server error" });
  }

  res.status(status).json({ error: err.message });
}
