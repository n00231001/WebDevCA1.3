import * as filesService from "../services/files.service.js";
import { HttpError } from "../utils/httpError.js";

// GET /api/files?q=...&starred=true&sort=name&order=asc
export async function listFiles(req, res) {
  console.log("listFiles", req.query);
  const files = await filesService.listFiles(req.user.internalId, {
    search: req.query.q,
    starredOnly: req.query.starred === "true",
    sort: req.query.sort,
    order: req.query.order,
  });
  res.json(files);
}

// POST /api/files
export async function uploadFiles(req, res) {
  if (!req.files || req.files.length === 0) {
    throw new HttpError(400, "Choose at least one file to upload");
  }

  const files = await filesService.addFiles(req.user.internalId, req.files);
  res.status(201).json(files);
}

// PATCH /api/files/:id
export async function updateFile(req, res) {
  const file = await filesService.updateFile(
    req.user.internalId,
    req.params.id,
    req.body,
  );
  res.json(file);
}

// DELETE /api/files/:id
export async function deleteFile(req, res) {
  await filesService.deleteFile(req.user.internalId, req.params.id);
  res.status(204).end();
}
