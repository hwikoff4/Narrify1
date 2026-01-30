'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Search,
  User,
  Key,
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  Clock,
} from 'lucide-react';

interface RequestSummary {
  api_key_id: string;
  api_key_name: string;
  api_key: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  total_requests: number;
  last_used?: string;
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'requests' | 'recent' | 'client'>('requests');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadRequestsData();
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

  async function loadRequestsData() {
    try {
      // Load all API keys with usage data and client information
      const { data: keysData } = await supabase
        .from('api_keys')
        .select(`
          *,
          client:clients(
            id,
            email,
            name,
            company
          )
        `)
        .order('usage_count', { ascending: false });

      const processedRequests: RequestSummary[] = (keysData || [])
        .filter(key => (key.usage_count || 0) > 0) // Only show keys with requests
        .map(key => ({
          api_key_id: key.id,
          api_key_name: key.name,
          api_key: key.key,
          client_id: key.client_id,
          client_name: key.client?.name || 'Unknown',
          client_email: key.client?.email || 'Unknown',
          client_company: key.client?.company,
          total_requests: key.usage_count || 0,
          last_used: key.last_used_at,
        }));

      setRequests(processedRequests);
    } catch (err) {
      console.error('Failed to load requests data:', err);
    }
  }

  function exportData() {
    const csv = [
      ['API Key Name', 'API Key', 'Client', 'Email', 'Company', 'Total Requests', 'Last Used'].join(','),
      ...filteredRequests.map(r => [
        r.api_key_name,
        r.api_key,
        r.client_name,
        r.client_email,
        r.client_company || '',
        r.total_requests,
        r.last_used ? new Date(r.last_used).toLocaleString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrify-api-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const filteredRequests = requests
    .filter(r => {
      const matchesSearch =
        r.api_key_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.api_key.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'requests':
          return b.total_requests - a.total_requests;
        case 'recent':
          if (!a.last_used) return 1;
          if (!b.last_used) return -1;
          return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
        case 'client':
          return a.client_name.localeCompare(b.client_name);
        default:
          return 0;
      }
    });

  const stats = {
    total: requests.reduce((sum, r) => sum + r.total_requests, 0),
    uniqueKeys: requests.length,
    uniqueClients: new Set(requests.map(r => r.client_id)).size,
    avgPerKey: requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + r.total_requests, 0) / requests.length) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-neutral-700 font-display font-bold text-lg">Loading requests data...</p>
          <p className="text-neutral-600 text-sm mt-2 font-medium">Fetching API usage analytics</p>
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-xl flex-shrink-0">
                <Activity className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-2">
                  API Request Analytics
                </h1>
                <p className="text-lg text-neutral-600 font-medium">Detailed API usage statistics by key and client</p>
              </div>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 font-display font-bold hover:scale-[1.02] shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-warning-500 hover:shadow-xl transition-all duration-300 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Requests</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Active API Keys</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.uniqueKeys}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-accent-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Active Clients</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.uniqueClients}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-success-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Avg Requests/Key</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.avgPerKey.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 mb-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by key name, client, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-warning-500 focus:border-warning-500 transition-all text-neutral-900 font-medium shadow-sm"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-warning-500 focus:border-warning-500 transition-all text-neutral-900 font-medium shadow-sm"
            >
              <option value="requests">Sort by: Most Requests</option>
              <option value="recent">Sort by: Recently Used</option>
              <option value="client">Sort by: Client Name</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request, index) => (
            <div key={request.api_key_id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex-1 w-full">
                  {/* Rank Badge for Top 10 */}
                  {index < 10 && (
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-display font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-warning-400 to-warning-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-neutral-300 to-neutral-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-warning-600 to-warning-700 text-white' :
                        'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mb-3 group-hover:text-warning-600 transition-colors">{request.api_key_name}</h3>
                    <code className="inline-block px-4 py-2 bg-gradient-to-r from-neutral-100 to-neutral-50 text-neutral-800 rounded-xl font-mono text-sm border-2 border-neutral-200/50 shadow-sm">
                      {request.api_key}
                    </code>
                  </div>

                  {/* Client Info with color-coded icons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <User className="w-4 h-4 text-primary-500" />
                      <span className="font-display font-bold">{request.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Activity className="w-4 h-4 text-accent-500" />
                      <span className="font-medium">{request.client_email}</span>
                    </div>
                    {request.client_company && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Key className="w-4 h-4 text-success-500" />
                        <span className="font-medium">{request.client_company}</span>
                      </div>
                    )}
                    {request.last_used && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-4 h-4 text-warning-500" />
                        <span className="font-medium">Last used: <span className="font-display font-bold text-neutral-900">{new Date(request.last_used).toLocaleDateString()}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium request count box */}
                <div className="text-center lg:text-right flex-shrink-0">
                  <div className="bg-gradient-to-br from-warning-50 to-primary-50 rounded-2xl p-6 border-2 border-warning-200/50 shadow-sm">
                    <p className="text-4xl font-display font-bold text-warning-600 mb-2">{request.total_requests.toLocaleString()}</p>
                    <p className="text-sm font-display font-bold text-neutral-700 mb-3">Requests</p>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-warning-600" />
                      <span className="text-xs font-display font-bold text-neutral-700">{((request.total_requests / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Usage Bar */}
              <div className="mt-6 pt-6 border-t-2 border-neutral-200/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-display font-bold text-neutral-700">Usage Distribution</span>
                  <span className="font-display font-bold text-warning-600">{((request.total_requests / stats.total) * 100).toFixed(1)}% of total</span>
                </div>
                <div className="w-full bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-warning-500 to-warning-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min((request.total_requests / stats.total) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-12 sm:p-16 text-center border border-neutral-200/50 animate-fade-up">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">No Request Data Found</h3>
            <p className="text-neutral-600 font-medium">No request data found matching your filters. Try adjusting your search criteria.</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warning-50 to-primary-50 text-warning-700 rounded-xl font-display font-bold border-2 border-warning-200/50 shadow-sm">
            <Activity className="w-4 h-4" />
            Showing {filteredRequests.length} of {requests.length} active API keys
          </span>
        </div>
      </div>
    </div>
  );
}
