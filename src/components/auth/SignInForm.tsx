"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent } from "react";

interface SignInFormProps {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  buttonLabel: string;
}

export default function SignInForm({
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  forgotPasswordLabel,
  buttonLabel,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would handle the form submission, like:
      // await signIn("credentials", { email, password, redirect: true });
      console.log("Signing in with:", email, password);
      // For now we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{emailLabel}</Label>
          <Input
            id="email"
            placeholder={emailPlaceholder}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{passwordLabel}</Label>
            <a
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              {forgotPasswordLabel}
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : buttonLabel}
        </Button>
      </div>
    </form>
  );
}
