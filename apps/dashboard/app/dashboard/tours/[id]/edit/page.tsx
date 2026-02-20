'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
    } catch (err) {
      console.error('Error loading tour:', err);
      setError('Failed to load tour');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/tours/${tour.id}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tour
          </Link>

          <h1 className="text-3xl font-bold text-text-primary">✏️ Edit Tour</h1>
          <p className="text-text-secondary mt-2">Update your tour name and description</p>
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

            {/* Info Banner */}
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary mb-1">Note about editing pages and steps</h4>
                  <p className="text-sm text-text-secondary">
                    To edit the pages and steps in your tour, use the Preview page and click "Edit Highlights" to adjust the highlighted areas and positions.
                  </p>
                </div>
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
