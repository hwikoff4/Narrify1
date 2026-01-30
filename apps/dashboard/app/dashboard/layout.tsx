import { DashboardNav } from '@/components/dashboard-nav';
import { DemoModeBanner } from '@/components/demo-mode-banner';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // In demo mode, session check is bypassed
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!isDemoMode) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/login');
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Skip to Main Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-accent focus:text-bg-primary focus:rounded-xl focus:font-semibold focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent/30"
      >
        Skip to main content
      </a>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-accent rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] bg-violet rounded-full blur-[150px] opacity-10" />
      </div>

      <DashboardNav />
      <main id="main-content" className="flex-1 overflow-auto relative pt-16 lg:pt-0">
        <DemoModeBanner />
        {children}
      </main>
    </div>
  );
}
