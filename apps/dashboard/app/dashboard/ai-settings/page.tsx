'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bot, MessageCircle } from 'lucide-react';

export default function AISettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    enabled: true,
    agentName: 'Narrify',
    agentPersonality: 'You are a helpful tour guide. Answer questions about what the user sees on screen. Be concise and friendly.',
    buttonPosition: 'bottom-right' as const,
    buttonLabel: 'Ask Narrify',
    showTranscript: true,
    textFallback: true,
    visionEnabled: true,
    includeDOM: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: client } = await supabase
      .from('clients')
      .select('config')
      .eq('auth_user_id', user?.id)
      .single();

    if (client?.config?.conversation) {
      const conv = client.config.conversation;
      setSettings({
        enabled: conv.enabled ?? true,
        agentName: conv.agentName || 'Narrify',
        agentPersonality: conv.agentPersonality || settings.agentPersonality,
        buttonPosition: conv.buttonPosition || 'bottom-right',
        buttonLabel: conv.buttonLabel || 'Ask Narrify',
        showTranscript: conv.showTranscript ?? true,
        textFallback: conv.textFallback ?? true,
        visionEnabled: conv.vision?.enabled ?? true,
        includeDOM: conv.vision?.includeDOM ?? false,
      });
    }
  }

  async function handleSave() {
    setLoading(true);
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: client } = await supabase
        .from('clients')
        .select('config')
        .eq('auth_user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('clients')
        .update({
          config: {
            ...client?.config,
            conversation: {
              enabled: settings.enabled,
              buttonPosition: settings.buttonPosition,
              buttonLabel: settings.buttonLabel,
              agentName: settings.agentName,
              agentPersonality: settings.agentPersonality,
              showTranscript: settings.showTranscript,
              textFallback: settings.textFallback,
              vision: {
                enabled: settings.visionEnabled,
                captureMode: 'viewport',
                includeDOM: settings.includeDOM,
                maxImageSize: 500,
              },
            },
          },
        })
        .eq('auth_user_id', user?.id);

      if (error) throw error;

      setMessage('AI settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-3">
            AI Settings
          </h1>
          <p className="text-xl text-secondary font-medium">
            Configure the vision-aware AI conversation system
          </p>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center shadow-lg flex-shrink-0">
                  <Bot className="w-7 h-7 text-bg-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-primary">
                    Enable AI Conversation
                  </h2>
                  <p className="text-sm sm:text-base text-secondary mt-1 font-medium">
                    Allow users to ask questions during tours
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) =>
                    setSettings({ ...settings, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-bg-elevated peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-bg-primary after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-teal shadow-sm"></div>
              </label>
            </div>
          </div>

          {/* Agent Configuration */}
          <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-8">
              Agent Configuration
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-base font-display font-bold text-primary mb-2">
                  Agent Name
                </label>
                <p className="text-sm text-secondary mb-4 font-medium">
                  The name users will see when interacting with the AI
                </p>
                <input
                  type="text"
                  value={settings.agentName}
                  onChange={(e) =>
                    setSettings({ ...settings, agentName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-primary font-medium shadow-sm bg-bg-tertiary"
                  placeholder="Narrify"
                />
              </div>

              <div>
                <label className="block text-base font-display font-bold text-primary mb-2">
                  Agent Personality (System Prompt)
                </label>
                <p className="text-sm text-secondary mb-4 font-medium">
                  Instructions for how the AI should behave and respond
                </p>
                <textarea
                  value={settings.agentPersonality}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      agentPersonality: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono text-sm text-primary shadow-sm bg-bg-tertiary"
                  placeholder="You are a helpful tour guide..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.buttonLabel}
                    onChange={(e) =>
                      setSettings({ ...settings, buttonLabel: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-primary font-medium shadow-sm bg-bg-tertiary"
                    placeholder="Ask Narrify"
                  />
                </div>

                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Button Position
                  </label>
                  <select
                    value={settings.buttonPosition}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        buttonPosition: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-primary font-medium shadow-sm bg-bg-tertiary"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Settings */}
          <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-8">
              Vision-Aware AI
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 bg-accent/10 border-2 border-accent/30 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-lg font-display font-bold text-primary">
                    Enable Vision Capture
                  </h3>
                  <p className="text-sm text-secondary mt-1 font-medium">
                    AI can see what's on the user's screen
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.visionEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        visionEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-bg-elevated peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-bg-primary after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-teal shadow-sm"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 bg-bg-tertiary border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-lg font-display font-bold text-primary">
                    Include DOM Structure
                  </h3>
                  <p className="text-sm text-secondary mt-1 font-medium">
                    Send HTML structure along with screenshot
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.includeDOM}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        includeDOM: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-bg-elevated peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-bg-primary after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-teal shadow-sm"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 bg-bg-tertiary border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-lg font-display font-bold text-primary">
                    Show Conversation Transcript
                  </h3>
                  <p className="text-sm text-secondary mt-1 font-medium">
                    Display text of questions and answers
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showTranscript}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showTranscript: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-bg-elevated peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-bg-primary after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-teal shadow-sm"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 p-5 sm:p-6 bg-bg-tertiary border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-lg font-display font-bold text-primary">
                    Text Input Fallback
                  </h3>
                  <p className="text-sm text-secondary mt-1 font-medium">
                    Allow typing when microphone unavailable
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.textFallback}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        textFallback: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-bg-elevated peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-bg-primary after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-teal shadow-sm"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Cost Info */}
          <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 sm:p-8 shadow-glass animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-teal flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-bg-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-4">
                  Vision-Aware AI Costs
                </h3>
                <div className="text-base text-secondary space-y-2 font-medium">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Screenshot capture: <span className="font-bold text-success">Free</span> (browser-based)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Claude Vision API: <span className="font-bold">~$0.01</span> per question
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    ElevenLabs TTS: <span className="font-bold">~$0.03</span> per response
                  </p>
                  <div className="mt-4 pt-4 border-t-2 border-accent/30">
                    <p className="text-lg font-display font-bold text-primary">
                      Total: ~$0.04 per Q&A
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-gradient-teal text-bg-primary rounded-xl hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 font-bold hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {message && (
            <div
              className={`px-6 py-4 rounded-xl shadow-glass animate-fade-down ${
                message.includes('success')
                  ? 'bg-success-bg text-success border-2 border-success/50'
                  : 'bg-error-bg text-error border-2 border-error/50'
              }`}
            >
              <span className="font-bold">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
