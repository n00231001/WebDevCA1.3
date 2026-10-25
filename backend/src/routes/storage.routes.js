import { Router } from "express";
import { serveFile } from "../controllers/storage.controller.js";
import config from "../config.js";

// Only used by the local storage driver. With S3, links go straight to S3.
const router = Router();

if (config.STORAGE_DRIVER === "local") {
  router.get("/:key", serveFile);
}

export default router;
