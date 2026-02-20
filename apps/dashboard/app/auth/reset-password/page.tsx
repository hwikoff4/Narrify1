'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError('Password does not meet the strength requirements.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message?.includes('same')) {
          throw new Error('New password must be different from your current password.');
        }
        if (error.message?.includes('session') || error.message?.includes('expired')) {
          throw new Error('Your reset link has expired. Please request a new one.');
        }
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-accent rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-violet rounded-full blur-[128px] opacity-20" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-violet/20 to-accent/20 rounded-3xl blur-xl opacity-50" />

        <div className="relative bg-bg-secondary/90 backdrop-blur-xl rounded-3xl border border-border p-8 sm:p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-teal flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-bg-primary" />
            </div>
            <span className="text-3xl font-bold text-text-primary">Narrify</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Set new password
            </h1>
            <p className="text-text-secondary">
              Choose a strong password for your account
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-accent font-medium">
                    Your password has been reset successfully.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 group"
              >
                <span>Continue to dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            /* Form */
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {/* Error Alert */}
              {error && (
                <div className="bg-error-bg border border-error/30 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    <div className="flex gap-2">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${hasMinLength ? 'bg-accent' : 'bg-bg-elevated'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${hasUppercase ? 'bg-accent' : 'bg-bg-elevated'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${hasNumber ? 'bg-accent' : 'bg-bg-elevated'}`} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${hasMinLength ? 'text-accent' : 'text-text-tertiary'}`}>
                        <Check className="w-3 h-3" /> 8+ characters
                      </span>
                      <span className={`flex items-center gap-1 ${hasUppercase ? 'text-accent' : 'text-text-tertiary'}`}>
                        <Check className="w-3 h-3" /> Uppercase
                      </span>
                      <span className={`flex items-center gap-1 ${hasNumber ? 'text-accent' : 'text-text-tertiary'}`}>
                        <Check className="w-3 h-3" /> Number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Passwords match indicator */}
                {confirmPassword && (
                  <div className="mt-2 animate-fade-in">
                    <span className={`flex items-center gap-1 text-xs ${passwordsMatch ? 'text-accent' : 'text-error'}`}>
                      <Check className="w-3 h-3" /> {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset password</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
