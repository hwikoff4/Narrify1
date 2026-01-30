import { createClient } from '@/lib/supabase/server';
import { formatNumber, formatPercent } from '@/lib/utils';
import { 
  Users, 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  Sparkles, 
  Palette, 
  Code, 
  ArrowRight, 
  Zap, 
  Lightbulb,
  ArrowUpRight,
  Target,
  Compass
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();

  // Get client data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user?.id)
    .single();

  // Get analytics summary
  const { data: analytics } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('client_id', client?.id);

  const tourStarts = analytics?.filter((e: any) => e.type === 'tour_start').length || 0;
  const tourCompletes = analytics?.filter((e: any) => e.type === 'tour_complete').length || 0;
  const questions = analytics?.filter((e: any) => e.type === 'question_asked').length || 0;
  const completionRate = tourStarts > 0 ? tourCompletes / tourStarts : 0;

  // Get tours count
  const { data: tours } = await supabase
    .from('tours')
    .select('id')
    .eq('client_id', client?.id);

  // Get API keys count
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id')
    .eq('client_id', client?.id)
    .eq('active', true);

  const stats = [
    {
      label: 'Tour Views',
      value: formatNumber(tourStarts),
      icon: Eye,
      color: 'accent',
      change: '+12%',
    },
    {
      label: 'Completion Rate',
      value: formatPercent(completionRate),
      icon: TrendingUp,
      color: 'accent',
      change: '+5%',
    },
    {
      label: 'Questions Asked',
      value: formatNumber(questions),
      icon: MessageCircle,
      color: 'violet',
      change: '+28%',
    },
    {
      label: 'Active Tours',
      value: formatNumber(tours?.length || 0),
      icon: Target,
      color: 'warm',
      change: null,
    },
  ];

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          Welcome back, <span className="gradient-text">{client?.name || 'there'}</span>
        </h1>
        <p className="text-lg text-text-secondary">
          {(tours?.length || 0) === 0
            ? "Let's create your first interactive tour"
            : "Here's an overview of your tour performance"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            accent: 'bg-accent/10 text-accent border-accent/20',
            violet: 'bg-violet/10 text-violet border-violet/20',
            warm: 'bg-warm/10 text-warm border-warm/20',
          };
          const iconBgClasses = {
            accent: 'bg-accent/20',
            violet: 'bg-violet/20',
            warm: 'bg-warm/20',
          };
          
          return (
            <div
              key={stat.label}
              className="group relative bg-bg-secondary rounded-2xl border border-border p-6 hover:border-border-strong transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${iconBgClasses[stat.color as keyof typeof iconBgClasses]} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color === 'accent' ? 'text-accent' : stat.color === 'violet' ? 'text-violet' : 'text-warm'}`} />
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs font-medium text-accent">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              
              <p className="text-sm font-medium text-text-tertiary mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Quick Actions</h2>
            <p className="text-sm text-text-tertiary">Get started with common tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/tours"
            className="group relative p-6 bg-bg-tertiary rounded-xl border border-border-subtle hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              Create Tour
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-text-secondary">
              Build AI-powered interactive tours in minutes
            </p>
          </Link>

          <Link
            href="/dashboard/theme"
            className="group relative p-6 bg-bg-tertiary rounded-xl border border-border-subtle hover:border-violet/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-violet/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6 text-violet" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              Customize Theme
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-text-secondary">
              Match your brand colors and style
            </p>
          </Link>

          <Link
            href="/dashboard/embed"
            className="group relative p-6 bg-bg-tertiary rounded-xl border border-border-subtle hover:border-warm/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-warm/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-warm" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              Embed Code
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-text-secondary">
              Add tours to your website with one script
            </p>
          </Link>
        </div>
      </div>

      {/* Getting Started - First Time Users */}
      {(tours?.length || 0) === 0 && (
        <div className="relative bg-bg-secondary rounded-2xl border border-border overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-violet/5" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-30" />

          <div className="relative p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4 shadow-glow">
                <Lightbulb className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3">
                Get Started in <span className="gradient-text">3 Simple Steps</span>
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Create your first AI-powered interactive tour and transform how users explore your product
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Step 1 - Active */}
              <div className="group relative bg-bg-tertiary rounded-xl border border-accent/30 p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-lg bg-gradient-teal flex items-center justify-center shadow-glow text-bg-primary font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-text-primary mb-3 mt-4">Create Your Tour</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Let AI automatically build your tour by providing your website URL and goals
                </p>
                <Link
                  href="/dashboard/tours/new"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light transition-colors group/link"
                >
                  Start now
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Step 2 - Disabled */}
              <div className="relative bg-bg-tertiary/50 rounded-xl border border-border-subtle p-6 opacity-60">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-tertiary font-bold text-sm border border-border">
                  2
                </div>
                <h3 className="font-bold text-text-tertiary mb-3 mt-4">Customize Appearance</h3>
                <p className="text-sm text-text-muted mb-4">
                  Match your brand with custom colors, logo, and styling options
                </p>
                <span className="text-xs text-text-muted font-medium">Available after step 1</span>
              </div>

              {/* Step 3 - Disabled */}
              <div className="relative bg-bg-tertiary/50 rounded-xl border border-border-subtle p-6 opacity-60">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-tertiary font-bold text-sm border border-border">
                  3
                </div>
                <h3 className="font-bold text-text-tertiary mb-3 mt-4">Deploy to Website</h3>
                <p className="text-sm text-text-muted mb-4">
                  Copy and paste a single script tag to activate tours on your site
                </p>
                <span className="text-xs text-text-muted font-medium">Available after step 1</span>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-accent mb-1">Pro Tip</p>
                <p className="text-sm text-text-secondary">
                  Your first tour takes about 2 minutes to create. No coding required - just provide your URL and let our AI handle the rest.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
