import { request } from "./client";

// sort is one of the SORT_OPTIONS in FilesPage, e.g. "name:asc"
export function listFiles(search, starredOnly, sort) {
  const query = new URLSearchParams();
  if (search) {
    query.set("q", search);
  }
  if (starredOnly) {
    query.set("starred", "true");
  }
  if (sort) {
    const [column, order] = sort.split(":");
    query.set("sort", column);
    query.set("order", order);
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
