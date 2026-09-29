"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Car, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Authentication failed");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      toast.error("Access denied. Admin account required.");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-loco-600 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold text-slate-900">
              LOCO<span className="text-loco-600">.com</span>
            </span>
          </Link>
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Owner Dashboard</span>
          </div>
        </div>

        <div className="card mt-8 p-6 sm:p-8">
          <h1 className="text-center font-display text-xl font-semibold text-slate-900">
            Sign in
          </h1>
          <Suspense fallback={<div className="mt-8 h-40 animate-pulse bg-slate-100 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
