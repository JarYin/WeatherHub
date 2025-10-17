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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleFormChange() {
    setEmail("demo@example.com");
    setPassword("password");
    console.log("Demo user credentials filled:", email, password);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Signed in as ${email}`);
    }, 2000);
    clearTimeout();
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <div className="hover:bg-blue-50 rounded" onClick={() => handleFormChange()}>
                <p className="font-bold w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-400 text-transparent bg-clip-text rounded py-2 text-center">
                  Demo User: demo@example.com
                </p>
              </div>
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
