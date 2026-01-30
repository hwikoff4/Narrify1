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

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single();

      const { data: tourData } = await supabase
        .from('tours')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', client?.id)
        .single();

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/tours/${tour.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tour
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Tour</h1>
          <p className="text-gray-600 mt-2">Update your tour name and description</p>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Tour Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                Tour Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Product Tour, Feature Walkthrough"
              />
              <p className="text-sm text-gray-500 mt-1">
                Give your tour a clear, descriptive name
              </p>
            </div>

            {/* Tour Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what this tour covers..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Help your team understand what this tour is about
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Note about editing pages and steps</h4>
                  <p className="text-sm text-gray-700">
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
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
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
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition font-medium"
          >
            <span className="text-xl">👀</span>
            <span>Go to Preview</span>
          </Link>
          <Link
            href={`/dashboard/tours/${tour.id}`}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition font-medium"
          >
            <span className="text-xl">📊</span>
            <span>View Tour Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
