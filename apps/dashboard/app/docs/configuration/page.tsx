export default function ConfigurationPage() {
  return (
    <>
      <h1>Configuration</h1>
      <p>
        Full reference for the <code>NarrifyConfig</code> object passed to <code>Narrify.init()</code>.
      </p>

      <h2>Required</h2>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>apiKey</code></td><td><code>string</code></td><td>Your Narrify API key</td></tr>
        </tbody>
      </table>

      <h2>Theme</h2>
      <pre><code>{`theme: {
  primary: '#10b981',    // Spotlight border color
  background: 'rgba(0,0,0,0.6)', // Overlay background
  text: '#ffffff',       // Caption text
  accent: '#3b82f6',     // Buttons, highlights
}`}</code></pre>

      <h2>Language & Speech</h2>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>language</code></td><td><code>string</code></td><td><code>'en'</code></td><td>BCP-47 language code</td></tr>
          <tr><td><code>speechSpeed</code></td><td><code>0.75 | 1.0 | 1.25 | 1.5 | 2.0</code></td><td><code>1.0</code></td><td>Voice narration speed</td></tr>
          <tr><td><code>allowSpeedControl</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show speed control UI</td></tr>
        </tbody>
      </table>

      <h2>Captions</h2>
      <pre><code>{`captions: {
  enabled: true,
  position: 'bottom',  // 'top' | 'bottom' | 'floating'
  fontSize: 'md',      // 'sm' | 'md' | 'lg'
}`}</code></pre>

      <h2>Behavior</h2>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>autoStart</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Auto-start the first tour</td></tr>
          <tr><td><code>triggerButton</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the trigger button</td></tr>
          <tr><td><code>triggerSelector</code></td><td><code>string</code></td><td>—</td><td>Custom element selector for trigger</td></tr>
          <tr><td><code>startMode</code></td><td><code>'full-tour' | 'current-page' | 'hover-explore'</code></td><td><code>'full-tour'</code></td><td>How the tour begins</td></tr>
        </tbody>
      </table>

      <h2>Conversation (AI Chat)</h2>
      <pre><code>{`conversation: {
  enabled: true,
  buttonPosition: 'bottom-right', // 'bottom-left' | 'top-right' | 'top-left' | 'inline'
  buttonLabel: 'Ask Narrify',
  agentName: 'Narrify',
  agentPersonality: 'You are a helpful tour guide.',
  showTranscript: true,
  textFallback: true,
  vision: {
    enabled: true,
    captureMode: 'viewport',
    includeDOM: false,
    maxImageSize: 500, // KB
  }
}`}</code></pre>

      <h2>Hover Exploration</h2>
      <pre><code>{`hoverExplore: {
  enabled: false,
  markedElementsOnly: true,
  markerAttribute: 'data-narrify-explain',
  triggerDelay: 500,
  speakOnHover: false,
}`}</code></pre>

      <h2>Progress Bar</h2>
      <pre><code>{`progressBar: {
  visible: true,
  clickToSeek: true,
  position: 'bottom', // 'top' | 'bottom'
}`}</code></pre>

      <h2>Keyboard Shortcuts</h2>
      <pre><code>{`keyboard: {
  enabled: true,
  playPause: 'Space',
  next: 'ArrowRight',
  previous: 'ArrowLeft',
  replay: 'KeyR',
  exit: 'Escape',
  conversation: 'KeyC',
}`}</code></pre>

      <h2>Exit Behavior</h2>
      <pre><code>{`exit: {
  confirmationDialog: true,
  confirmationTitle: 'Exit Tour?',
  confirmationMessage: 'Are you sure you want to exit the tour?',
}`}</code></pre>

      <h2>Vision Navigation</h2>
      <pre><code>{`visionNavigation: {
  enabled: true,
  fallbackToSelector: true,
  logResults: true,
}`}</code></pre>

      <h2>Tours</h2>
      <p>Define tours inline or load them from the dashboard API.</p>
      <pre><code>{`tours: [{
  id: 'onboarding',
  name: 'Onboarding Tour',
  pages: [{
    id: 'page-1',
    url: '/',
    title: 'Home',
    steps: [{
      id: 'step-1',
      title: 'Welcome',
      description: 'Welcome to our app',
      selector: '#hero',
      position: 'bottom',
      script: 'Welcome! This is the main hero section.',
      duration: 3000,
    }]
  }]
}]`}</code></pre>
    </>
  );
}
