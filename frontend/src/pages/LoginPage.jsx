import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/schemas/auth";
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

export default function LoginPage() {
  const { user, login } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // check a field when you leave it, then as you type
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  // Already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values) {
    try {
      await login(values.email, values.password);
    } catch (err) {
      showApiError(form, err);
    }
  }

  return (
    <Card className="mx-4 mt-12 max-w-sm sm:mx-auto">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Log in to see your files</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FieldError errors={[errors.root]} />
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
              autoComplete="current-password"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="underline">
                Create one
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
