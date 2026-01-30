'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset link sent! Check your email inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-neutral-200/50 shadow-glass p-8 sm:p-10 animate-scale-in">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Narrify
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Reset password
            </h1>
            <p className="text-neutral-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {/* Error Alert */}
            {error && (
              <div className="bg-error-50 border border-error-200/50 rounded-xl p-4 animate-fade-down">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {message && (
              <div className="bg-success-50 border border-success-200/50 rounded-xl p-4 animate-fade-down">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-success-800 font-medium">{message}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl shadow-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="you@company.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full px-6 py-3.5 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to sign in */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
