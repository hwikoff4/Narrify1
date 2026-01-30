'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Only show in demo mode
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!isDemoMode || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Demo Mode Active</p>
            <p className="text-sm text-amber-100">
              You're viewing the dashboard with mock data. Set up Supabase to use real data.{' '}
              <a
                href="https://github.com/your-repo/narrify#setup"
                className="underline font-medium hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Setup Guide
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-600 rounded transition flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
