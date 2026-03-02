'use client';

import { NarrifyProvider } from '@narrify/react';
import type { NarrifyConfig } from '@narrify/react';

const narrifyConfig: Partial<NarrifyConfig> & { apiKey: string } = {
  apiKey: process.env.NEXT_PUBLIC_NARRIFY_KEY || 'YOUR_API_KEY',
  tours: [
    {
      id: 'demo',
      name: 'Next.js Demo Tour',
      pages: [
        {
          id: 'home',
          url: '/',
          title: 'Home',
          steps: [
            {
              id: 'step-1',
              title: 'Welcome',
              description: 'Main heading',
              selector: '#page-title',
              position: 'bottom',
              script: 'Welcome to this Next.js app powered by Narrify!',
              duration: 3000,
            },
            {
              id: 'step-2',
              title: 'Tour Trigger',
              description: 'The start button',
              selector: '#start-tour-btn',
              position: 'top',
              script: 'Click this button anytime to restart the tour.',
              duration: 3000,
            },
          ],
        },
      ],
    },
  ],
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NarrifyProvider config={narrifyConfig}>
      {children}
    </NarrifyProvider>
  );
}
