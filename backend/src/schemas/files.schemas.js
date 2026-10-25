import { z } from "zod";

// Rename a file, star or unstar it, or both. Both fields are optional.
export const updateFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .optional(),
  is_starred: z.boolean("is_starred must be true or false").optional(),
});
