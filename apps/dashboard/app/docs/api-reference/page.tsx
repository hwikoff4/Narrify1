export default function APIReferencePage() {
  return (
    <>
      <h1>API Reference</h1>

      <h2>Narrify (Static Class)</h2>
      <p>The main entry point for script-tag and ESM usage.</p>

      <h3><code>Narrify.init(config)</code></h3>
      <p>Initialize the SDK. Returns a <code>NarrifyEngine</code> instance.</p>
      <pre><code>{`const engine = Narrify.init({
  apiKey: 'YOUR_API_KEY',
  tours: [/* ... */],
});`}</code></pre>
      <table>
        <thead>
          <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>config</code></td><td><code>NarrifyConfig & {'{ apiKey: string }'}</code></td><td>Full configuration object</td></tr>
        </tbody>
      </table>
      <p>Returns: <code>NarrifyEngine</code></p>

      <h3><code>Narrify.getInstance()</code></h3>
      <p>Get the current engine instance, or <code>null</code> if not initialized.</p>

      <h3><code>Narrify.destroy()</code></h3>
      <p>Destroy the current instance and clean up all DOM elements.</p>

      <h3><code>Narrify.version</code></h3>
      <p>The SDK version string.</p>

      <hr />

      <h2>NarrifyEngine</h2>
      <p>Returned by <code>Narrify.init()</code>. Controls tour playback and UI.</p>

      <h3>Tour Control</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>start(tourId?: string)</code></td><td>Start a tour. If no <code>tourId</code>, starts the first tour.</td></tr>
          <tr><td><code>stop()</code></td><td>Stop the current tour (shows confirmation if configured).</td></tr>
          <tr><td><code>nextStep()</code></td><td>Advance to the next step.</td></tr>
          <tr><td><code>previousStep()</code></td><td>Go back to the previous step.</td></tr>
          <tr><td><code>restart()</code></td><td>Restart the tour from the beginning.</td></tr>
          <tr><td><code>togglePlayPause()</code></td><td>Toggle between playing and paused states.</td></tr>
          <tr><td><code>pause()</code></td><td>Pause the tour.</td></tr>
          <tr><td><code>resume()</code></td><td>Resume a paused tour.</td></tr>
        </tbody>
      </table>

      <h3>Conversation</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>openConversation()</code></td><td>Open the AI conversation panel.</td></tr>
          <tr><td><code>closeConversation()</code></td><td>Close the AI conversation panel.</td></tr>
        </tbody>
      </table>

      <h3>State</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Returns</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>getState()</code></td><td><code>TourState</code></td><td>Current state: <code>'idle' | 'playing' | 'paused' | 'conversation' | 'hover-explore'</code></td></tr>
          <tr><td><code>getConfig()</code></td><td><code>NarrifyEngineOptions</code></td><td>Current resolved configuration.</td></tr>
        </tbody>
      </table>

      <h3>Lifecycle</h3>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>destroy()</code></td><td>Destroy the engine and remove all DOM elements.</td></tr>
        </tbody>
      </table>

      <hr />

      <h2>Types</h2>

      <h3><code>TourState</code></h3>
      <pre><code>{`type TourState = 'idle' | 'playing' | 'paused' | 'conversation' | 'hover-explore';`}</code></pre>

      <h3><code>TourDefinition</code></h3>
      <pre><code>{`interface TourDefinition {
  id: string;
  name: string;
  description?: string;
  pages: PageDefinition[];
  metadata?: Record<string, any>;
}`}</code></pre>

      <h3><code>TourStep</code></h3>
      <pre><code>{`interface TourStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  script: string;
  waitFor?: string;
  action?: StepAction;
  duration?: number;
}`}</code></pre>

      <h3><code>StepAction</code></h3>
      <pre><code>{`interface StepAction {
  type: 'click' | 'scroll' | 'hover' | 'wait';
  selector?: string;
  delay?: number;
}`}</code></pre>
    </>
  );
}
