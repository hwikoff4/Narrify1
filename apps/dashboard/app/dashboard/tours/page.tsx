import { createClient } from '@/lib/supabase/server';
import { Plus, Sparkles, Globe, Wand2, Eye, FileText, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function ToursPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_user_id', user?.id)
    .single();

  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('client_id', client?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
            Your Tours
          </h1>
          <p className="text-lg text-neutral-600">
            {!tours || tours.length === 0
              ? "Create and manage your interactive tours"
              : `Managing ${tours.length} ${tours.length === 1 ? 'tour' : 'tours'}`}
          </p>
        </div>
        <Link
          href="/dashboard/tours/new"
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Create Tour</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Tours List */}
      {!tours || tours.length === 0 ? (
        <div className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50/30 rounded-3xl border border-primary-200/50 shadow-glass overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>

          <div className="relative p-8 sm:p-12">
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 shadow-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-4">
                Create Your First Tour
              </h2>
              <p className="text-lg text-neutral-600">
                AI-powered tour creation in minutes. No coding required.
              </p>
            </div>

            {/* Steps */}
            <div className="max-w-3xl mx-auto space-y-4 mb-12">
              {/* Step 1 - Active */}
              <div className="group bg-white rounded-2xl border-2 border-primary-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-primary-600" />
                    <h3 className="font-display font-bold text-neutral-900">Enter Website URL</h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Provide your website URL and AI will analyze your pages to understand your product
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/60 rounded-2xl border-2 border-neutral-200 shadow-md p-6 flex items-start gap-4 opacity-75">
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-300 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-display font-bold text-neutral-700">AI Generates Tour</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Claude Vision analyzes your UI and creates contextual tour steps automatically
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/60 rounded-2xl border-2 border-neutral-200 shadow-md p-6 flex items-start gap-4 opacity-75">
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-300 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-display font-bold text-neutral-700">Preview & Customize</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Review the generated tour, make adjustments, and customize the appearance
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/60 rounded-2xl border-2 border-neutral-200 shadow-md p-6 flex items-start gap-4 opacity-75">
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-300 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-neutral-500" />
                    <h3 className="font-display font-bold text-neutral-700">Deploy to Website</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Add a single script tag to your site and your tour is live
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center max-w-2xl mx-auto">
              <Link
                href="/dashboard/tours/new"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-primary text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                <span>Create Your First Tour</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-neutral-500 mt-4 flex items-center justify-center gap-4 flex-wrap">
                <span>2-minute setup</span>
                <span>•</span>
                <span>No coding required</span>
                <span>•</span>
                <span>Free to start</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <Link
              key={tour.id}
              href={`/dashboard/tours/${tour.id}`}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-display font-bold text-neutral-900 mb-2 line-clamp-2">
                  {tour.name}
                </h3>

                {tour.description && (
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {tour.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-neutral-500 pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{tour.pages?.length || 0} pages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(tour.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
