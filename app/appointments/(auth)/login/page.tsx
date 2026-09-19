'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plane, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/coordinator';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Coordinator Sign In — Database Setup Required" />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-surface-border bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-aviation flex items-center justify-center text-white shadow-sm">
              <Plane className="w-5 h-5 text-aviation-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-aviation-600">
                Department of Aviation
              </div>
              <div className="text-xs font-semibold text-aviation-950">
                Faculty–Student Appointment Portal
              </div>
            </div>
          </Link>
          <Link
            href="/appointments/book"
            className="text-xs font-medium text-aviation-800 hover:text-aviation-950 px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface"
          >
            Public Student Booking &rarr;
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-surface-border shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-aviation-50 text-aviation-800 border border-aviation-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-aviation-700" />
            </div>
            <h2 className="text-lg font-bold text-aviation-950">Coordinator Sign In</h2>
            <p className="text-xs text-gray-500 mt-1">
              Authorized administrative access for Department of Aviation
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-aviation-950 mb-1.5">
                Coordinator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="coordinator@aviation.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation focus:ring-1 focus:ring-aviation"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-aviation-950 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation focus:ring-1 focus:ring-aviation"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-aviation hover:bg-aviation-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-border text-center">
            <p className="text-[11px] text-gray-500">
              Only authorized Coordinators require authentication. Students can book directly via the{' '}
              <Link href="/appointments/book" className="text-aviation-700 font-semibold underline">
                booking portal
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-4 px-6 text-center text-xs text-gray-400">
        Department of Aviation &bull; Institutional Portal
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-xs text-gray-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

