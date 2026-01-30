'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Users,
  TrendingUp,
  DollarSign,
  Globe,
  Key,
  Eye,
  Download,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  total_tours?: number;
  total_api_keys?: number;
  last_active?: string;
  total_views?: number;
}

interface Analytics {
  totalClients: number;
  activeClients: number;
  totalTours: number;
  publishedTours: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalViews: number;
  avgToursPerClient: number;
  growthRate: {
    clients: number;
    tours: number;
    views: number;
  };
  revenueData?: {
    mrr: number;
    arr: number;
    avgRevenuePerUser: number;
  };
  topClients: Array<{
    name: string;
    email: string;
    tours: number;
    views: number;
    value: number;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'tours' | 'views'>('created');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadAdminData();
    }
  }, [authorized, timeRange]);

  async function checkAuthorization() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Only allow Hudson@EliteTeam.ai
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

  async function loadAdminData() {
    try {
      // Load all clients with aggregated data
      const { data: clientsData } = await supabase
        .from('clients')
        .select(`
          *,
          tours:tours(count),
          api_keys:api_keys(count)
        `)
        .order('created_at', { ascending: false });

      // Calculate analytics
      const { data: toursData } = await supabase
        .from('tours')
        .select('id, client_id, published, created_at');

      const { data: apiKeysData } = await supabase
        .from('api_keys')
        .select('id, active, created_at, usage_count, client_id');

      // Process clients data
      const processedClients: Client[] = (clientsData || []).map(client => ({
        id: client.id,
        email: client.email,
        name: client.name,
        company: client.company,
        subscription_plan: client.subscription_plan || 'free',
        subscription_status: client.subscription_status || 'active',
        created_at: client.created_at,
        total_tours: client.tours?.[0]?.count || 0,
        total_api_keys: client.api_keys?.[0]?.count || 0,
      }));

      setClients(processedClients);

      // Calculate comprehensive analytics
      const totalClients = processedClients.length;
      const activeClients = processedClients.filter(c =>
        c.subscription_status === 'active'
      ).length;

      const totalTours = toursData?.length || 0;
      const publishedTours = toursData?.filter(t => t.published).length || 0;

      const totalApiKeys = apiKeysData?.length || 0;
      const activeApiKeys = apiKeysData?.filter(k => k.active).length || 0;
      const totalViews = apiKeysData?.reduce((sum, k) => sum + (k.usage_count || 0), 0) || 0;

      // Calculate growth rates (comparing to previous period)
      const now = new Date();
      const periodDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

      const currentClients = processedClients.filter(c =>
        new Date(c.created_at) >= periodStart
      ).length;
      const previousClients = processedClients.filter(c =>
        new Date(c.created_at) >= previousPeriodStart && new Date(c.created_at) < periodStart
      ).length;

      const currentTours = toursData?.filter(t =>
        new Date(t.created_at) >= periodStart
      ).length || 0;
      const previousTours = toursData?.filter(t =>
        new Date(t.created_at) >= previousPeriodStart && new Date(t.created_at) < periodStart
      ).length || 0;

      const clientsGrowth = previousClients > 0 ? ((currentClients - previousClients) / previousClients) * 100 : 0;
      const toursGrowth = previousTours > 0 ? ((currentTours - previousTours) / previousTours) * 100 : 0;

      // Calculate top clients by value
      const topClients = processedClients
        .map(c => ({
          name: c.name,
          email: c.email,
          tours: c.total_tours || 0,
          views: 0, // Would calculate from actual usage data
          value: calculateClientValue(c),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setAnalytics({
        totalClients,
        activeClients,
        totalTours,
        publishedTours,
        totalApiKeys,
        activeApiKeys,
        totalViews,
        avgToursPerClient: totalClients > 0 ? totalTours / totalClients : 0,
        growthRate: {
          clients: clientsGrowth,
          tours: toursGrowth,
          views: 0,
        },
        topClients,
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }

  function calculateClientValue(client: Client): number {
    // Calculate client value based on various factors
    let value = 0;

    // Base value by subscription plan
    const planValues = {
      free: 0,
      starter: 29,
      professional: 99,
      enterprise: 299,
    };
    value += planValues[client.subscription_plan as keyof typeof planValues] || 0;

    // Add value for tours created (engagement)
    value += (client.total_tours || 0) * 5;

    // Add value for active API keys
    value += (client.total_api_keys || 0) * 10;

    return value;
  }

  function exportData(format: 'csv' | 'json') {
    const dataToExport = clients.map(c => ({
      Email: c.email,
      Name: c.name,
      Company: c.company || 'N/A',
      Plan: c.subscription_plan,
      Status: c.subscription_status,
      'Created Date': new Date(c.created_at).toLocaleDateString(),
      'Total Tours': c.total_tours,
      'API Keys': c.total_api_keys,
      'Estimated Value': `$${calculateClientValue(c)}`,
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `narrify-clients-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `narrify-clients-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  }

  const filteredClients = clients
    .filter(c =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'tours':
          return (b.total_tours || 0) - (a.total_tours || 0);
        case 'views':
          return (b.total_views || 0) - (a.total_views || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-error-300 border-t-error-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-neutral-700 font-display font-bold text-lg">Verifying authorization...</p>
          <p className="text-neutral-600 text-sm mt-2 font-medium">Admin access only</p>
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
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
              <Activity className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-neutral-600 font-medium">Complete platform analytics and client data</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-glass border border-neutral-200/50 p-1.5">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg scale-[1.02]'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 90 days' : 'All Time'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                onClick={() => exportData('csv')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 text-sm font-bold text-neutral-700 shadow-sm hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 text-sm font-bold text-neutral-700 shadow-sm hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Clients */}
            <button
              onClick={() => router.push('/dashboard/admin/clients')}
              className="group bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-glass p-6 sm:p-7 text-white text-left hover:shadow-glow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-primary-400/30 animate-fade-up"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  {analytics.growthRate.clients > 0 ? '+' : ''}{analytics.growthRate.clients.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-4xl font-display font-bold mb-2">{analytics.totalClients}</h3>
              <p className="text-primary-100 font-display font-bold text-base">Total Clients</p>
              <p className="text-sm text-primary-200 font-medium mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-200"></span>
                {analytics.activeClients} active • Click to view all
              </p>
            </button>

            {/* Total Tours */}
            <button
              onClick={() => router.push('/dashboard/admin/tours')}
              className="group bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl shadow-glass p-6 sm:p-7 text-white text-left hover:shadow-glow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-accent-400/30 animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  {analytics.growthRate.tours > 0 ? '+' : ''}{analytics.growthRate.tours.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-4xl font-display font-bold mb-2">{analytics.totalTours}</h3>
              <p className="text-accent-100 font-display font-bold text-base">Total Tours Created</p>
              <p className="text-sm text-accent-200 font-medium mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-200"></span>
                {analytics.publishedTours} published • Click to view all
              </p>
            </button>

            {/* API Keys */}
            <button
              onClick={() => router.push('/dashboard/admin/api-keys')}
              className="group bg-gradient-to-br from-success-500 to-success-600 rounded-2xl shadow-glass p-6 sm:p-7 text-white text-left hover:shadow-glow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-success-400/30 animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Key className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  {((analytics.activeApiKeys / Math.max(analytics.totalApiKeys, 1)) * 100).toFixed(0)}% active
                </span>
              </div>
              <h3 className="text-4xl font-display font-bold mb-2">{analytics.totalApiKeys}</h3>
              <p className="text-success-100 font-display font-bold text-base">API Keys Generated</p>
              <p className="text-sm text-success-200 font-medium mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-200"></span>
                {analytics.activeApiKeys} active • Click to view all
              </p>
            </button>

            {/* Total Views */}
            <button
              onClick={() => router.push('/dashboard/admin/requests')}
              className="group bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl shadow-glass p-6 sm:p-7 text-white text-left hover:shadow-glow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-warning-400/30 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8" />
                </div>
                <div className="w-8 h-8 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-display font-bold mb-2">{analytics.totalViews.toLocaleString()}</h3>
              <p className="text-warning-100 font-display font-bold text-base">Total API Requests</p>
              <p className="text-sm text-warning-200 font-medium mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-200"></span>
                {analytics.avgToursPerClient.toFixed(1)} avg tours/client • Click to view
              </p>
            </button>
          </div>
        )}

        {/* Top Clients by Value */}
        {analytics && analytics.topClients.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 mb-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
                Top 10 Clients by Value
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-200/50">
                    <th className="text-left py-4 px-4 text-sm font-display font-bold text-neutral-700">Rank</th>
                    <th className="text-left py-4 px-4 text-sm font-display font-bold text-neutral-700">Client</th>
                    <th className="text-right py-4 px-4 text-sm font-display font-bold text-neutral-700">Tours</th>
                    <th className="text-right py-4 px-4 text-sm font-display font-bold text-neutral-700">Est. Value</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topClients.map((client, index) => (
                    <tr key={client.email} className="border-b border-neutral-100/50 hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-transparent transition-all duration-200 group">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-display font-bold shadow-sm transition-transform group-hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-warning-400 to-warning-500 text-white shadow-warning-200' :
                          index === 1 ? 'bg-gradient-to-br from-neutral-300 to-neutral-400 text-white shadow-neutral-200' :
                          index === 2 ? 'bg-gradient-to-br from-warning-600 to-warning-700 text-white shadow-warning-300' :
                          'bg-gradient-to-br from-accent-100 to-accent-200 text-accent-900 shadow-accent-100'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-display font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{client.name}</p>
                          <p className="text-sm text-neutral-600 font-medium">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200/50 rounded-lg font-display font-bold text-accent-900 text-sm shadow-sm">
                          {client.tours}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-display font-bold text-lg text-success-600 group-hover:text-success-700 transition-colors">${client.value}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Revenue Breakdown
              </h2>
            </div>
            <div className="space-y-3">
              {['free', 'starter', 'professional', 'enterprise'].map((plan, idx) => {
                const planClients = clients.filter(c => c.subscription_plan === plan && c.subscription_status === 'active');
                const planRevenue = planClients.length * (
                  plan === 'starter' ? 29 :
                  plan === 'professional' ? 99 :
                  plan === 'enterprise' ? 299 : 0
                );
                return (
                  <div key={plan} className="flex items-center justify-between p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border-2 border-neutral-200/50 hover:border-success-300/50 hover:shadow-sm transition-all duration-200">
                    <div>
                      <p className="font-display font-bold text-neutral-900 capitalize mb-1">{plan} Plan</p>
                      <p className="text-sm text-neutral-600 font-medium">{planClients.length} active clients</p>
                    </div>
                    <p className="text-lg font-display font-bold text-success-600">${planRevenue}<span className="text-sm text-success-500">/mo</span></p>
                  </div>
                );
              })}
              <div className="border-t-2 border-neutral-200/50 pt-5 mt-5 bg-gradient-to-br from-success-50 to-primary-50 rounded-xl p-4 border-2 border-success-200/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-display font-bold text-neutral-900 text-lg">Total MRR</p>
                  <p className="text-3xl font-display font-bold text-success-600">
                    ${clients
                      .filter(c => c.subscription_status === 'active')
                      .reduce((sum, c) => {
                        const value = c.subscription_plan === 'starter' ? 29 :
                                     c.subscription_plan === 'professional' ? 99 :
                                     c.subscription_plan === 'enterprise' ? 299 : 0;
                        return sum + value;
                      }, 0).toLocaleString()}<span className="text-lg text-success-500">/mo</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-success-700 bg-success-100 px-3 py-1.5 rounded-lg shadow-sm">Projected ARR</span>
                  <p className="text-sm text-success-800 font-display font-bold">
                    ${(clients
                      .filter(c => c.subscription_status === 'active')
                      .reduce((sum, c) => {
                        const value = c.subscription_plan === 'starter' ? 29 :
                                     c.subscription_plan === 'professional' ? 99 :
                                     c.subscription_plan === 'enterprise' ? 299 : 0;
                        return sum + value;
                      }, 0) * 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-6 sm:p-8 border border-neutral-200/50 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Engagement Metrics
              </h2>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-display font-bold text-neutral-700">Clients with Tours</span>
                  <span className="font-display font-bold text-accent-900 bg-gradient-to-r from-accent-50 to-accent-100 px-3 py-1 rounded-lg text-sm shadow-sm">
                    {clients.filter(c => (c.total_tours || 0) > 0).length} / {clients.length}
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full shadow-lg transition-all duration-500"
                    style={{ width: `${(clients.filter(c => (c.total_tours || 0) > 0).length / Math.max(clients.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-display font-bold text-neutral-700">Clients with API Keys</span>
                  <span className="font-display font-bold text-success-900 bg-gradient-to-r from-success-50 to-success-100 px-3 py-1 rounded-lg text-sm shadow-sm">
                    {clients.filter(c => (c.total_api_keys || 0) > 0).length} / {clients.length}
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-success-500 to-success-600 h-3 rounded-full shadow-lg transition-all duration-500"
                    style={{ width: `${(clients.filter(c => (c.total_api_keys || 0) > 0).length / Math.max(clients.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-display font-bold text-neutral-700">Active Subscriptions</span>
                  <span className="font-display font-bold text-primary-900 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1 rounded-lg text-sm shadow-sm">
                    {clients.filter(c => c.subscription_status === 'active').length} / {clients.length}
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full shadow-lg transition-all duration-500"
                    style={{ width: `${(clients.filter(c => c.subscription_status === 'active').length / Math.max(clients.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t-2 border-neutral-200/50 pt-5 mt-5 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl p-4 border-2 border-accent-200/50">
                <p className="text-sm font-display font-bold text-accent-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Average Tours per Client
                </p>
                <p className="text-3xl font-display font-bold text-accent-900">
                  {analytics ? analytics.avgToursPerClient.toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Clients Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass border border-neutral-200/50 overflow-hidden animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="p-6 sm:p-8 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
                All Clients <span className="text-primary-600">({filteredClients.length})</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-neutral-900 placeholder:text-neutral-400 shadow-sm"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-neutral-900 bg-white shadow-sm"
                >
                  <option value="created">Sort by: Date Created</option>
                  <option value="name">Sort by: Name</option>
                  <option value="tours">Sort by: Tours</option>
                  <option value="views">Sort by: Views</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-100 to-neutral-50 border-b-2 border-neutral-200/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Client</th>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Company</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Plan</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Tours</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">API Keys</th>
                  <th className="text-center py-4 px-6 text-sm font-display font-bold text-neutral-700">Value</th>
                  <th className="text-left py-4 px-6 text-sm font-display font-bold text-neutral-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-neutral-100/50 hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-transparent transition-all duration-200 group">
                    <td className="py-5 px-6">
                      <div>
                        <p className="font-display font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{client.name}</p>
                        <p className="text-sm text-neutral-600 font-medium">{client.email}</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-neutral-700 font-medium">{client.company || '-'}</td>
                    <td className="py-5 px-6">
                      <span className="inline-flex px-3 py-1.5 text-xs font-display font-bold rounded-lg capitalize bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 border border-primary-300/50 shadow-sm">
                        {client.subscription_plan}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-bold rounded-lg shadow-sm ${
                        client.subscription_status === 'active'
                          ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-900 border border-success-300/50'
                          : 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-300/50'
                      }`}>
                        {client.subscription_status === 'active' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
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
                      <span className="font-display font-bold text-lg text-success-600 group-hover:text-success-700 transition-colors">
                        ${calculateClientValue(client)}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-sm text-neutral-600 font-medium">
                      {new Date(client.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
