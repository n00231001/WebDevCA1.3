import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as authApi from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { updateMeSchema } from "@/schemas/auth";
import { showApiError } from "@/lib/forms";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NameCard() {
  const { user, setUser } = useAuth();
  const [saved, setSaved] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateMeSchema),
    mode: "onTouched",
    defaultValues: { first_name: user.first_name, last_name: user.last_name },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values) {
    setSaved(false);
    try {
      setUser(await authApi.updateMe(values));
      setSaved(true);
    } catch (err) {
      showApiError(form, err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FieldError errors={[errors.root]} />
            <div className="grid grid-cols-2 gap-4">
              <TextField form={form} name="first_name" label="First name" />
              <TextField form={form} name="last_name" label="Last name" />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>
              {saved && <p className="text-sm text-green-700">Saved</p>}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
