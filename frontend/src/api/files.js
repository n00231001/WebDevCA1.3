import { request } from "./client";

export function listFiles(search, starredOnly) {
  const query = new URLSearchParams();
  if (search) {
    query.set("q", search);
  }
  if (starredOnly) {
    query.set("starred", "true");
  }
  return request("GET", `/api/files?${query}`);
}

// files is a list of files from a form
export function uploadFiles(files) {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  return request("POST", "/api/files", form);
}

export function updateFile(id, changes) {
  return request("PATCH", `/api/files/${id}`, changes);
}

export function deleteFile(id) {
  return request("DELETE", `/api/files/${id}`);
}
