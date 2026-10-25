import * as authService from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";
import { createToken } from "../utils/token.js";

// Register and login send back the user, and a token that logs them in.
// There's no logout route: the frontend logs out by deleting its token.

export async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({ token: createToken(user.id), user });
}

export async function login(req, res) {
  const user = await authService.login(req.body);
  res.json({ token: createToken(user.id), user });
}

export async function getMe(req, res) {
  const user = await authService.getMe(req.user.internalId);
  res.json(user);
}

export async function updateMe(req, res) {
  const user = await authService.updateName(req.user.internalId, req.body);
  res.json(user);
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user.internalId, req.body);
  res.status(204).end();
}

// PUT /api/auth/me/avatar
export async function updateAvatar(req, res) {
  if (!req.file) {
    throw new HttpError(400, "Choose an image to upload");
  }

  const user = await authService.setAvatar(req.user.internalId, req.file);
  res.json(user);
}

// DELETE /api/auth/me/avatar
export async function deleteAvatar(req, res) {
  await authService.removeAvatar(req.user.internalId);
  res.status(204).end();
}
