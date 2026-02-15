"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/shared/icons";
import { useToast } from "@/hooks/use-toast";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { OTPLogin } from "@/components/auth/otp-login";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Handle OAuth account not linked error
  React.useEffect(() => {
    if (errorParam === "OAuthAccountNotLinked") {
      // Redirect to the error page with provider information
      const provider = searchParams.get('provider') || 'Google or GitHub';
      router.push(`/auth/error?error=OAuthAccountNotLinked&provider=${encodeURIComponent(provider)}`);
    }
  }, [errorParam, searchParams, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthTabs 
      socialContent={
        <div className="grid grid-cols-2 gap-6">
          <Button
            variant="outline"
            onClick={() => signInWithProvider("github")}
            disabled={isLoading}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => signInWithProvider("google")}
            disabled={isLoading}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
      }
      emailContent={
        <div className="space-y-4">
          <form onSubmit={onSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button disabled={isLoading} className="w-full">
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </div>
          </form>
        </div>
      }
      otpContent={
        <OTPLogin onSuccess={() => {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
          router.push(callbackUrl);
          router.refresh();
        }} />
      }
      footerContent={
        <div className="text-center text-sm text-muted-foreground w-full">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </div>
      }
    />
  );
}