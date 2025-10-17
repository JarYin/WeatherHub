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

export default function SignUp() {
  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
    }
  });

  function onSubmit(data: SignUpData) {
    console.log("Sign Up Data:", data);
    // Handle sign-up logic here
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
              render={({ field }) => (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    id="email"
                    placeholder="example@example.com"
                    required
                  />
                </div>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="password"
                    id="confirm-password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
            />
            <Button type="submit" className="w-full btn btn-primary mt-4">
              Sign Up
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
