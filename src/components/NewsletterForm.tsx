"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call for now
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("You're on the list.", {
      description: "We'll reach out when your spot is ready.",
    });

    setEmail("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Joining..." : "Request an invite"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        We'll only use your email to send an invite. No spam, no selling.
        Read our{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
