import jwt from "jsonwebtoken";
import config from "../config.js";

// Login tokens (JWTs). The API gives the frontend a token when a user logs in
// or registers, and the frontend sends it back with every request, in the
// Authorization header. The token is signed with APP_SECRET, so nobody can
// make their own, or change the user in it.

// Makes a token for a user, from their UUID. It works for 7 days.
export function createToken(userId) {
  return jwt.sign({ sub: userId }, config.APP_SECRET, { expiresIn: "7d" });
}

// Returns the user's UUID from a token, or null if the token isn't valid or
// has expired
export function getUserIdFromToken(token) {
  try {
    const payload = jwt.verify(token, config.APP_SECRET, {
      algorithms: ["HS256"],
    });
    return payload.sub;
  } catch {
    return null;
  }
}
