'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye } from 'lucide-react';

export default function ThemePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [theme, setTheme] = useState({
    primary: '#10b981',
    background: 'rgba(0, 0, 0, 0.6)',
    text: '#ffffff',
    accent: '#3b82f6',
    // Spotlight/Highlight Settings
    highlightStyle: 'glow', // glow, solid, outline, shadow, none
    highlightBorderWidth: 4,
    highlightGlowIntensity: 40,
    highlightAnimation: 'pulse', // pulse, none
    // Overlay/Backdrop Settings
    overlayDarkenAmount: 60, // 0-100%
    overlayBlurAmount: 0, // 0-20px
    overlayUseBlur: false,
    overlayUseDarken: true,
  });

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: client } = await supabase
      .from('clients')
      .select('config')
      .eq('auth_user_id', user?.id)
      .single();

    if (client?.config?.theme) {
      // Merge saved theme with defaults to ensure new properties exist
      setTheme({
        primary: '#10b981',
        background: 'rgba(0, 0, 0, 0.6)',
        text: '#ffffff',
        accent: '#3b82f6',
        highlightStyle: 'glow',
        highlightBorderWidth: 4,
        highlightGlowIntensity: 40,
        highlightAnimation: 'pulse',
        overlayDarkenAmount: 60,
        overlayBlurAmount: 0,
        overlayUseBlur: false,
        overlayUseDarken: true,
        ...client.config.theme, // Override with saved values
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
            theme,
          },
        })
        .eq('auth_user_id', user?.id);

      if (error) throw error;

      setMessage('Theme saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to save theme');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-3">
            Theme Customization
          </h1>
          <p className="text-xl text-secondary font-medium">
            Customize colors and appearance of your tours
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Settings */}
          <div className="space-y-6">
            <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-8">
                Color Palette
              </h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Primary Color
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Used for spotlight borders and highlights
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) =>
                        setTheme({ ...theme, primary: e.target.value })
                      }
                      className="w-24 h-14 rounded-xl border-2 border cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    />
                    <input
                      type="text"
                      value={theme.primary}
                      onChange={(e) =>
                        setTheme({ ...theme, primary: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border-2 border rounded-xl font-mono text-sm font-bold text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-bg-tertiary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Background Overlay
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Semi-transparent overlay behind the tour
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-14 rounded-xl border-2 border shadow-sm"
                      style={{ background: theme.background }}
                    />
                    <input
                      type="text"
                      value={theme.background}
                      onChange={(e) =>
                        setTheme({ ...theme, background: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border-2 border rounded-xl font-mono text-sm font-bold text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-bg-tertiary"
                      placeholder="rgba(0, 0, 0, 0.6)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Text Color
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Caption and UI text color
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={theme.text}
                      onChange={(e) =>
                        setTheme({ ...theme, text: e.target.value })
                      }
                      className="w-24 h-14 rounded-xl border-2 border cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    />
                    <input
                      type="text"
                      value={theme.text}
                      onChange={(e) =>
                        setTheme({ ...theme, text: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border-2 border rounded-xl font-mono text-sm font-bold text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-bg-tertiary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Accent Color
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Buttons and interactive elements
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={(e) =>
                        setTheme({ ...theme, accent: e.target.value })
                      }
                      className="w-24 h-14 rounded-xl border-2 border cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    />
                    <input
                      type="text"
                      value={theme.accent}
                      onChange={(e) =>
                        setTheme({ ...theme, accent: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border-2 border rounded-xl font-mono text-sm font-bold text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-bg-tertiary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spotlight & Highlight Effects */}
            <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-8">
                Spotlight & Highlight Effects
              </h2>

              <div className="space-y-8">
                {/* Highlight Style */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Highlight Style
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Choose how the highlighted element appears
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['glow', 'solid', 'outline', 'shadow', 'none'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setTheme({ ...theme, highlightStyle: style })}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                          theme.highlightStyle === style
                            ? 'bg-gradient-teal text-bg-primary shadow-lg'
                            : 'bg-bg-elevated text-secondary hover:bg-bg-tertiary'
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Width */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Border Width
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Thickness of the highlight border ({theme.highlightBorderWidth}px)
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={theme.highlightBorderWidth}
                    onChange={(e) =>
                      setTheme({ ...theme, highlightBorderWidth: parseInt(e.target.value) })
                    }
                    className="w-full h-3 bg-bg-elevated rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-tertiary font-medium mt-2">
                    <span>1px</span>
                    <span>10px</span>
                  </div>
                </div>

                {/* Glow Intensity */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Glow Intensity
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Strength of the glow effect ({theme.highlightGlowIntensity})
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={theme.highlightGlowIntensity}
                    onChange={(e) =>
                      setTheme({ ...theme, highlightGlowIntensity: parseInt(e.target.value) })
                    }
                    className="w-full h-3 bg-bg-elevated rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-tertiary font-medium mt-2">
                    <span>None</span>
                    <span>Maximum</span>
                  </div>
                </div>

                {/* Animation Toggle */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Pulse Animation
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Subtle pulsing effect on the highlight
                  </p>
                  <button
                    onClick={() =>
                      setTheme({
                        ...theme,
                        highlightAnimation: theme.highlightAnimation === 'pulse' ? 'none' : 'pulse',
                      })
                    }
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      theme.highlightAnimation === 'pulse'
                        ? 'bg-gradient-teal text-bg-primary shadow-lg'
                        : 'bg-bg-elevated text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                      theme.highlightAnimation === 'pulse'
                        ? 'border-bg-primary bg-bg-primary'
                        : 'border-border'
                    }`}>
                      {theme.highlightAnimation === 'pulse' && (
                        <svg className="w-full h-full text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {theme.highlightAnimation === 'pulse' ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            {/* Background Overlay Effects */}
            <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary mb-8">
                Background Overlay Effects
              </h2>

              <div className="space-y-8">
                {/* Darken Background Toggle */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Darken Background
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Dim everything except the highlighted element
                  </p>
                  <button
                    onClick={() =>
                      setTheme({ ...theme, overlayUseDarken: !theme.overlayUseDarken })
                    }
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      theme.overlayUseDarken
                        ? 'bg-gradient-teal text-bg-primary shadow-lg'
                        : 'bg-bg-elevated text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                      theme.overlayUseDarken
                        ? 'border-bg-primary bg-bg-primary'
                        : 'border-border'
                    }`}>
                      {theme.overlayUseDarken && (
                        <svg className="w-full h-full text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {theme.overlayUseDarken ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Darken Amount Slider */}
                {theme.overlayUseDarken && (
                  <div>
                    <label className="block text-base font-display font-bold text-primary mb-2">
                      Darken Amount
                    </label>
                    <p className="text-sm text-secondary mb-4 font-medium">
                      How much to darken the background ({theme.overlayDarkenAmount}%)
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={theme.overlayDarkenAmount}
                      onChange={(e) =>
                        setTheme({ ...theme, overlayDarkenAmount: parseInt(e.target.value) })
                      }
                      className="w-full h-3 bg-bg-elevated rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-tertiary font-medium mt-2">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {/* Blur Background Toggle */}
                <div>
                  <label className="block text-base font-display font-bold text-primary mb-2">
                    Blur Background
                  </label>
                  <p className="text-sm text-secondary mb-4 font-medium">
                    Apply blur effect to non-highlighted areas
                  </p>
                  <button
                    onClick={() =>
                      setTheme({ ...theme, overlayUseBlur: !theme.overlayUseBlur })
                    }
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      theme.overlayUseBlur
                        ? 'bg-gradient-teal text-bg-primary shadow-lg'
                        : 'bg-bg-elevated text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                      theme.overlayUseBlur
                        ? 'border-bg-primary bg-bg-primary'
                        : 'border-border'
                    }`}>
                      {theme.overlayUseBlur && (
                        <svg className="w-full h-full text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {theme.overlayUseBlur ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Blur Amount Slider */}
                {theme.overlayUseBlur && (
                  <div>
                    <label className="block text-base font-display font-bold text-primary mb-2">
                      Blur Amount
                    </label>
                    <p className="text-sm text-secondary mb-4 font-medium">
                      Intensity of the blur effect ({theme.overlayBlurAmount}px)
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={theme.overlayBlurAmount}
                      onChange={(e) =>
                        setTheme({ ...theme, overlayBlurAmount: parseInt(e.target.value) })
                      }
                      className="w-full h-3 bg-bg-elevated rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-tertiary font-medium mt-2">
                      <span>0px</span>
                      <span>20px</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <button
                onClick={() =>
                  setTheme({
                    primary: '#10b981',
                    background: 'rgba(0, 0, 0, 0.6)',
                    text: '#ffffff',
                    accent: '#3b82f6',
                    highlightStyle: 'glow',
                    highlightBorderWidth: 4,
                    highlightGlowIntensity: 40,
                    highlightAnimation: 'pulse',
                    overlayDarkenAmount: 60,
                    overlayBlurAmount: 0,
                    overlayUseBlur: false,
                    overlayUseDarken: true,
                  })
                }
                className="px-6 py-3 border-2 border text-secondary rounded-xl hover:bg-bg-tertiary hover:border-accent/30 transition-all duration-200 font-bold hover:scale-[1.02]"
              >
                Reset to Default
              </button>
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

          {/* Live Preview */}
          <div className="bg-bg-secondary backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-border animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-teal flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-bg-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                Live Preview
              </h2>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden border-2 border shadow-xl"
              style={{ height: '600px' }}
            >
              {/* Mock Page Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary to-bg-elevated p-8">
                <div className="bg-bg-secondary rounded-2xl shadow-glass p-6 mb-4 border border-border">
                  <h3 className="text-xl font-display font-bold text-primary mb-3">
                    Welcome Dashboard
                  </h3>
                  <p className="text-secondary font-medium">
                    This is a preview of how your tour will look with the current theme.
                  </p>
                </div>
              </div>

              {/* Overlay */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background: theme.overlayUseDarken
                    ? `rgba(0, 0, 0, ${theme.overlayDarkenAmount / 100})`
                    : 'transparent',
                  backdropFilter: theme.overlayUseBlur
                    ? `blur(${theme.overlayBlurAmount}px)`
                    : 'none',
                }}
              />

              {/* Spotlight */}
              <div
                className={`absolute top-20 left-8 right-8 rounded-2xl p-6 bg-bg-secondary shadow-2xl transition-all duration-300 ${
                  theme.highlightAnimation === 'pulse' ? 'animate-pulse-slow' : ''
                }`}
                style={{
                  border: theme.highlightStyle !== 'none'
                    ? `${theme.highlightBorderWidth}px ${theme.highlightStyle === 'outline' ? 'dashed' : 'solid'} ${theme.primary}`
                    : 'none',
                  boxShadow:
                    theme.highlightStyle === 'glow'
                      ? `0 0 0 9999px ${
                          theme.overlayUseDarken
                            ? `rgba(0, 0, 0, ${theme.overlayDarkenAmount / 100})`
                            : theme.background
                        }, 0 0 ${theme.highlightGlowIntensity}px ${theme.primary}${
                          Math.round(theme.highlightGlowIntensity / 2.5).toString(16).padStart(2, '0')
                        }`
                      : theme.highlightStyle === 'shadow'
                      ? `0 0 0 9999px ${
                          theme.overlayUseDarken
                            ? `rgba(0, 0, 0, ${theme.overlayDarkenAmount / 100})`
                            : theme.background
                        }, 0 20px 60px rgba(0, 0, 0, 0.3)`
                      : `0 0 0 9999px ${
                          theme.overlayUseDarken
                            ? `rgba(0, 0, 0, ${theme.overlayDarkenAmount / 100})`
                            : theme.background
                        }`,
                }}
              >
                <h3 className="text-xl font-display font-bold text-primary mb-3">
                  Highlighted Element
                </h3>
                <p className="text-secondary font-medium">
                  This element is being highlighted in the tour
                </p>
              </div>

              {/* Caption */}
              <div
                className="absolute bottom-28 left-1/2 transform -translate-x-1/2 rounded-2xl px-8 py-5 shadow-2xl backdrop-blur-sm transition-all duration-300"
                style={{
                  background: 'rgba(0, 0, 0, 0.95)',
                  color: theme.text,
                  maxWidth: '600px',
                }}
              >
                <p className="text-center font-medium text-lg">
                  Welcome to your dashboard! This is where you'll manage everything.
                </p>
              </div>

              {/* Controls */}
              <div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3"
                style={{ background: 'rgba(0, 0, 0, 0.95)' }}
              >
                <button
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                  style={{
                    background: theme.accent,
                    color: 'white',
                  }}
                >
                  Next
                </button>
                <button
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-80"
                  style={{ color: theme.text }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
