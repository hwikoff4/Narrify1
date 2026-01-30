'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Key,
  ArrowLeft,
  Search,
  User,
  Building2,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Globe,
  Copy,
  Clock,
} from 'lucide-react';

interface ApiKeyDetail {
  id: string;
  key: string;
  name: string;
  client_id: string;
  client_email: string;
  client_name: string;
  client_company?: string;
  active: boolean;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
  usage_limit?: number;
  domains?: string[];
}

export default function AdminApiKeysPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadApiKeysData();
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

  async function loadApiKeysData() {
    try {
      // Load all API keys with client information
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
        .order('created_at', { ascending: false });

      const processedKeys: ApiKeyDetail[] = (keysData || []).map((key: any) => ({
        id: key.id,
        key: key.key,
        name: key.name,
        client_id: key.client_id,
        client_email: key.client?.email || 'Unknown',
        client_name: key.client?.name || 'Unknown',
        client_company: key.client?.company,
        active: key.active,
        created_at: key.created_at,
        last_used_at: key.last_used_at,
        usage_count: key.usage_count || 0,
        usage_limit: key.usage_limit,
        domains: key.domains,
      }));

      setApiKeys(processedKeys);
    } catch (err) {
      console.error('Failed to load API keys data:', err);
    }
  }

  function copyToClipboard(text: string, keyId: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function exportData() {
    const csv = [
      ['Key Name', 'API Key', 'Client', 'Email', 'Company', 'Status', 'Usage', 'Limit', 'Domains', 'Created', 'Last Used'].join(','),
      ...filteredKeys.map(k => [
        k.name,
        k.key,
        k.client_name,
        k.client_email,
        k.client_company || '',
        k.active ? 'Active' : 'Inactive',
        k.usage_count,
        k.usage_limit || 'Unlimited',
        k.domains?.join(';') || 'All domains',
        new Date(k.created_at).toLocaleDateString(),
        k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrify-api-keys-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const filteredKeys = apiKeys.filter(k => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.client_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.key.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && k.active) ||
      (filterStatus === 'inactive' && !k.active);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter(k => k.active).length,
    totalUsage: apiKeys.reduce((sum, k) => sum + k.usage_count, 0),
    avgUsage: apiKeys.length > 0 ? Math.round(apiKeys.reduce((sum, k) => sum + k.usage_count, 0) / apiKeys.length) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-neutral-700 font-display font-bold text-lg">Loading API keys data...</p>
          <p className="text-neutral-600 text-sm mt-2 font-medium">Fetching complete API key directory</p>
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-xl flex-shrink-0">
                <Key className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-2">
                  All API Keys
                </h1>
                <p className="text-lg text-neutral-600 font-medium">Complete API key directory with usage and client information</p>
              </div>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 font-display font-bold hover:scale-[1.02] shadow-lg"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-success-500 hover:shadow-xl transition-all duration-300 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total API Keys</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Active Keys</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.active}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-accent-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Requests</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.totalUsage.toLocaleString()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-warning-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Avg Requests/Key</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.avgUsage.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 mb-8 border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by key name, client, email, or API key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all text-neutral-900 font-medium shadow-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all text-neutral-900 font-medium shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-6">
          {filteredKeys.map((apiKey, index) => (
            <div key={apiKey.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 group-hover:text-success-600 transition-colors">{apiKey.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-bold rounded-xl shadow-sm ${
                      apiKey.active ? 'bg-gradient-to-r from-success-500 to-success-600 text-white' : 'bg-gradient-to-r from-neutral-300 to-neutral-400 text-white'
                    }`}>
                      {apiKey.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {apiKey.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* API Key */}
                  <div className="flex items-center gap-3 mb-5">
                    <code className="px-4 py-2 bg-gradient-to-r from-neutral-100 to-neutral-50 text-neutral-800 rounded-xl font-mono text-sm border-2 border-neutral-200/50 shadow-sm">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      {copiedKey === apiKey.id ? (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-neutral-500 hover:text-neutral-700" />
                      )}
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <User className="w-4 h-4 text-primary-500" />
                      <span className="font-display font-bold">{apiKey.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Activity className="w-4 h-4 text-accent-500" />
                      <span className="font-medium">{apiKey.client_email}</span>
                    </div>
                    {apiKey.client_company && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Building2 className="w-4 h-4 text-success-500" />
                        <span className="font-medium">{apiKey.client_company}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="text-center lg:text-right">
                  <div className="bg-gradient-to-br from-success-50 to-primary-50 rounded-2xl p-6 border-2 border-success-200/50 shadow-sm">
                    <p className="text-4xl font-display font-bold text-success-600 mb-2">{apiKey.usage_count.toLocaleString()}</p>
                    <p className="text-sm font-display font-bold text-neutral-700 mb-1">Total Requests</p>
                    {apiKey.usage_limit && (
                      <p className="text-xs text-neutral-600 font-medium mt-2">
                        Limit: <span className="font-display font-bold text-neutral-900">{apiKey.usage_limit.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="border-t-2 border-neutral-200/50 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  {/* Domains */}
                  <div>
                    <p className="text-neutral-600 mb-3 flex items-center gap-2 font-display font-bold">
                      <Globe className="w-4 h-4 text-accent-500" />
                      Allowed Domains
                    </p>
                    {apiKey.domains && apiKey.domains.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {apiKey.domains.map((domain, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-accent-50 to-accent-100 text-accent-700 rounded-lg text-xs font-display font-bold border border-accent-200/50 shadow-sm">
                            {domain}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 text-xs font-medium">All domains allowed</p>
                    )}
                  </div>

                  {/* Created */}
                  <div>
                    <p className="text-neutral-600 mb-3 flex items-center gap-2 font-display font-bold">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      Created
                    </p>
                    <p className="text-neutral-900 font-medium">
                      {new Date(apiKey.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Last Used */}
                  <div>
                    <p className="text-neutral-600 mb-3 flex items-center gap-2 font-display font-bold">
                      <Clock className="w-4 h-4 text-success-500" />
                      Last Used
                    </p>
                    <p className="text-neutral-900 font-medium">
                      {apiKey.last_used_at ? (
                        new Date(apiKey.last_used_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-neutral-500">Never used</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredKeys.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-16 text-center border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Key className="w-9 h-9 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-display font-bold text-lg">No API keys found matching your filters</p>
            <p className="text-neutral-500 text-sm mt-2 font-medium">Try adjusting your search or filter criteria</p>
          </div>
        )}

        <div className="mt-8 text-sm text-neutral-600 font-medium bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200/50 px-6 py-4 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success-500"></span>
          Showing <span className="font-display font-bold text-success-600">{filteredKeys.length}</span> of <span className="font-display font-bold text-neutral-900">{apiKeys.length}</span> API keys
        </div>
      </div>
    </div>
  );
}
