"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for a confirmation link.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 bg-[#f5a623] rounded-sm flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-white">ResumeAI</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-white/40 text-sm mb-8">Start analyzing your resume for free.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/50 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {message && (
            <p className="text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f5a623] text-[#0a0a0a] font-bold py-3 rounded-lg text-sm hover:bg-[#f5a623]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f5a623] hover:text-[#f5a623]/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}