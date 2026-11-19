import { HttpError } from "../utils/httpError.js";
import { getUserIdFromToken } from "../utils/token.js";
import { getUserFromUUID } from "../services/auth.service.js";

// Add to any route that needs a logged in user. The frontend sends the token
// it got from logging in, in the Authorization header:
//
//   Authorization: Bearer <token>
//
// Afterwards, the logged in user is stored in req.user.
// Use req.user.internalId in SQL queries, and req.user.id (the UUID) in responses.
export async function requireAuth(req, _res, next) {
  // "Bearer abc123" -> ["Bearer", "abc123"]
  const [scheme, token] = (req.get("Authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Authentication required");
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw new HttpError(401, "Your login has expired. Please log in again.");
  }

  const user = await getUserFromUUID(userId);
  if (!user) {
    throw new HttpError(401, "User not found");
  }

  req.user = user;
  next();
}
