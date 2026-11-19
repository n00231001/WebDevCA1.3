import { Router } from "express";
import * as filesController from "../controllers/files.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { upload } from "../services/storage.service.js";
import { updateFileSchema } from "../schemas/files.schemas.js";

const router = Router();

// Every route in this file needs a logged in user.
router.use(requireAuth);

router.get("/", filesController.listFiles);

// upload.array("files", 10) accepts up to 10 files from "files"
router.post("/", upload.array("files", 10), filesController.uploadFiles);

router.patch("/:id", validate(updateFileSchema), filesController.updateFile);
router.delete("/:id", filesController.deleteFile);

export default router;
