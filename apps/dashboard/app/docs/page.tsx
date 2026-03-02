export default function DocsPage() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Narrify is an AI-powered interactive tour SDK that adds voice-narrated, vision-aware
        guided tours to any website. Get up and running in under 2 minutes.
      </p>

      <h2>Quick Start (Script Tag)</h2>
      <p>The fastest way to add Narrify to any website — no build step required.</p>
      <pre><code>{`<script src="https://cdn.jsdelivr.net/npm/@narrify/sdk@latest/dist/narrify.umd.full.js"></script>
<script>
  Narrify.init({
    apiKey: 'YOUR_API_KEY',
    autoStart: true
  });
</script>`}</code></pre>
      <p>
        Paste this before the closing <code>&lt;/body&gt;</code> tag in your HTML. That's it!
      </p>

      <h2>Install via npm</h2>
      <p>For projects using a bundler (Vite, webpack, Next.js, etc.):</p>
      <pre><code>{`npm install @narrify/sdk html2canvas`}</code></pre>
      <p>Then initialize in your app:</p>
      <pre><code>{`import Narrify from '@narrify/sdk';

const engine = Narrify.init({
  apiKey: 'YOUR_API_KEY',
  tours: [{
    id: 'welcome',
    name: 'Welcome Tour',
    pages: [{
      id: 'home',
      url: '/',
      title: 'Home',
      steps: [{
        id: 'step-1',
        title: 'Welcome',
        description: 'Let me show you around',
        selector: '#hero',
        position: 'bottom',
        script: 'Welcome! Let me give you a quick tour of our app.',
      }]
    }]
  }]
});

// Start the tour
engine.start('welcome');`}</code></pre>

      <h2>React</h2>
      <p>
        Using React? Install the dedicated wrapper for hooks and context support:
      </p>
      <pre><code>{`npm install @narrify/react @narrify/sdk`}</code></pre>
      <pre><code>{`import { NarrifyProvider, useNarrify } from '@narrify/react';

function App() {
  return (
    <NarrifyProvider config={{ apiKey: 'YOUR_API_KEY' }}>
      <MyApp />
    </NarrifyProvider>
  );
}`}</code></pre>
      <p>
        See the <a href="/docs/react">React guide</a> for full details.
      </p>

      <h2>Get Your API Key</h2>
      <p>
        You need an API key to use Narrify. Sign up and create one in the{' '}
        <a href="/dashboard/api-keys">Dashboard</a>.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/configuration">Configuration</a> — customize theme, language, captions, and more</li>
        <li><a href="/docs/api-reference">API Reference</a> — full list of methods and events</li>
        <li><a href="/docs/react">React Integration</a> — hooks, Provider, and SSR setup</li>
        <li><a href="/docs/examples">Examples</a> — working demos for HTML, React, and Next.js</li>
      </ul>
    </>
  );
}
