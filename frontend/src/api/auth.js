import { request } from "./client";

export function register(details) {
  return request("POST", "/api/auth/register", details);
}

export function login(email, password) {
  return request("POST", "/api/auth/login", { email, password });
}

export function getMe() {
  return request("GET", "/api/auth/me");
}

export function updateMe(details) {
  return request("PATCH", "/api/auth/me", details);
}

export function changePassword(current_password, new_password) {
  return request("PUT", "/api/auth/me/password", {
    current_password,
    new_password,
  });
}

export function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  return request("PUT", "/api/auth/me/avatar", form);
}

export function deleteAvatar() {
  return request("DELETE", "/api/auth/me/avatar");
}
