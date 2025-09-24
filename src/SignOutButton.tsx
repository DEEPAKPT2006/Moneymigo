"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-6 py-2 rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-purple-600 text-white font-semibold shadow-xl border-none hover:from-cyan-300 hover:to-fuchsia-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
