import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as authApi from "@/api/auth";
import { changePasswordSchema } from "@/schemas/auth";
import { showApiError } from "@/lib/forms";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PasswordCard() {
  const [changed, setChanged] = useState(false);

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { current_password: "", new_password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values) {
    setChanged(false);
    try {
      await authApi.changePassword(
        values.current_password,
        values.new_password,
      );
      form.reset(); // empty the fields
      setChanged(true);
    } catch (err) {
      showApiError(form, err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FieldError errors={[errors.root]} />
            <TextField
              form={form}
              name="current_password"
              label="Current password"
              type="password"
              autoComplete="current-password"
            />
            <TextField
              form={form}
              name="new_password"
              label="New password"
              type="password"
              autoComplete="new-password"
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                Change password
              </Button>
              {changed && (
                <p className="text-sm text-green-700">Password changed</p>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
