"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LucideLogIn, LucideLogOut } from "lucide-react";
import { signIn, signOut } from "@/lib/auth";

export function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.name && (
          <span className="text-sm">
            {session.user.name}
            {session.user.role === "admin" && (
              <span className="ml-1 text-xs text-blue-600">(Admin)</span>
            )}
          </span>
        )}
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LucideLogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => signIn("google")}
      className="flex items-center gap-2"
    >
      <LucideLogIn className="h-4 w-4" />
      Sign in
    </Button>
  );
}
