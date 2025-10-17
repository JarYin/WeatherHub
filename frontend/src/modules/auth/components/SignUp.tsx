"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Controller, useForm } from "react-hook-form";
import { SignUpData, signUpSchema } from "../validation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FieldError } from "@/components/ui/field";
import { useState } from "react";

export default function SignUp() {
  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);

  function onSubmit(data: SignUpData) {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      alert(`Account created for ${data.email}`);
    }, 2000);
  }
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-bold">Sign Up</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    id="email"
                    placeholder="example@example.com"
                    required
                    className={fieldState.invalid ? "border-red-500" : ""}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    required
                    className={fieldState.invalid ? "border-red-500" : ""}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => {
                const password = form.watch("password");
                const confirmPassword = field.value;
                return (
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="password"
                      id="confirm-password"
                      placeholder="••••••••"
                      required
                      className={fieldState.invalid ? "border-red-500" : ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    {password &&
                      confirmPassword &&
                      password !== confirmPassword && (
                        <p className="text-red-500 text-sm">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                );
              }}
            />
            <Button type="submit" disabled={loading} className="w-full btn btn-primary mt-4">
              {loading ? "Creating..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
