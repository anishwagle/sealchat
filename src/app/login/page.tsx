"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

type AuthState = "idle" | "loading" | "sent" | "error" | "verifying";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthState("sent");
      } else if (data.error === "not_invited") {
        setAuthState("error");
        setErrorMessage(
          "You are not invited yet or this account does not exist. Join the waitlist on the homepage to request access."
        );
      } else {
        setAuthState("error");
        setErrorMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setAuthState("error");
      setErrorMessage("Could not connect. Please try again.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState("verifying");
    setErrorMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: "email",
    });

    if (error) {
      setErrorMessage(error.message || "Invalid or expired code.");
      setAuthState("sent"); // Reset to sent state to allow re-entry
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
            SealChat
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your email to sign in. You need an invite to continue.
          </p>
        </div>

        {callbackError === "invalid_link" && authState === "idle" && (
          <p className="text-sm text-destructive">
            That link was invalid or expired. Request a new one below.
          </p>
        )}

        {(authState === "sent" || authState === "verifying") ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Check your inbox. We sent a link and code to{" "}
                <span className="font-medium">{email}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                It may take a minute to arrive. Check your spam folder if you
                don&apos;t see it.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="auth-otp"
                  className="text-sm font-medium text-foreground block"
                >
                  8-Digit Code
                </label>
                <Input
                  id="auth-otp"
                  type="text"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={authState === "verifying"}
                  placeholder="00000000"
                  className="h-10 text-sm px-3 tracking-[0.5em] text-center font-mono"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={authState === "verifying" || otp.length !== 8}
                className="w-full h-10 text-sm"
              >
                {authState === "verifying" ? "Verifying..." : "Verify Code"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthState("idle");
                  setEmail("");
                  setOtp("");
                  setErrorMessage("");
                }}
                className="text-sm text-muted-foreground underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="auth-email"
                className="text-sm font-medium text-foreground block"
              >
                Email
              </label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authState === "loading"}
                placeholder="you@example.com"
                className="h-10 text-sm px-3"
              />
            </div>

            {authState === "error" && errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={authState === "loading" || !email.trim()}
              className="w-full h-10 text-sm"
            >
              {authState === "loading" ? "Sending..." : "Send sign-in link"}
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            No invite yet?{" "}
            <Link href="/" className="underline underline-offset-2">
              Join the waitlist
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
