'use client';

import { useNarrify } from '@narrify/react';

export default function Home() {
  const { startTour, stopTour, state } = useNarrify();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'system-ui' }}>
      <h1 id="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Next.js + Narrify
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>
        This example shows how to integrate Narrify with a Next.js 14 App Router project.
        The provider is wrapped in a <code>'use client'</code> boundary for SSR compatibility.
      </p>

      <button
        id="start-tour-btn"
        onClick={() => (state === 'playing' ? stopTour() : startTour('demo'))}
        style={{
          padding: '12px 28px',
          background: state === 'playing' ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {state === 'playing' ? 'Stop Tour' : 'Start Tour'}
      </button>

      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>How it works</h2>
        <ul style={{ color: '#6b7280', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
          <li><code>app/providers.tsx</code> — Client component wrapping NarrifyProvider</li>
          <li><code>app/layout.tsx</code> — Server layout that includes the Providers</li>
          <li><code>app/page.tsx</code> — Client page using the useNarrify hook</li>
        </ul>
      </div>
    </main>
  );
}
