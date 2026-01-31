'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink, PlayCircle, Key } from 'lucide-react';
import Link from 'next/link';

export default function EmbedPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'html' | 'wordpress' | 'shopify' | 'wix' | 'squarespace' | 'ai-coded'>('html');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadActiveKey();
  }, []);

  async function loadActiveKey() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { data: keys } = await supabase
        .from('api_keys')
        .select('key, active')
        .eq('client_id', client?.id)
        .eq('active', true)
        .limit(1);

      if (keys && keys.length > 0) {
        setActiveKey(keys[0].key);
      }
    } catch (err) {
      console.error('Failed to load API key:', err);
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    const code = getCodeForPlatform();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function getCodeForPlatform() {
    const baseCode = `<script src="https://cdn.narrify.io/narrify.umd.js"></script>
<script>
  Narrify.init({
    apiKey: '${activeKey || 'YOUR_API_KEY'}',
    autoStart: true
  });
</script>`;

    return baseCode;
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-secondary font-medium">Loading embed code...</p>
          </div>
        </div>
      </div>
    );
  }

  const platforms = [
    { id: 'html' as const, name: 'Website / HTML', icon: '🌐' },
    { id: 'wordpress' as const, name: 'WordPress', icon: '📝' },
    { id: 'shopify' as const, name: 'Shopify', icon: '🛒' },
    { id: 'ai-coded' as const, name: 'AI-Coded', icon: '🤖' },
    { id: 'wix' as const, name: 'Wix', icon: '🎨' },
    { id: 'squarespace' as const, name: 'Squarespace', icon: '⬛' },
  ];

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-4">
            Add Narrify to Your Website
          </h1>
          <p className="text-xl text-secondary font-medium">
            It's as easy as 1-2-3! No coding skills needed.
          </p>
        </div>

        {!activeKey && (
          <div className="bg-warning-bg border-2 border-warning/50 rounded-2xl p-6 sm:p-8 mb-8 shadow-glass animate-fade-down">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-warning" />
              </div>
              <p className="text-warning text-lg font-bold">
                You need an API key first!{' '}
                <Link href="/dashboard/api-keys" className="underline hover:text-warning/80 transition-colors">
                  Click here to get one
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Platform Selector */}
        <div className="bg-bg-secondary backdrop-blur-sm rounded-3xl border border-border shadow-glass p-6 sm:p-8 mb-6 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-6 text-center">
            Choose Your Website Platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`group p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 ${
                  selectedPlatform === platform.id
                    ? 'border-accent bg-accent/10 shadow-lg scale-105'
                    : 'border-border hover:border-accent/50 hover:bg-bg-tertiary hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{platform.icon}</div>
                <div className={`text-sm font-bold ${selectedPlatform === platform.id ? 'text-accent' : 'text-primary'}`}>{platform.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-bg-secondary backdrop-blur-sm rounded-3xl border border-border shadow-glass p-8 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {selectedPlatform === 'html' && (
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center text-2xl font-display font-bold shadow-lg text-bg-primary">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3">
                    Copy This Code
                  </h3>
                  <p className="text-secondary mb-6 text-lg font-medium">
                    Click the big button below to copy your unique code
                  </p>
                  <button
                    onClick={copyCode}
                    className="w-full px-8 py-5 bg-gradient-teal text-bg-primary rounded-2xl hover:shadow-glow-lg transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-6 h-6" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-6 h-6" />
                        <span>Copy Installation Code</span>
                      </>
                    )}
                  </button>

                  {/* Show code preview */}
                  <details className="mt-6">
                    <summary className="text-sm text-accent cursor-pointer hover:text-accent/80 font-bold flex items-center gap-2">
                      <span>Want to see the code first?</span>
                    </summary>
                    <pre className="mt-4 bg-bg-tertiary text-primary p-6 rounded-2xl overflow-x-auto text-sm shadow-xl border border-border">
                      <code className="text-primary font-mono">{getCodeForPlatform()}</code>
                    </pre>
                  </details>
                </div>
              </div>

              <div className="border-t-2 border-border"></div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center text-2xl font-display font-bold shadow-lg text-bg-primary">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3">
                    Paste It Into Your Website
                  </h3>
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm">
                    <p className="text-primary mb-4 text-lg font-bold">
                      Find this in your website code:
                    </p>
                    <code className="block bg-bg-tertiary px-6 py-4 rounded-xl text-lg font-mono text-primary border-2 border shadow-sm font-bold">
                      &lt;/body&gt;
                    </code>
                    <p className="text-primary mt-6 text-lg font-bold">
                      Paste your code RIGHT BEFORE it <span className="text-secondary font-medium">(above that line)</span>
                    </p>
                  </div>

                  <div className="mt-6 bg-warning-bg border-2 border-warning/50 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-warning font-bold flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <span>Pro Tip:</span>
                    </p>
                    <p className="text-sm text-warning mt-2 font-medium">
                      The <code className="bg-bg-tertiary px-2 py-1 rounded font-bold text-warning">&lt;/body&gt;</code> tag is usually near the bottom of your HTML file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-border"></div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center text-2xl font-display font-bold shadow-lg text-bg-primary">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-3">
                    You're Done!
                  </h3>
                  <p className="text-secondary mb-6 text-lg font-medium">
                    That's it! Your tours will now appear automatically on your website.
                  </p>
                  <div className="bg-success-bg border-2 border-success/50 rounded-2xl p-6 shadow-sm">
                    <p className="text-success font-bold mb-3 text-lg flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <span>Narrify is installed and ready to go!</span>
                    </p>
                    <p className="text-success font-medium">
                      Visit your website to see your tours in action. Make sure you've created at least one tour in the{' '}
                      <Link href="/dashboard/tours" className="underline font-bold hover:text-success/80 transition-colors">
                        Tours section
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === 'wordpress' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">📝</div>
                <h3 className="text-3xl font-display font-bold text-primary">WordPress Instructions</h3>
                <p className="text-secondary mt-2 font-medium">Follow these simple steps to add Narrify to your WordPress site</p>
              </div>

              <div className="space-y-5 text-left">
                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 1:</p>
                  <p className="text-secondary font-medium">Log in to your WordPress admin panel</p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 2:</p>
                  <p className="text-secondary font-medium">Go to <strong className="text-primary">Appearance → Theme File Editor</strong></p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 3:</p>
                  <p className="text-secondary font-medium">Find <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">footer.php</code> in the right sidebar</p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 4:</p>
                  <p className="text-secondary font-medium mb-4">Look for <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">&lt;/body&gt;</code> near the bottom</p>
                  <button
                    onClick={copyCode}
                    className="w-full px-6 py-4 bg-gradient-teal text-bg-primary rounded-xl hover:shadow-glow-lg transition-all duration-300 font-bold flex items-center justify-center gap-3 hover:scale-[1.02]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Code to Paste</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 5:</p>
                  <p className="text-secondary font-medium">Paste the code RIGHT BEFORE <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">&lt;/body&gt;</code></p>
                </div>

                <div className="bg-success-bg border-2 border-success/50 rounded-2xl p-6 shadow-md">
                  <p className="text-success font-display font-bold mb-2 text-lg flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span>Step 6: Save!</span>
                  </p>
                  <p className="text-success font-medium">Click "Update File" and you're done!</p>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === 'shopify' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">🛒</div>
                <h3 className="text-3xl font-display font-bold text-primary">Shopify Instructions</h3>
                <p className="text-secondary mt-2 font-medium">Add Narrify to your Shopify store in minutes</p>
              </div>

              <div className="space-y-5 text-left">
                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 1:</p>
                  <p className="text-secondary font-medium">From your Shopify admin, go to <strong className="text-primary">Online Store → Themes</strong></p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 2:</p>
                  <p className="text-secondary font-medium">Click <strong className="text-primary">Actions → Edit code</strong></p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 3:</p>
                  <p className="text-secondary font-medium">In the left sidebar, find and click <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">theme.liquid</code></p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 4:</p>
                  <p className="text-secondary font-medium mb-4">Scroll to the bottom and find <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">&lt;/body&gt;</code></p>
                  <button
                    onClick={copyCode}
                    className="w-full px-6 py-4 bg-gradient-teal text-bg-primary rounded-xl hover:shadow-glow-lg transition-all duration-300 font-bold flex items-center justify-center gap-3 hover:scale-[1.02]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Code to Paste</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-2 text-lg">Step 5:</p>
                  <p className="text-secondary font-medium">Paste the code RIGHT BEFORE <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">&lt;/body&gt;</code></p>
                </div>

                <div className="bg-success-bg border-2 border-success/50 rounded-2xl p-6 shadow-md">
                  <p className="text-success font-display font-bold mb-2 text-lg flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span>Step 6: Save!</span>
                  </p>
                  <p className="text-success font-medium">Click the green "Save" button at the top right. Done!</p>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === 'ai-coded' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">🤖</div>
                <h3 className="text-3xl font-display font-bold text-primary">AI-Coded Website Instructions</h3>
                <p className="text-secondary mt-2 font-medium text-lg">For websites built and hosted on AI platforms like Bolt, Lovable, or V0</p>
              </div>

              <div className="space-y-5 text-left">
                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 1: Copy Your Code</p>
                  <p className="text-secondary font-medium mb-4">Click the button below to copy your Narrify installation code</p>
                  <button
                    onClick={copyCode}
                    className="w-full px-6 py-4 bg-gradient-teal text-bg-primary rounded-xl hover:shadow-glow-lg transition-all duration-300 font-bold flex items-center justify-center gap-3 hover:scale-[1.02]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Installation Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 2: Find Your HTML File</p>
                  <div className="text-secondary font-medium space-y-3">
                    <p>Your HTML file is typically found as <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">index.html</code> in your files.</p>
                    <p>It may also be located in a <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">public/</code> folder - look for your main HTML file there.</p>
                  </div>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 3: Locate the Closing Body Tag</p>
                  <p className="text-secondary font-medium mb-4">Scroll to the bottom of your HTML file and find this line:</p>
                  <code className="block bg-bg-tertiary px-6 py-4 rounded-xl text-lg font-mono text-primary border-2 border shadow-sm font-bold">
                    &lt;/body&gt;
                  </code>
                  <div className="mt-4 bg-warning-bg border border-warning/50 rounded-xl p-4">
                    <p className="text-sm text-warning font-bold flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span>Pro Tip:</span>
                    </p>
                    <p className="text-sm text-warning mt-1 font-medium">
                      Use <code className="bg-bg-tertiary px-2 py-1 rounded font-bold text-warning">Ctrl+F</code> (or <code className="bg-bg-tertiary px-2 py-1 rounded font-bold text-warning">Cmd+F</code> on Mac) to search for "&lt;/body&gt;"
                    </p>
                  </div>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 4: Paste the Code</p>
                  <p className="text-secondary font-medium mb-4">
                    Paste your copied code <strong className="text-primary">RIGHT BEFORE</strong> the <code className="bg-bg-tertiary px-3 py-1.5 rounded-lg font-bold text-primary border border">&lt;/body&gt;</code> tag
                  </p>
                  <div className="bg-bg-tertiary border-2 border-border rounded-2xl p-6 shadow-xl">
                    <p className="text-sm text-secondary mb-3 font-bold">It should look like this:</p>
                    <pre className="text-xs font-mono text-primary overflow-x-auto">
{`  <script src="https://cdn.narrify.io/narrify.umd.js"></script>
  <script>
    Narrify.init({
      apiKey: 'YOUR_API_KEY',
      autoStart: true
    });
  </script>
</body>`}
                    </pre>
                  </div>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-display font-bold text-primary mb-3 text-lg">Step 5: Deploy Your Changes</p>
                  <div className="text-secondary font-medium space-y-3">
                    <p>Save your HTML file and deploy your website using your platform's deploy or run button.</p>
                    <p>Most AI-coded platforms will automatically deploy your changes after you save the file.</p>
                  </div>
                </div>

                <div className="bg-success-bg border-2 border-success/50 rounded-2xl p-6 shadow-md">
                  <p className="text-success font-display font-bold mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span>You're All Set!</span>
                  </p>
                  <p className="text-success font-medium">
                    Visit your live website to see Narrify in action. Make sure you've created at least one tour in the{' '}
                    <Link href="/dashboard/tours" className="underline font-bold hover:text-success/80 transition-colors">
                      Tours section
                    </Link>.
                  </p>
                </div>

                <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 shadow-sm">
                  <p className="font-display font-bold text-primary mb-4 text-lg flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <span>Quick Troubleshooting</span>
                  </p>
                  <ul className="text-secondary font-medium space-y-2.5 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>Make sure the code is pasted BEFORE the <code className="bg-bg-tertiary px-2 py-1 rounded font-bold text-primary border border">&lt;/body&gt;</code> tag, not after</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>Check that your API key is correct (no extra spaces)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>Clear your browser cache and refresh if tours don't appear</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>Make sure you've created and published at least one tour</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {(selectedPlatform === 'wix' || selectedPlatform === 'squarespace') && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">{selectedPlatform === 'wix' ? '🎨' : '⬛'}</div>
              <h3 className="text-3xl font-display font-bold text-primary mb-6">
                {selectedPlatform === 'wix' ? 'Wix' : 'Squarespace'} Instructions
              </h3>
              <div className="bg-warning-bg border-2 border-warning/50 rounded-2xl p-8 max-w-2xl mx-auto mb-8 shadow-sm">
                <p className="text-warning font-bold text-lg mb-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">🚧</span>
                  <span>Coming Soon</span>
                </p>
                <p className="text-warning font-medium">
                  We're working on detailed instructions for {selectedPlatform === 'wix' ? 'Wix' : 'Squarespace'}. For now, please contact our support team for personalized help.
                </p>
              </div>
              <a
                href="mailto:support@narrify.io"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-teal text-bg-primary rounded-2xl hover:shadow-glow-lg transition-all duration-300 font-bold text-lg hover:scale-[1.02]"
              >
                <span>Contact Support</span>
              </a>
            </div>
          )}
        </div>

        {/* Video Tutorial */}
        <div className="bg-gradient-teal rounded-3xl shadow-glass p-8 sm:p-10 mb-6 text-bg-primary text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-bg-primary" />
          </div>
          <h3 className="text-3xl font-display font-bold mb-4">Watch Video Tutorial</h3>
          <p className="text-bg-primary/90 mb-6 text-lg font-medium max-w-2xl mx-auto">
            Prefer to watch? We'll walk you through it step-by-step in an easy-to-follow video guide.
          </p>
          <button
            disabled
            className="px-8 py-4 bg-bg-primary/20 backdrop-blur-sm text-bg-primary rounded-xl font-bold cursor-not-allowed border-2 border-bg-primary/30 text-lg"
          >
            Coming Soon
          </button>
        </div>

        {/* Advanced Section (Collapsed by Default) */}
        <div className="bg-bg-secondary backdrop-blur-sm rounded-3xl border border-border shadow-glass p-6 sm:p-8 mb-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center text-3xl shadow-lg">
                ⚙️
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-primary group-hover:text-accent transition-colors">Advanced Options</h3>
                <p className="text-sm text-secondary font-medium">For developers who want to customize</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-bg-tertiary group-hover:bg-accent/10 flex items-center justify-center transition-colors">
              {showAdvanced ? (
                <ChevronDown className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
              ) : (
                <ChevronRight className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
              )}
            </div>
          </button>

          {showAdvanced && (
            <div className="mt-8 space-y-4 border-t-2 border-border pt-8 animate-fade-down">
              <p className="text-secondary font-medium leading-relaxed">
                For developers: Visit our{' '}
                <a
                  href="https://docs.narrify.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  full documentation
                  <ExternalLink className="w-4 h-4" />
                </a>{' '}
                for NPM packages, React integration, and advanced configuration options.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-3xl p-8 sm:p-10 text-center shadow-glass animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-teal flex items-center justify-center text-4xl shadow-lg">
            ❓
          </div>
          <h3 className="font-display font-bold text-primary mb-4 text-2xl">Need Help?</h3>
          <p className="text-secondary mb-8 text-lg font-medium max-w-xl mx-auto">
            We're here to help you get set up! Our support team is ready to assist you.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="mailto:support@narrify.io"
              className="px-8 py-4 bg-gradient-teal text-bg-primary rounded-2xl hover:shadow-glow-lg transition-all duration-300 font-bold text-lg hover:scale-[1.02]"
            >
              Email Support
            </a>
            <Link
              href="/dashboard/tours"
              className="px-8 py-4 bg-bg-secondary border-2 border text-secondary rounded-2xl hover:bg-bg-tertiary hover:border-accent/50 hover:text-accent transition-all duration-300 font-bold text-lg hover:scale-[1.02]"
            >
              Create Your First Tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
