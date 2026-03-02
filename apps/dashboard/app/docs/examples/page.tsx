export default function ExamplesPage() {
  return (
    <>
      <h1>Examples</h1>
      <p>
        Working examples you can clone and run locally. Each example is self-contained with its own
        README and instructions.
      </p>

      <h2>HTML (No Build Step)</h2>
      <p>
        The simplest integration — a single HTML file that loads Narrify via a script tag.
      </p>
      <pre><code>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Narrify Demo</title>
</head>
<body>
  <div id="hero">
    <h1>Welcome to My App</h1>
    <p>This is a demo of Narrify tours.</p>
  </div>

  <nav id="main-nav">
    <a href="#">Home</a>
    <a href="#">Features</a>
    <a href="#">Pricing</a>
  </nav>

  <button id="start-tour">Start Tour</button>

  <script src="https://cdn.jsdelivr.net/npm/@narrify/sdk@latest/dist/narrify.umd.full.js"></script>
  <script>
    const engine = Narrify.init({
      apiKey: 'YOUR_API_KEY',
      tours: [{
        id: 'demo',
        name: 'Demo Tour',
        pages: [{
          id: 'home',
          url: '/',
          title: 'Home',
          steps: [
            {
              id: 'step-1',
              title: 'Hero Section',
              description: 'The main hero area',
              selector: '#hero',
              position: 'bottom',
              script: 'Welcome! This is the hero section of the page.',
              duration: 3000,
            },
            {
              id: 'step-2',
              title: 'Navigation',
              description: 'The main navigation',
              selector: '#main-nav',
              position: 'bottom',
              script: 'Here is the navigation bar. You can explore different sections.',
              duration: 3000,
            }
          ]
        }]
      }]
    });

    document.getElementById('start-tour').addEventListener('click', () => {
      engine.start('demo');
    });
  </script>
</body>
</html>`}</code></pre>
      <p>
        <a href="https://github.com/narrify/narrify/tree/main/examples/html-basic" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </p>

      <hr />

      <h2>React + Vite</h2>
      <p>
        A React app using <code>@narrify/react</code> with hooks and the Provider pattern.
      </p>
      <pre><code>{`// src/App.tsx
import { NarrifyProvider, useNarrify } from '@narrify/react';

const config = {
  apiKey: 'YOUR_API_KEY',
  tours: [/* ... */],
};

function TourButton() {
  const { startTour, state } = useNarrify();
  return (
    <button onClick={() => startTour('demo')}>
      {state === 'playing' ? 'Tour Running...' : 'Start Tour'}
    </button>
  );
}

export default function App() {
  return (
    <NarrifyProvider config={config}>
      <h1>My React App</h1>
      <TourButton />
    </NarrifyProvider>
  );
}`}</code></pre>
      <p>
        <a href="https://github.com/narrify/narrify/tree/main/examples/react-app" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </p>

      <hr />

      <h2>Next.js (App Router)</h2>
      <p>
        Integration with Next.js 14 using the App Router. Note the <code>'use client'</code>
        boundary for the provider.
      </p>
      <pre><code>{`// app/providers.tsx
'use client';
import { NarrifyProvider } from '@narrify/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NarrifyProvider config={{ apiKey: process.env.NEXT_PUBLIC_NARRIFY_KEY! }}>
      {children}
    </NarrifyProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';
import { useNarrify } from '@narrify/react';

export default function Home() {
  const { startTour } = useNarrify();
  return (
    <main>
      <h1>Next.js + Narrify</h1>
      <button onClick={() => startTour()}>Start Tour</button>
    </main>
  );
}`}</code></pre>
      <p>
        <a href="https://github.com/narrify/narrify/tree/main/examples/nextjs" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </p>
    </>
  );
}
