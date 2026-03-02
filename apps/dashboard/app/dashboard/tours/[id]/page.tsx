'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Edit, Copy, Trash2, Eye, Code, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [theme, setTheme] = useState<any>(null);

  useEffect(() => {
    loadTour();
  }, []);

  async function loadTour() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) return;

      const { data: clientData } = await supabase
        .from('clients')
        .select('*, config')
        .eq('auth_user_id', user.id)
        .single();

      const client = clientData as any;

      // Load client theme
      if (client?.config?.theme) {
        setTheme(client.config.theme);
      }

      const { data: tourDataRaw } = await supabase
        .from('tours')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', client?.id)
        .single();

      const tourData = tourDataRaw as any;

      if (!tourData) {
        router.push('/dashboard/tours');
        return;
      }

      setTour(tourData);
    } catch (err) {
      console.error('Error loading tour:', err);
      router.push('/dashboard/tours');
    } finally {
      setLoading(false);
    }
  }

  function getEmbedCode() {
    const themeStr = theme
      ? `,\n    theme: ${JSON.stringify(theme, null, 6).replace(/\n/g, '\n    ')}`
      : '';
    return `<!-- Narrify Tour Widget -->
<script src="https://cdn.jsdelivr.net/npm/@narrify/sdk@latest/dist/narrify.umd.full.js"></script>
<script>
  Narrify.init({
    tourId: '${tour.id}',
    apiKey: 'YOUR_API_KEY_HERE'${themeStr}
  });
</script>`;
  }

  function copyEmbedCode() {
    navigator.clipboard.writeText(getEmbedCode());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function deleteTour() {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      router.push('/dashboard/tours');
    } catch (err: any) {
      console.error('Error deleting tour:', err);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-text-secondary font-medium">Loading tour...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/tours"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent mb-6 font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tours
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-3">{tour.name}</h1>
              {tour.description && (
                <p className="text-xl text-text-secondary font-medium">{tour.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-text-secondary font-medium">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                  Created {formatDate(tour.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                  {tour.pages?.length || 0} pages
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                  {tour.pages?.reduce(
                    (total: number, page: any) => total + (page.steps?.length || 0),
                    0
                  ) || 0}{' '}
                  steps
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/tours/${tour.id}/preview`}
                className="flex items-center gap-2 px-5 py-3 btn-secondary transition-all duration-200 font-bold hover:scale-[1.02] shadow-sm"
                title="See how your tour looks to users"
              >
                <Eye className="w-5 h-5" />
                Preview
              </Link>
              <Link
                href={`/dashboard/tours/${tour.id}/edit`}
                className="flex items-center gap-2 px-5 py-3 btn-secondary transition-all duration-200 font-bold hover:scale-[1.02] shadow-sm"
                title="Make changes to your tour"
              >
                <Edit className="w-5 h-5" />
                Edit
              </Link>
              <button
                onClick={() => setShowCodeModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-teal text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 font-bold hover:scale-[1.02]"
                title="Copy code to add this tour to your website"
              >
                <Code className="w-5 h-5" />
                Get Code
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-5 py-3 btn-secondary text-error hover:bg-error-bg hover:border-error/30 transition-all duration-200 font-bold hover:scale-[1.02] shadow-sm"
                title="Delete this tour"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Helpful Tip Banner */}
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 sm:p-8 mb-8 shadow-glass animate-fade-up">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-teal flex items-center justify-center shadow-lg flex-shrink-0 text-2xl">
              💡
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-display font-bold text-text-primary mb-4">What to do next?</h3>
              <div className="space-y-3 text-base text-text-secondary">
                <p className="flex items-start gap-3 font-medium">
                  <span className="text-xl flex-shrink-0">👀</span>
                  <span><strong className="font-bold">Preview it:</strong> Click the Preview button above to see how your tour will look to users</span>
                </p>
                <p className="flex items-start gap-3 font-medium">
                  <span className="text-xl flex-shrink-0">✏️</span>
                  <span><strong className="font-bold">Make changes:</strong> Need to adjust something? Use the Edit button to modify any step</span>
                </p>
                <p className="flex items-start gap-3 font-medium">
                  <span className="text-xl flex-shrink-0">🔗</span>
                  <span><strong className="font-bold">Add to website:</strong> When you're happy with it, click "Get Code" to add this tour to your website!</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Pages & Steps */}
      <div className="space-y-6">
        {tour.pages && tour.pages.length > 0 ? (
          tour.pages.map((page: any, pageIndex: number) => (
            <div
              key={page.id || pageIndex}
              className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl shadow-glass border border-border hover:shadow-xl transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${pageIndex * 0.1}s` }}
            >
              <div className="p-6 sm:p-8 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-teal flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-white font-display font-bold text-lg">
                          {pageIndex + 1}
                        </span>
                      </div>
                      <h2 className="text-2xl font-display font-bold text-text-primary">
                        {page.title}
                      </h2>
                    </div>
                    <p className="text-sm text-text-secondary font-mono ml-16 font-medium">{page.url}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl flex-shrink-0">
                    <span className="text-sm font-display font-bold text-accent">
                      {page.steps?.length || 0}
                    </span>
                    <span className="text-sm text-accent font-medium">steps</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {page.steps && page.steps.length > 0 ? (
                  <div className="space-y-5">
                    {page.steps.map((step: any, stepIndex: number) => (
                      <div
                        key={step.id || stepIndex}
                        className="p-5 sm:p-6 bg-bg-tertiary border border-border rounded-xl hover:border-accent/30 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-5">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-bg-elevated rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-sm font-display font-bold text-text-secondary">
                                {stepIndex + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                                {step.title}
                              </h3>
                              {step.description && (
                                <p className="text-base text-text-secondary font-medium">
                                  {step.description}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-2">
                                  <span className="text-sm">🎯</span>
                                  Highlights Element
                                </label>
                                <code className="block text-sm bg-bg-elevated px-4 py-3 rounded-xl border border-border font-mono text-text-primary font-medium shadow-sm">
                                  {step.selector}
                                </code>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-2">
                                  <span className="text-sm">📍</span>
                                  Tooltip Position
                                </label>
                                <span className="inline-flex items-center px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent capitalize font-bold shadow-sm">
                                  {step.position || 'center'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-2">
                                <span className="text-sm">💬</span>
                                Tour Narration
                              </label>
                              <p className="text-sm bg-accent/10 px-4 py-3 rounded-xl border border-accent/30 text-text-primary font-medium shadow-sm">
                                {step.script}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center shadow-glass">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h4 className="text-xl font-display font-bold text-text-primary mb-2">
                      No steps yet for this page
                    </h4>
                    <p className="text-base text-text-secondary font-medium mb-6">
                      Click the Edit button above to add guided steps to this page!
                    </p>
                    <Link
                      href={`/dashboard/tours/${tour.id}/edit`}
                      className="inline-flex items-center gap-2 px-5 py-3 btn-secondary rounded-xl hover:shadow-lg transition-all duration-200 font-bold hover:scale-[1.02]"
                    >
                      <Edit className="w-5 h-5" />
                      Add Steps
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-bg-tertiary rounded-2xl shadow-glass p-12 sm:p-16 text-center border border-border animate-fade-up">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-teal flex items-center justify-center shadow-xl">
              <span className="text-5xl">📝</span>
            </div>
            <h3 className="text-3xl font-display font-bold text-text-primary mb-4">No Pages Yet</h3>
            <p className="text-lg text-text-secondary font-medium mb-8 max-w-md mx-auto">
              This tour doesn't have any pages yet. Click the button below to start adding guided pages to your tour!
            </p>
            <Link
              href={`/dashboard/tours/${tour.id}/edit`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-teal text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 font-bold hover:scale-[1.02] shadow-lg"
            >
              <Edit className="w-5 h-5" />
              Add Pages
            </Link>
          </div>
        )}
      </div>

      {/* Get Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-teal px-6 sm:px-8 py-5 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <span>🔗</span>
                  Embed Your Tour
                </h3>
                <p className="text-bg-primary/70 text-sm font-medium mt-1">Add this code to your website</p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Instructions */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 sm:p-6 shadow-sm">
                <h4 className="text-lg font-display font-bold text-accent mb-4 flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  How to add this to your website
                </h4>
                <ol className="space-y-3 text-sm text-text-secondary">
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">1</span>
                    <span className="font-medium pt-0.5">Copy the code below</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">2</span>
                    <span className="font-medium pt-0.5">Paste it before the closing <code className="bg-bg-elevated px-2 py-0.5 rounded border border-border font-mono text-xs">&lt;/body&gt;</code> tag in your HTML</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">3</span>
                    <span className="font-medium pt-0.5">Replace <code className="bg-bg-elevated px-2 py-0.5 rounded border border-border font-mono text-xs">YOUR_API_KEY_HERE</code> with your actual API key</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">4</span>
                    <span className="font-medium pt-0.5">That's it! Your tour will appear automatically 🎉</span>
                  </li>
                </ol>
              </div>

              {/* Embed Code */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-display font-bold text-text-primary">Embed Code</label>
                  <button
                    onClick={copyEmbedCode}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-teal text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-bold hover:scale-[1.02]"
                  >
                    <Copy className="w-4 h-4" />
                    {codeCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-100 p-5 sm:p-6 rounded-xl overflow-x-auto text-sm font-mono border-2 border-neutral-700/50 shadow-lg">
{getEmbedCode()}
                </pre>
              </div>

              {/* Get API Key */}
              <div className="bg-warning-bg border border-warning/30 rounded-xl p-5 sm:p-6 shadow-sm">
                <h4 className="text-lg font-display font-bold text-warning mb-3 flex items-center gap-3">
                  <span className="text-2xl">🔑</span>
                  Need an API Key?
                </h4>
                <p className="text-sm text-text-secondary font-medium mb-4">
                  You can find or generate your API key in the API Keys section
                </p>
                <Link
                  href="/dashboard/api-keys"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-warning text-bg-primary rounded-xl hover:shadow-lg transition-all duration-200 font-bold hover:scale-[1.02] shadow-sm"
                >
                  Go to API Keys
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-bg-tertiary px-6 sm:px-8 py-5 flex justify-end gap-3 rounded-b-2xl border-t border-border">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-6 py-3 btn-secondary rounded-xl transition-all duration-200 font-bold hover:scale-[1.02] shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full border border-border animate-scale-in p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error-bg flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-2xl font-display font-bold text-text-primary mb-2">Delete Tour</h3>
              <p className="text-text-secondary">
                Are you sure you want to delete <strong className="text-text-primary">{tour.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 btn-secondary py-3 font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteTour}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-error text-white rounded-xl hover:bg-error/80 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Tour'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
