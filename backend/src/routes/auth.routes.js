import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../services/storage.service.js";
import {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
} from "../schemas/auth.schemas.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// These need a logged in user, so they use requireAuth
router.get("/me", requireAuth, authController.getMe);
router.patch(
  "/me",
  requireAuth,
  validate(updateMeSchema),
  authController.updateMe,
);
router.put(
  "/me/password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);

// PUT replaces the profile picture. upload.single("avatar") accepts one file in a form field called "avatar".
router.put(
  "/me/avatar",
  requireAuth,
  upload.single("avatar"),
  authController.updateAvatar,
);
router.delete("/me/avatar", requireAuth, authController.deleteAvatar);

export default router;
