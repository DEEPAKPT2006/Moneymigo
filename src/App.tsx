import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";

// Futuristic glassmorphism button
// ...existing code...
import React from "react";
type FuturisticButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
};
const FuturisticButton: React.FC<FuturisticButtonProps> = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2 rounded-xl bg-gradient-to-br from-cyan-500/80 to-fuchsia-700/80 border border-cyan-400/40 shadow-xl backdrop-blur-lg text-white font-semibold tracking-wide transition-all duration-200 hover:scale-105 hover:bg-cyan-500/90 hover:text-fuchsia-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${className}`}
    style={{ zIndex: 1 }}
  >
    <span className="absolute inset-0 rounded-xl pointer-events-none border border-cyan-300/10 blur-sm"></span>
    <span className="relative z-10">{children}</span>
  </button>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-cyan-900/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-extrabold text-2xl tracking-widest drop-shadow-lg">LL</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent drop-shadow-xl">
              Living Ledger
            </h1>
          </div>
          <Authenticated>
            <FuturisticButton>
              <SignOutButton />
            </FuturisticButton>
          </Authenticated>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <Authenticated>
          <Dashboard />
        </Authenticated>

        <Unauthenticated>
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="max-w-md w-full">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <span className="text-white font-extrabold text-3xl tracking-widest drop-shadow-lg">LL</span>
                </div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent mb-2 drop-shadow-xl">
                  Living Ledger
                </h1>
                <p className="text-cyan-100 text-lg mb-2">
                  Your financial story, alive and evolving
                </p>
                <p className="text-cyan-200 text-sm">
                  Transform static numbers into a dynamic, predictive financial identity
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <FuturisticButton>
                  <SignInForm />
                </FuturisticButton>
              </div>
            </div>
          </div>
        </Unauthenticated>
      </main>
      <footer className="mt-auto py-4 text-center text-cyan-300/70 text-sm tracking-wide bg-transparent">
        &copy; {new Date().getFullYear()} Living Ledger. All rights reserved.
      </footer>
      <Toaster />
    </div>
  );
}
