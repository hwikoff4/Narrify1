export default function ReactDocsPage() {
  return (
    <>
      <h1>React Integration</h1>
      <p>
        <code>@narrify/react</code> provides a first-class React wrapper with context, hooks, and
        components for seamless integration.
      </p>

      <h2>Installation</h2>
      <pre><code>{`npm install @narrify/react @narrify/sdk`}</code></pre>

      <h2>NarrifyProvider</h2>
      <p>
        Wrap your application (or a subtree) in <code>NarrifyProvider</code> to initialize the SDK
        and provide context to all child components.
      </p>
      <pre><code>{`import { NarrifyProvider } from '@narrify/react';

function App() {
  return (
    <NarrifyProvider
      config={{
        apiKey: 'YOUR_API_KEY',
        tours: [/* your tour definitions */],
        theme: { primary: '#10b981', background: 'rgba(0,0,0,0.6)', text: '#fff', accent: '#3b82f6' },
      }}
    >
      <YourApp />
    </NarrifyProvider>
  );
}`}</code></pre>

      <h2>useNarrify Hook</h2>
      <p>Access tour controls and state from any component inside the provider.</p>
      <pre><code>{`import { useNarrify } from '@narrify/react';

function TourButton() {
  const { startTour, stopTour, state, isReady } = useNarrify();

  if (!isReady) return null;

  return (
    <button onClick={() => state === 'playing' ? stopTour() : startTour()}>
      {state === 'playing' ? 'Stop Tour' : 'Start Tour'}
    </button>
  );
}`}</code></pre>

      <h3>Return Value</h3>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>engine</code></td><td><code>NarrifyEngine | null</code></td><td>Direct engine access</td></tr>
          <tr><td><code>state</code></td><td><code>TourState</code></td><td>Current tour state</td></tr>
          <tr><td><code>isReady</code></td><td><code>boolean</code></td><td>SDK initialized</td></tr>
          <tr><td><code>startTour</code></td><td><code>(tourId?) =&gt; void</code></td><td>Start a tour</td></tr>
          <tr><td><code>stopTour</code></td><td><code>() =&gt; void</code></td><td>Stop the tour</td></tr>
          <tr><td><code>nextStep</code></td><td><code>() =&gt; void</code></td><td>Next step</td></tr>
          <tr><td><code>previousStep</code></td><td><code>() =&gt; void</code></td><td>Previous step</td></tr>
          <tr><td><code>togglePlayPause</code></td><td><code>() =&gt; void</code></td><td>Toggle play/pause</td></tr>
          <tr><td><code>openConversation</code></td><td><code>() =&gt; void</code></td><td>Open AI chat</td></tr>
          <tr><td><code>closeConversation</code></td><td><code>() =&gt; void</code></td><td>Close AI chat</td></tr>
        </tbody>
      </table>

      <h2>useNarrifyConversation Hook</h2>
      <p>Convenience hook for controlling just the conversation UI.</p>
      <pre><code>{`import { useNarrifyConversation } from '@narrify/react';

function ChatButton() {
  const { toggle, isOpen } = useNarrifyConversation();

  return (
    <button onClick={toggle}>
      {isOpen ? 'Close Chat' : 'Ask AI'}
    </button>
  );
}`}</code></pre>

      <h2>NarrifyTour Component</h2>
      <p>
        A renderless component that auto-starts a tour when mounted.
        Useful for page-specific tours.
      </p>
      <pre><code>{`import { NarrifyTour } from '@narrify/react';

function OnboardingPage() {
  return (
    <>
      <NarrifyTour tourId="onboarding" autoStart />
      <div id="hero">Welcome!</div>
    </>
  );
}`}</code></pre>

      <table>
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>tourId</code></td><td><code>string</code></td><td>—</td><td>Tour ID to start</td></tr>
          <tr><td><code>autoStart</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Start on mount</td></tr>
        </tbody>
      </table>

      <h2>Next.js App Router</h2>
      <p>
        Since <code>NarrifyProvider</code> uses browser APIs, wrap it in a <code>'use client'</code> component:
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
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`}</code></pre>
    </>
  );
}
