'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  Search,
  User,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Edit,
  Globe,
  Clock,
} from 'lucide-react';

interface TourDetail {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  client_email: string;
  client_name: string;
  client_company?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  steps_count: number;
  views_count?: number;
}

export default function AdminToursPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tours, setTours] = useState<TourDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadToursData();
    }
  }, [authorized]);

  async function checkAuthorization() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      if (user.email?.toLowerCase() !== 'hudson@eliteteam.ai') {
        router.push('/dashboard');
        return;
      }

      setAuthorized(true);
    } catch (err) {
      console.error('Authorization check failed:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function loadToursData() {
    try {
      // Load all tours with client information and step counts
      const { data: toursData } = await supabase
        .from('tours')
        .select(`
          *,
          client:clients(
            id,
            email,
            name,
            company
          ),
          steps:tour_steps(count)
        `)
        .order('created_at', { ascending: false });

      const processedTours: TourDetail[] = (toursData || []).map(tour => ({
        id: tour.id,
        title: tour.title,
        description: tour.description,
        client_id: tour.client_id,
        client_email: tour.client?.email || 'Unknown',
        client_name: tour.client?.name || 'Unknown',
        client_company: tour.client?.company,
        published: tour.published || false,
        created_at: tour.created_at,
        updated_at: tour.updated_at,
        steps_count: tour.steps?.[0]?.count || 0,
        views_count: 0, // Would get from analytics if available
      }));

      setTours(processedTours);
    } catch (err) {
      console.error('Failed to load tours data:', err);
    }
  }

  function exportData() {
    const csv = [
      ['Title', 'Description', 'Client', 'Email', 'Company', 'Status', 'Steps', 'Created', 'Updated'].join(','),
      ...filteredTours.map(t => [
        t.title,
        (t.description || '').replace(/,/g, ';'),
        t.client_name,
        t.client_email,
        t.client_company || '',
        t.published ? 'Published' : 'Draft',
        t.steps_count,
        new Date(t.created_at).toLocaleDateString(),
        new Date(t.updated_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrify-tours-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const filteredTours = tours.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client_company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && t.published) ||
      (filterStatus === 'draft' && !t.published);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tours.length,
    published: tours.filter(t => t.published).length,
    draft: tours.filter(t => !t.published).length,
    totalSteps: tours.reduce((sum, t) => sum + t.steps_count, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-neutral-700 font-display font-bold text-lg">Loading tours data...</p>
          <p className="text-neutral-600 text-sm mt-2 font-medium">Fetching complete tour directory</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-neutral-50 to-white min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Admin Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-xl flex-shrink-0">
                <Compass className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-2">
                  All Tours
                </h1>
                <p className="text-lg text-neutral-600 font-medium">Complete tour directory with client and content information</p>
              </div>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 font-display font-bold hover:scale-[1.02] shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-accent-500 hover:shadow-xl transition-all duration-300 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Tours</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-success-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Published</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.published}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-warning-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Drafts</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center shadow-sm">
                <Edit className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.draft}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Steps</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                <Eye className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.totalSteps}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 mb-8 border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by title, description, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-neutral-900 font-medium shadow-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-neutral-900 font-medium shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTours.map((tour, index) => (
            <div key={tour.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
              {/* Tour Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 group-hover:text-accent-600 transition-colors flex-1">{tour.title}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-bold rounded-xl shadow-sm flex-shrink-0 ${
                      tour.published ? 'bg-gradient-to-r from-success-500 to-success-600 text-white' : 'bg-gradient-to-r from-warning-500 to-warning-600 text-white'
                    }`}>
                      {tour.published ? <CheckCircle className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                      {tour.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {tour.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-4 font-medium">{tour.description}</p>
                  )}

                  {/* Client Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <User className="w-4 h-4 text-primary-500" />
                      <span className="font-display font-bold">{tour.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Globe className="w-4 h-4 text-accent-500" />
                      <span className="font-medium">{tour.client_email}</span>
                    </div>
                    {tour.client_company && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Building2 className="w-4 h-4 text-success-500" />
                        <span className="font-medium">{tour.client_company}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Steps Count */}
                <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl p-4 text-center ml-4 border-2 border-accent-200/50 shadow-sm flex-shrink-0">
                  <p className="text-3xl font-display font-bold text-accent-600">{tour.steps_count}</p>
                  <p className="text-xs font-display font-bold text-neutral-700">Steps</p>
                </div>
              </div>

              {/* Tour Footer */}
              <div className="border-t-2 border-neutral-200/50 pt-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="font-medium">Created: <span className="font-display font-bold text-neutral-900">{new Date(tour.created_at).toLocaleDateString()}</span></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4 text-success-500" />
                  <span className="font-medium">Updated: <span className="font-display font-bold text-neutral-900">{new Date(tour.updated_at).toLocaleDateString()}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-16 text-center border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Compass className="w-9 h-9 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-display font-bold text-lg">No tours found matching your filters</p>
            <p className="text-neutral-500 text-sm mt-2 font-medium">Try adjusting your search or filter criteria</p>
          </div>
        )}

        <div className="mt-8 text-sm text-neutral-600 font-medium bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200/50 px-6 py-4 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-500"></span>
          Showing <span className="font-display font-bold text-accent-600">{filteredTours.length}</span> of <span className="font-display font-bold text-neutral-900">{tours.length}</span> tours
        </div>
      </div>
    </div>
  );
}
