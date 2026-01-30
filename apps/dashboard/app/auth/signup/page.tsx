'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles, ArrowRight, AlertCircle, Eye, EyeOff, Mail, Lock, User, Building2, Check } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company,
          },
        },
      });

      if (authError) {
        if (authError.message?.includes('rate') || authError.message?.includes('40 seconds')) {
          throw new Error('Too many signup attempts. Please wait a moment and try again.');
        }
        throw authError;
      }

      if (authData.user) {
        const { error: clientError } = await supabase.from('clients').insert({
          auth_user_id: authData.user.id,
          email,
          name,
          company,
        });

        if (clientError && !clientError.message?.includes('unique')) {
          throw clientError;
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-violet rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-accent rounded-full blur-[128px] opacity-20" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet/20 via-accent/20 to-violet/20 rounded-3xl blur-xl opacity-50" />
        
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
              Create your account
            </h1>
            <p className="text-text-secondary">
              Start building interactive tours in minutes
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSignup}>
            {/* Error Alert */}
            {error && (
              <div className="bg-error-bg border border-error/30 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-12"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-text-secondary mb-2">
                Company <span className="text-text-tertiary">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="input pl-12"
                  placeholder="Your company"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-text-tertiary text-center">
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-accent hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-secondary text-text-tertiary">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary py-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="btn-secondary py-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Sign in link */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-accent hover:text-accent-light transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
