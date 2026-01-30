'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Search,
  Mail,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  DollarSign,
  TrendingUp,
  Activity,
  Globe,
} from 'lucide-react';

interface ClientDetail {
  id: string;
  email: string;
  name: string;
  company?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  total_tours: number;
  total_api_keys: number;
  total_requests: number;
  last_active?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [clients, setClients] = useState<ClientDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'starter' | 'professional' | 'enterprise'>('all');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadClientsData();
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

  async function loadClientsData() {
    try {
      // Load all clients with detailed information
      const { data: clientsData } = await supabase
        .from('clients')
        .select(`
          *,
          tours:tours(count),
          api_keys:api_keys(count, usage_count)
        `)
        .order('created_at', { ascending: false });

      const processedClients: ClientDetail[] = (clientsData || []).map((client: any) => {
        const totalRequests = client.api_keys?.reduce((sum: number, key: any) =>
          sum + (key.usage_count || 0), 0
        ) || 0;

        return {
          id: client.id,
          email: client.email,
          name: client.name,
          company: client.company,
          subscription_plan: client.subscription_plan || 'free',
          subscription_status: client.subscription_status || 'active',
          created_at: client.created_at,
          total_tours: client.tours?.[0]?.count || 0,
          total_api_keys: client.api_keys?.length || 0,
          total_requests: totalRequests,
          phone: client.phone,
          website: client.website,
          address: client.address,
          city: client.city,
          state: client.state,
          country: client.country,
        };
      });

      setClients(processedClients);
    } catch (err) {
      console.error('Failed to load clients data:', err);
    }
  }

  function exportData() {
    const csv = [
      ['Email', 'Name', 'Company', 'Plan', 'Status', 'Tours', 'API Keys', 'Requests', 'Created', 'Phone', 'Website'].join(','),
      ...filteredClients.map(c => [
        c.email,
        c.name,
        c.company || '',
        c.subscription_plan,
        c.subscription_status,
        c.total_tours,
        c.total_api_keys,
        c.total_requests,
        new Date(c.created_at).toLocaleDateString(),
        c.phone || '',
        c.website || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrify-clients-detailed-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.subscription_status === filterStatus;
    const matchesPlan = filterPlan === 'all' || c.subscription_plan === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.subscription_status === 'active').length,
    totalTours: clients.reduce((sum, c) => sum + c.total_tours, 0),
    totalRequests: clients.reduce((sum, c) => sum + c.total_requests, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-neutral-700 font-display font-bold text-lg">Loading clients data...</p>
          <p className="text-neutral-600 text-sm mt-2 font-medium">Fetching complete client directory</p>
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
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 font-display font-bold transition-all hover:gap-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Back to Admin Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl flex-shrink-0">
                <Users className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-2">
                  All Clients
                </h1>
                <p className="text-lg text-neutral-600 font-medium">Complete client directory with detailed information</p>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-primary-500 hover:shadow-xl transition-all duration-300 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Clients</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-success-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Active Clients</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.active}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-accent-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Tours</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.totalTours}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 border-l-4 border-warning-500 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-display font-bold text-neutral-700">Total Requests</p>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-neutral-900">{stats.totalRequests.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 mb-8 border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-neutral-900 placeholder:text-neutral-400 shadow-sm"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-neutral-900 bg-white shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-neutral-900 bg-white shadow-sm"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass overflow-hidden border border-neutral-200/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-100 to-neutral-50 border-b-2 border-neutral-200/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Client Info</th>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Contact</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Plan</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Tours</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">API Keys</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Requests</th>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-neutral-100/50 hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-transparent transition-all duration-200 group">
                    <td className="py-5 px-6">
                      <div>
                        <p className="font-display font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{client.name}</p>
                        {client.company && (
                          <p className="text-sm text-neutral-600 flex items-center gap-1.5 mt-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5" />
                            {client.company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1.5">
                        <p className="text-sm text-neutral-900 flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          {client.email}
                        </p>
                        {client.website && (
                          <p className="text-sm text-neutral-600 flex items-center gap-1.5 font-medium">
                            <Globe className="w-3.5 h-3.5 text-neutral-400" />
                            {client.website}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="inline-flex px-3 py-1.5 text-xs font-display font-bold rounded-lg capitalize bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 border border-primary-300/50 shadow-sm">
                        {client.subscription_plan}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-bold rounded-lg shadow-sm ${
                        client.subscription_status === 'active'
                          ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-900 border border-success-300/50'
                          : 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-300/50'
                      }`}>
                        {client.subscription_status === 'active' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {client.subscription_status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200/50 rounded-lg font-display font-bold text-accent-900 text-sm shadow-sm">
                        {client.total_tours}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200/50 rounded-lg font-display font-bold text-warning-900 text-sm shadow-sm">
                        {client.total_api_keys}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="font-display font-bold text-neutral-900 text-sm">
                        {client.total_requests.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-600 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(client.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center shadow-glass">
                <Users className="w-10 h-10 text-neutral-400" />
              </div>
              <h4 className="text-xl font-display font-bold text-neutral-900 mb-2">No clients found</h4>
              <p className="text-neutral-600 font-medium">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-neutral-600 font-medium bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200/50 px-6 py-4 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          Showing <span className="font-display font-bold text-primary-600">{filteredClients.length}</span> of <span className="font-display font-bold text-neutral-900">{clients.length}</span> clients
        </div>
      </div>
    </div>
  );
}
