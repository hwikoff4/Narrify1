'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, GripVertical, Sparkles, Loader2, Upload, X, FileText } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  selector: string;
  script: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface Page {
  id: string;
  url: string;
  title: string;
  steps: Step[];
}

export default function NewTourPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      url: '/',
      title: 'Home',
      steps: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI generation state
  const [generationMode, setGenerationMode] = useState<'url' | 'screenshots'>('url');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [contextText, setContextText] = useState('');
  const [contextDocuments, setContextDocuments] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);

  function addPage() {
    setPages([
      ...pages,
      {
        id: `page-${Date.now()}`,
        url: '',
        title: '',
        steps: [],
      },
    ]);
  }

  function removePage(pageId: string) {
    setPages(pages.filter((p) => p.id !== pageId));
  }

  function updatePage(pageId: string, field: string, value: string) {
    setPages(
      pages.map((p) => (p.id === pageId ? { ...p, [field]: value } : p))
    );
  }

  function addStep(pageId: string) {
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              steps: [
                ...p.steps,
                {
                  id: `step-${Date.now()}`,
                  title: '',
                  description: '',
                  selector: '',
                  script: '',
                  position: 'center',
                },
              ],
            }
          : p
      )
    );
  }

  function removeStep(pageId: string, stepId: string) {
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? { ...p, steps: p.steps.filter((s) => s.id !== stepId) }
          : p
      )
    );
  }

  function updateStep(
    pageId: string,
    stepId: string,
    field: string,
    value: string
  ) {
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              steps: p.steps.map((s) =>
                s.id === stepId ? { ...s, [field]: value } : s
              ),
            }
          : p
      )
    );
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setScreenshots((prev) => [...prev, ...files]);
  }

  function handleScreenshotDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    setScreenshots((prev) => [...prev, ...files]);
  }

  function removeScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setContextDocuments((prev) => [...prev, ...files]);
  }

  function removeDocument(index: number) {
    setContextDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerateTour() {
    // Validate input based on mode
    if (generationMode === 'url' && !websiteUrl) {
      setGenerationError('Please enter a website URL');
      return;
    }
    if (generationMode === 'screenshots' && screenshots.length === 0) {
      setGenerationError('Please upload at least one screenshot');
      return;
    }

    setGenerating(true);
    setGenerationError('');

    try {
      let requestBody: any = {
        tourName: name || undefined,
        mode: generationMode,
      };

      if (generationMode === 'url') {
        requestBody.url = websiteUrl;
      } else {
        // Convert screenshots to base64
        const screenshotDataPromises = screenshots.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        });
        const screenshotData = await Promise.all(screenshotDataPromises);
        requestBody.screenshots = screenshotData;

        // Add optional context
        if (contextText.trim()) {
          requestBody.contextText = contextText;
        }

        // Convert context documents to text
        if (contextDocuments.length > 0) {
          const documentTextPromises = contextDocuments.map((file) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result);
              };
              reader.readAsText(file);
            });
          });
          const documentTexts = await Promise.all(documentTextPromises);
          requestBody.contextDocuments = documentTexts;
        }
      }

      const response = await fetch('/api/generate-tour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tour');
      }

      const data = await response.json();

      // Populate form with generated data
      setName(data.tourName);
      setDescription(data.description);

      // Transform generated pages to match our state format
      const generatedPages = data.pages.map((page: any, index: number) => ({
        id: `page-${Date.now()}-${index}`,
        url: page.url,
        title: page.title,
        steps: page.steps.map((step: any, stepIndex: number) => ({
          id: `step-${Date.now()}-${stepIndex}`,
          title: step.title,
          description: step.description || '',
          selector: step.selector,
          script: step.script,
          position: step.position || 'center',
        })),
      }));

      setPages(generatedPages);
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate tour');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if Supabase is configured
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (isSupabaseConfigured) {
        // Use Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error('Not authenticated');

        // Get or create client record
        let { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        let client = clientData as any;

        // If client doesn't exist, create it
        if (!client) {
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            // @ts-expect-error - Supabase type definitions issue with clients table
            .insert({
              auth_user_id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0],
              company: user.user_metadata?.company,
            })
            .select('id')
            .single();

          if (clientError) throw clientError;
          client = newClient as any;
        }

        if (!client) throw new Error('Failed to create client record');

        const { error: insertError } = await supabase
          .from('tours')
          // @ts-expect-error - Supabase type definitions issue with tours table
          .insert({
            client_id: client.id,
            name,
            description,
            pages,
          });

        if (insertError) throw insertError;
      } else {
        // Demo mode: Save to localStorage
        const tour = {
          id: `tour-${Date.now()}`,
          name,
          description,
          pages,
          created_at: new Date().toISOString(),
        };

        const existingTours = JSON.parse(localStorage.getItem('narrify_tours') || '[]');
        localStorage.setItem('narrify_tours', JSON.stringify([...existingTours, tour]));
      }

      router.push('/dashboard/tours');
    } catch (err: any) {
      setError(err.message || 'Failed to create tour');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-3">✨ Create Your Tour</h1>
          <p className="text-xl text-text-secondary">
            Let AI do the hard work! Just give it your website and watch the magic happen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-error-bg border border-error/30 text-error px-5 py-4 rounded-xl">
              <p className="font-semibold mb-1">😕 Oops! Something went wrong:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* AI Generation Section */}
          <div className="bg-bg-secondary rounded-xl shadow-xl p-8 border border-accent/30">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-teal rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Let AI Build Your Tour
              </h2>
              <p className="text-lg text-text-secondary">
                Just tell us about your website and we'll create a complete guided tour automatically!
              </p>
            </div>

            <div className="bg-bg-tertiary/80 rounded-lg p-6 mb-6">
              <div className="flex-1">

                {generationError && (
                  <div className="bg-error-bg border border-error/30 text-error px-5 py-4 rounded-xl mb-4">
                    <p className="font-semibold mb-1">😕 Hmm, AI couldn't create your tour:</p>
                    <p className="text-sm">{generationError}</p>
                    <p className="text-xs mt-2 text-error/70">💡 Try checking your website URL or uploading different pictures!</p>
                  </div>
                )}

                {/* Mode Toggle */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-text-secondary mb-3 text-center">
                    How do you want to share your website?
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('url')}
                      className={`flex-1 px-5 py-4 rounded-xl border-2 transition ${
                        generationMode === 'url'
                          ? 'border-accent bg-accent/10 text-text-primary shadow-md'
                          : 'border-border bg-bg-elevated text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">🌐</div>
                      <div className="font-semibold">Website Address</div>
                      <div className="text-xs mt-1 opacity-75">
                        Best for public websites
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('screenshots')}
                      className={`flex-1 px-5 py-4 rounded-xl border-2 transition ${
                        generationMode === 'screenshots'
                          ? 'border-accent bg-accent/10 text-text-primary shadow-md'
                          : 'border-border bg-bg-elevated text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">📸</div>
                      <div className="font-semibold">Pictures</div>
                      <div className="text-xs mt-1 opacity-75">
                        Best for private apps
                      </div>
                    </button>
                  </div>
                </div>

                {/* URL Mode */}
                {generationMode === 'url' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        What's your website address?
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        disabled={generating}
                        className="input text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        💡 Tip: Make sure your website is public so AI can visit it!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateTour}
                      disabled={generating || !websiteUrl}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Creating your tour...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Create My Tour with AI ✨
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Screenshot Mode */}
                {generationMode === 'screenshots' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Upload pictures of your app or website
                      </label>
                      {/* Drag and Drop Zone */}
                      <div
                        onDrop={handleScreenshotDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-accent/30 rounded-xl p-10 text-center hover:border-accent/50 hover:bg-accent/5 transition cursor-pointer bg-bg-tertiary"
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="hidden"
                          id="screenshot-upload"
                        />
                        <label
                          htmlFor="screenshot-upload"
                          className="cursor-pointer block"
                        >
                          <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-accent" />
                          </div>
                          <p className="text-text-primary font-semibold mb-2 text-lg">
                            📸 Drop your pictures here or click to choose
                          </p>
                          <p className="text-sm text-text-secondary">
                            The more pictures you add, the better your tour will be!
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Screenshot Previews */}
                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {screenshots.map((file, index) => (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Optional Context Section */}
                    {screenshots.length > 0 && (
                      <div className="bg-violet/10 border border-violet/30 rounded-xl p-6">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet rounded-full mb-3">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold text-text-primary mb-2 text-lg">
                            🚀 Want an even better tour?
                          </h3>
                          <p className="text-sm text-text-secondary">
                            Tell AI about your app! The more you share, the more helpful your tour will be.
                          </p>
                        </div>

                        {/* Text Context */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            What does your app do?
                          </label>
                          <textarea
                            value={contextText}
                            onChange={(e) => setContextText(e.target.value)}
                            rows={4}
                            className="input resize-none"
                            placeholder="Example: This helps people manage their contacts and sales. The big numbers at the top show how much money we've made. The graph shows daily progress..."
                          />
                          <p className="text-xs text-text-tertiary mt-1">
                            💡 Write like you're explaining it to a friend!
                          </p>
                        </div>

                        {/* Document Upload */}
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Got any guides or documents? (totally optional!)
                          </label>
                          <input
                            type="file"
                            multiple
                            accept=".txt,.md,.pdf,.doc,.docx"
                            onChange={handleDocumentChange}
                            className="hidden"
                            id="document-upload"
                          />
                          <label
                            htmlFor="document-upload"
                            className="inline-flex items-center gap-2 px-4 py-3 bg-bg-elevated border border-border rounded-lg hover:bg-bg-tertiary hover:border-accent/50 transition cursor-pointer"
                          >
                            <FileText className="w-5 h-5 text-accent" />
                            <span className="text-text-secondary font-medium">📄 Add Files</span>
                          </label>
                          <p className="text-xs text-text-tertiary mt-1">
                            User guides, help docs, or any text files about your app
                          </p>

                          {/* Document List */}
                          {contextDocuments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {contextDocuments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 bg-bg-elevated border border-border rounded-lg px-3 py-2"
                                >
                                  <FileText className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                                  <span className="text-sm text-text-secondary flex-1 truncate">
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className="p-1 text-error hover:bg-error-bg rounded transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerateTour}
                      disabled={generating || screenshots.length === 0}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Creating your tour...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Create My Tour with AI ✨
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {generating && (
                  <div className="mt-4 bg-accent/10 rounded-xl p-5 border border-accent/30">
                    <div className="flex items-start gap-4">
                      <Loader2 className="w-6 h-6 text-accent animate-spin flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary mb-1">
                          {generationMode === 'url'
                            ? '🔍 Reading your website...'
                            : '👀 Looking at your pictures...'}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {generationMode === 'url'
                            ? 'Our AI is visiting your website and figuring out the best way to explain it!'
                            : 'Our AI is studying your pictures and creating helpful tour steps!'}
                        </p>
                        <p className="text-xs text-text-tertiary mt-2">
                          ⏱️ This usually takes 1-2 minutes. Hang tight!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tour Info */}
          <div className="bg-bg-secondary rounded-xl shadow-md p-6 border border-border">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-text-primary">
                📝 Name Your Tour
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Give it a friendly name so you can find it later!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  What should we call this tour?
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input text-lg"
                  placeholder="My Awesome Tour"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  💡 Examples: "How to Use Our Dashboard" or "Quick Start Guide"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Short description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="A quick tour showing new users how to get started..."
                />
              </div>
            </div>
          </div>

          {/* Advanced Editor Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAdvancedEditor(!showAdvancedEditor)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bg-elevated hover:bg-bg-tertiary text-text-secondary rounded-lg transition border border-border"
            >
              {showAdvancedEditor ? (
                <>
                  <X className="w-5 h-5" />
                  Hide Advanced Editor
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Want to Edit Manually? (Advanced)
                </>
              )}
            </button>
            {!showAdvancedEditor && (
              <p className="text-xs text-text-tertiary mt-2">
                💡 Don't worry - AI will fill this in for you! Only use this if you're a pro.
              </p>
            )}
          </div>

          {/* Pages */}
          {showAdvancedEditor && (
            <div className="space-y-6 p-6 bg-bg-tertiary/50 rounded-xl border border-border">
              <div className="bg-warning-bg border border-warning/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-text-secondary">
                  ⚠️ <strong>Advanced Mode:</strong> This section is for manual editing. Most people should use AI generation instead - it's much easier!
                </p>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Manual Editor</h2>
                <button
                  type="button"
                  onClick={addPage}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-bg-elevated text-text-secondary rounded-lg hover:bg-bg-tertiary transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Page
                </button>
              </div>

            {pages.map((page, pageIndex) => (
              <div
                key={page.id}
                className="bg-bg-secondary rounded-lg shadow border border-border"
              >
                <div className="p-6 border-b border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Page Address (URL)
                          </label>
                          <input
                            type="text"
                            required
                            value={page.url}
                            onChange={(e) =>
                              updatePage(page.id, 'url', e.target.value)
                            }
                            className="input"
                            placeholder="/my-page or https://example.com/page"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">
                            Page Name
                          </label>
                          <input
                            type="text"
                            required
                            value={page.title}
                            onChange={(e) =>
                              updatePage(page.id, 'title', e.target.value)
                            }
                            className="input"
                            placeholder="What's this page called?"
                          />
                        </div>
                      </div>
                    </div>

                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePage(page.id)}
                        className="p-2 text-error hover:bg-error-bg rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Steps
                    </h3>
                    <button
                      type="button"
                      onClick={() => addStep(page.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {page.steps.map((step) => (
                      <div
                        key={step.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-start gap-4">
                          <GripVertical className="w-5 h-5 text-text-tertiary mt-2" />
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                required
                                value={step.title}
                                onChange={(e) =>
                                  updateStep(
                                    page.id,
                                    step.id,
                                    'title',
                                    e.target.value
                                  )
                                }
                                className="input text-sm"
                                placeholder="What is this step about?"
                              />
                              <input
                                type="text"
                                required
                                value={step.selector}
                                onChange={(e) =>
                                  updateStep(
                                    page.id,
                                    step.id,
                                    'selector',
                                    e.target.value
                                  )
                                }
                                className="input text-sm font-mono"
                                placeholder="Button or element ID (e.g., #submit-btn)"
                              />
                            </div>
                            <textarea
                              required
                              value={step.script}
                              onChange={(e) =>
                                updateStep(
                                  page.id,
                                  step.id,
                                  'script',
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="input text-sm"
                              placeholder="What should the tour say here? (e.g., 'Click this button to save your work!')"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStep(page.id, step.id)}
                            className="p-2 text-error hover:bg-error-bg rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {page.steps.length === 0 && (
                      <p className="text-sm text-text-tertiary text-center py-4">
                        No steps yet. Click "Add Step" to create your first step.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              ← Go Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-4 text-lg disabled:opacity-50"
            >
              {loading ? '✨ Saving Your Tour...' : '🚀 Save & Finish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
