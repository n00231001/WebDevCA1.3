import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { registerSchema } from "@/schemas/auth";
import { showApiError } from "@/lib/forms";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const { user, register } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { first_name: "", last_name: "", email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values) {
    try {
      await register(values);
    } catch (err) {
      showApiError(form, err);
    }
  }

  return (
    <Card className="mx-4 mt-12 max-w-sm sm:mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>You get 1 GB of storage for free</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FieldError errors={[errors.root]} />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                form={form}
                name="first_name"
                label="First name"
                autoComplete="given-name"
              />
              <TextField
                form={form}
                name="last_name"
                label="Last name"
                autoComplete="family-name"
              />
            </div>
            <TextField
              form={form}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <TextField
              form={form}
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
