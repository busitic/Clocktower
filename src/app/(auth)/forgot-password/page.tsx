"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/server/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              {/* Same message whether or not the account exists */}
              <p className="text-muted-foreground text-sm">
                If an account exists for <span className="text-foreground font-medium">{email}</span>,
                we&apos;ve sent a link to reset your password. It works for 1 hour.
              </p>
              <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
                Back to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Enter your email and we&apos;ll send you a link to choose a new password.
              </p>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground block text-center text-sm underline-offset-4 hover:underline"
              >
                Back to log in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}