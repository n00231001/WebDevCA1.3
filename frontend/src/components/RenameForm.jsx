import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { renameSchema } from "@/schemas/files";
import { showApiError } from "@/lib/forms";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

// Renames a file. onRename saves the new name, and onDone closes the form.
export default function RenameForm({ file, onRename, onDone }) {
  const form = useForm({
    resolver: zodResolver(renameSchema),
    mode: "onTouched",
    defaultValues: { name: file.name },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values) {
    try {
      await onRename(values.name);
      onDone();
    } catch (err) {
      showApiError(form, err);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-2"
    >
      <TextField form={form} name="name" label="Name" autoFocus />
      <FieldError errors={[errors.root]} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
