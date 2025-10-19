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
import Link from "next/link";
import { useState } from "react";
import { signInApi } from "../api/signInApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSession, setSession } from "@/lib/session";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleFormChange() {
    setEmail("demo@example.com");
    setPassword("password");
  }

  async function handleSubmit(event: React.FormEvent) {
    try {
      event.preventDefault();
      setIsLoading(true);
      const response = await signInApi({ email, password });
      if (response) {
        router.push("/dashboard");
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-bold">Sign In</h1>
          </CardTitle>
          <CardDescription>
            <p className="text-muted-foreground">
              Enter your credentials to access the dashboard
            </p>
            <Button
              onClick={() => handleFormChange()}
              variant={"outline"}
              className="block w-full"
            >
              Demo User: demo@example.com
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
