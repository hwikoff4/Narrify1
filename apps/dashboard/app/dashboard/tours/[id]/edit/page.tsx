'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Step {
  id: string;
  title: string;
  selector: string;
  script: string;
  position: string;
  description?: string;
}

interface Page {
  id: string;
  url: string;
  title: string;
  steps: Step[];
}

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    loadTour();
  }, []);

  async function loadTour() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) return;

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      const client = clientData as any;

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
      setName(tourData.name || '');
      setDescription(tourData.description || '');
      setPages(tourData.pages || []);
    } catch (err) {
      console.error('Error loading tour:', err);
      setError('Failed to load tour');
    } finally {
      setLoading(false);
    }
  }

  function updateStep(pageId: string, stepId: string, field: string, value: string) {
    setPages(prev =>
      prev.map(page =>
        page.id === pageId
          ? {
              ...page,
              steps: page.steps.map(step =>
                step.id === stepId ? { ...step, [field]: value } : step
              ),
            }
          : page
      )
    );
  }

  function addStep(pageId: string) {
    const newStep: Step = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      selector: '',
      script: '',
      position: 'center',
    };
    setPages(prev =>
      prev.map(page =>
        page.id === pageId
          ? { ...page, steps: [...page.steps, newStep] }
          : page
      )
    );
  }

  function removeStep(pageId: string, stepId: string) {
    setPages(prev =>
      prev.map(page =>
        page.id === pageId
          ? { ...page, steps: page.steps.filter(s => s.id !== stepId) }
          : page
      )
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('tours')
        // @ts-expect-error - Supabase type definitions issue with tours table
        .update({
          name,
          description,
          pages,
        })
        .eq('id', params.id);

      if (updateError) throw updateError;

      router.push(`/dashboard/tours/${params.id}`);
    } catch (err: any) {
      console.error('Error saving tour:', err);
      setError(err.message || 'Failed to save tour');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/tours/${tour.id}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tour
          </Link>

          <h1 className="text-3xl font-bold text-text-primary">Edit Tour</h1>
          <p className="text-text-secondary mt-2">Update your tour details, pages, and steps</p>
        </div>

        {/* Edit Form */}
        <div className="bg-bg-secondary rounded-xl shadow-lg border border-border p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="bg-error-bg border border-error/30 text-error px-5 py-4 rounded-xl">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Tour Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-text-primary mb-2">
                Tour Name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
                placeholder="e.g., Product Tour, Feature Walkthrough"
              />
              <p className="text-sm text-text-tertiary mt-1">
                Give your tour a clear, descriptive name
              </p>
            </div>

            {/* Tour Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-text-primary mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input"
                placeholder="Describe what this tour covers..."
              />
              <p className="text-sm text-text-tertiary mt-1">
                Help your team understand what this tour is about
              </p>
            </div>

            {/* Pages & Steps Editor */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4">Pages & Steps</h2>
              <div className="space-y-6">
                {pages.map((page, pageIndex) => (
                  <div
                    key={page.id}
                    className="bg-bg-tertiary border border-border rounded-xl overflow-hidden"
                  >
                    {/* Page Header */}
                    <div className="px-6 py-4 bg-bg-elevated border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                            {pageIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-text-primary">{page.title || 'Untitled Page'}</h3>
                            <p className="text-xs text-text-tertiary font-mono">{page.url}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Steps */}
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
                                      updateStep(page.id, step.id, 'title', e.target.value)
                                    }
                                    className="input text-sm"
                                    placeholder="Step title"
                                  />
                                  <input
                                    type="text"
                                    required
                                    value={step.selector}
                                    onChange={(e) =>
                                      updateStep(page.id, step.id, 'selector', e.target.value)
                                    }
                                    className="input text-sm font-mono"
                                    placeholder="CSS selector (e.g., #submit-btn)"
                                  />
                                </div>
                                <textarea
                                  required
                                  value={step.script}
                                  onChange={(e) =>
                                    updateStep(page.id, step.id, 'script', e.target.value)
                                  }
                                  rows={2}
                                  className="input text-sm"
                                  placeholder="Narration script (e.g., 'Click this button to save your work!')"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <select
                                    value={step.position || 'center'}
                                    onChange={(e) =>
                                      updateStep(page.id, step.id, 'position', e.target.value)
                                    }
                                    className="input text-sm"
                                  >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="center">Center</option>
                                  </select>
                                </div>
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

                {pages.length === 0 && (
                  <div className="text-center py-8 text-text-tertiary">
                    <p>No pages in this tour yet. Create the tour first from the New Tour page.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 flex items-center justify-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <Link
                href={`/dashboard/tours/${tour.id}`}
                className="btn-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link
            href={`/dashboard/tours/${tour.id}/preview`}
            className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border border-border text-text-primary rounded-lg hover:bg-bg-tertiary hover:border-accent/50 transition font-medium"
          >
            <span className="text-xl">👀</span>
            <span>Go to Preview</span>
          </Link>
          <Link
            href={`/dashboard/tours/${tour.id}`}
            className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border border-border text-text-primary rounded-lg hover:bg-bg-tertiary hover:border-accent/50 transition font-medium"
          >
            <span className="text-xl">📊</span>
            <span>View Tour Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
