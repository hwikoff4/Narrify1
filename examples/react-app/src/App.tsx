import { NarrifyProvider, useNarrify } from '@narrify/react';
import type { NarrifyConfig } from '@narrify/react';

const narrifyConfig: Partial<NarrifyConfig> & { apiKey: string } = {
  apiKey: 'YOUR_API_KEY',
  tours: [
    {
      id: 'demo',
      name: 'React Demo Tour',
      pages: [
        {
          id: 'home',
          url: '/',
          title: 'Home',
          steps: [
            {
              id: 'step-1',
              title: 'Welcome',
              description: 'The main heading',
              selector: '#app-title',
              position: 'bottom',
              script: 'Welcome to this React app! This is the main heading.',
              duration: 3000,
            },
            {
              id: 'step-2',
              title: 'Tour Button',
              description: 'The tour trigger button',
              selector: '#tour-button',
              position: 'top',
              script: 'You clicked this button to start the tour. You can click it again anytime!',
              duration: 3000,
            },
            {
              id: 'step-3',
              title: 'Feature List',
              description: 'App features',
              selector: '#features',
              position: 'top',
              script: 'Here are some features of the app. Each card explains a different capability.',
              duration: 4000,
            },
          ],
        },
      ],
    },
  ],
};

function TourButton() {
  const { startTour, stopTour, state } = useNarrify();

  return (
    <button
      id="tour-button"
      onClick={() => (state === 'playing' ? stopTour() : startTour('demo'))}
      style={{
        padding: '12px 24px',
        background: state === 'playing' ? '#ef4444' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {state === 'playing' ? 'Stop Tour' : 'Start Tour'}
    </button>
  );
}

export default function App() {
  return (
    <NarrifyProvider config={narrifyConfig}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui' }}>
        <h1 id="app-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Narrify React Example
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Click the button below to start an interactive tour.
        </p>

        <TourButton />

        <div id="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {['AI-Powered Tours', 'Voice Narration', 'React Hooks'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '1.5rem',
                background: '#f9fafb',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>{feature}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                A feature of the Narrify SDK.
              </p>
            </div>
          ))}
        </div>
      </div>
    </NarrifyProvider>
  );
}
