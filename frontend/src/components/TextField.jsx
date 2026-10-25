import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// A labelled input for a React Hook Form form.
export default function TextField({ form, name, label, ...props }) {
  const error = form.formState.errors[name];

  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        aria-invalid={Boolean(error)}
        {...form.register(name)}
        {...props}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
