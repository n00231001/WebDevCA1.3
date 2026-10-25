import { z } from "zod";

// The same rules as backend/src/schemas/files.schemas.js
export const renameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
});
