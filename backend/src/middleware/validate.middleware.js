// Checks req.body against a zod schema before the controller runs.
// Can be used in a route like this: validate(loginSchema)
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Send back the first problem and the field it's about
      const issue = result.error.issues[0];
      return res
        .status(400)
        .json({ error: issue.message, field: issue.path[0] });
    }

    // Zod's cleaned up data, with spaces trimmed
    req.body = result.data;
    next();
  };
}
