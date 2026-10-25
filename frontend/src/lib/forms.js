import { ApiError } from "@/api/client";

// Shows an error from the API on a React Hook Form form, under the field it's
// about, or at the top of the form if it isn't about one field.
export function showApiError(form, err) {
  if (err instanceof ApiError && err.field) {
    form.setError(err.field, { message: err.message });
  } else {
    form.setError("root", { message: err.message });
  }
}
