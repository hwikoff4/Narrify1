'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Palette,
  Bot,
  Key,
  BarChart3,
  Code,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tours', label: 'Tours', icon: Compass },
  { href: '/dashboard/theme', label: 'Theme', icon: Palette },
  { href: '/dashboard/ai-settings', label: 'AI Settings', icon: Bot },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/embed', label: 'Embed Code', icon: Code },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isHudson, setIsHudson] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.toLowerCase() === 'hudson@eliteteam.ai') {
        setIsHudson(true);
      }
    }
    checkUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-bg-primary" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              Narrify
            </h1>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-bg-tertiary hover:bg-bg-elevated flex items-center justify-center transition-colors border border-border-subtle"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-text-secondary" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5 text-text-secondary" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        id="mobile-navigation"
        className={cn(
          'w-64 bg-bg-secondary/95 backdrop-blur-xl border-r border-border min-h-screen flex flex-col',
          'fixed lg:static top-0 left-0 z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-bg-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Narrify
              </h1>
              <p className="text-xs text-text-tertiary font-medium">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-accent/20'
                    : 'bg-bg-tertiary group-hover:bg-bg-elevated'
                )}>
                  <Icon className={cn('w-5 h-5', isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary')} />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-accent" />
                )}
              </Link>
            );
          })}

          {/* Admin Button - Only visible to Hudson */}
          {isHudson && (
            <>
              <div className="my-4">
                <div className="border-t border-border"></div>
              </div>
              <Link
                href="/dashboard/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative',
                  pathname === '/dashboard/admin'
                    ? 'bg-warm/10 text-warm border border-warm/20'
                    : 'bg-warm/5 text-warm/80 hover:bg-warm/10 hover:text-warm border border-warm/10'
                )}
                aria-current={pathname === '/dashboard/admin' ? 'page' : undefined}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  pathname === '/dashboard/admin' ? 'bg-warm/20' : 'bg-warm/10'
                )}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-semibold">Admin Dashboard</span>
              </Link>
            </>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-text-secondary hover:bg-error/10 hover:text-error rounded-xl transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-lg bg-bg-tertiary group-hover:bg-error/20 flex items-center justify-center transition-all duration-200">
              <LogOut className="w-5 h-5 text-text-tertiary group-hover:text-error" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
