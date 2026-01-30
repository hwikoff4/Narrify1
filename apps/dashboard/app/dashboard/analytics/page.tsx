'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Users, MessageCircle, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';

interface AnalyticsEvent {
  id: string;
  type: string;
  tour_id: string;
  created_at: string;
  metadata: any;
}

interface Tour {
  id: string;
  name: string;
}

interface TimeSeriesData {
  date: string;
  views: number;
  completions: number;
  questions: number;
}

interface TourPerformance {
  name: string;
  views: number;
  completions: number;
  questions: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [tourPerformance, setTourPerformance] = useState<TourPerformance[]>([]);

  const [totalViews, setTotalViews] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [avgCompletionRate, setAvgCompletionRate] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      // Get date range
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Load events
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('client_id', client?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Load tours
      const { data: toursData } = await supabase
        .from('tours')
        .select('id, name')
        .eq('client_id', client?.id);

      setEvents(eventsData || []);
      setTours(toursData || []);

      // Process analytics
      if (eventsData && toursData) {
        processAnalytics(eventsData, toursData);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  function processAnalytics(events: AnalyticsEvent[], tours: Tour[]) {
    // Calculate totals
    const views = events.filter((e) => e.type === 'tour_start').length;
    const completions = events.filter((e) => e.type === 'tour_complete').length;
    const questions = events.filter((e) => e.type === 'question_asked').length;

    setTotalViews(views);
    setTotalCompletions(completions);
    setTotalQuestions(questions);
    setAvgCompletionRate(views > 0 ? completions / views : 0);

    // Time series data (group by day)
    const timeSeriesMap = new Map<string, { views: number; completions: number; questions: number }>();

    events.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];

      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { views: 0, completions: 0, questions: 0 });
      }

      const dayData = timeSeriesMap.get(date)!;
      if (event.type === 'tour_start') dayData.views++;
      if (event.type === 'tour_complete') dayData.completions++;
      if (event.type === 'question_asked') dayData.questions++;
    });

    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setTimeSeriesData(timeSeries);

    // Tour performance
    const tourStats = tours.map((tour) => {
      const tourEvents = events.filter((e) => e.tour_id === tour.id);
      const tourViews = tourEvents.filter((e) => e.type === 'tour_start').length;
      const tourCompletions = tourEvents.filter((e) => e.type === 'tour_complete').length;
      const tourQuestions = tourEvents.filter((e) => e.type === 'question_asked').length;

      return {
        name: tour.name,
        views: tourViews,
        completions: tourCompletions,
        questions: tourQuestions,
        completionRate: tourViews > 0 ? tourCompletions / tourViews : 0,
      };
    }).sort((a, b) => b.views - a.views);

    setTourPerformance(tourStats);
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-neutral-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
              Analytics
            </h1>
            <p className="text-lg text-neutral-600">
              Track tour performance and user engagement
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200/50 shadow-glass px-4 py-2.5">
            <Calendar className="w-5 h-5 text-primary-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-semibold text-neutral-900 focus:outline-none cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-up p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Total Views</p>
              <p className="text-3xl font-display font-bold text-neutral-900">{totalViews}</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-up p-6" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-success-50 to-success-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Completions</p>
              <p className="text-3xl font-display font-bold text-neutral-900">{totalCompletions}</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-up p-6" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-50 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Questions</p>
              <p className="text-3xl font-display font-bold text-neutral-900">{totalQuestions}</p>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-up p-6" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-warning-50 to-warning-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-600 mb-1">Avg Completion</p>
              <p className="text-3xl font-display font-bold text-neutral-900">
                {(avgCompletionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
            Engagement Over Time
          </h2>

          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completions"
                />
                <Line
                  type="monotone"
                  dataKey="questions"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Questions"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No engagement data yet"
              description="Analytics will appear here once your tours start receiving views. Try creating and publishing your first tour to see engagement metrics."
            />
          )}
        </div>

        {/* Tour Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass p-6">
            <h2 className="text-xl font-display font-bold text-neutral-900 mb-6">
              Tour Performance
            </h2>

            {tourPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tourPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="completions" fill="#10b981" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No performance data"
                description="Tour performance metrics will be displayed here once you create tours and they receive engagement."
              />
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass p-6">
            <h2 className="text-xl font-display font-bold text-neutral-900 mb-6">
              Views by Tour
            </h2>

            {tourPerformance.filter(t => t.views > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tourPerformance.filter(t => t.views > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.views}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="views"
                  >
                    {tourPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={PieChartIcon}
                title="No views yet"
                description="Tour view distribution will be shown here once your tours start receiving traffic."
              />
            )}
          </div>
        </div>

        {/* Tour Detailed Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass overflow-hidden">
          <div className="p-6 border-b border-neutral-200/50">
            <h2 className="text-2xl font-display font-bold text-neutral-900">
              Tour Details
            </h2>
          </div>

          {tourPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Tour Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Completions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/50">
                  {tourPerformance.map((tour, index) => (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                        {tour.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 font-medium">
                        {tour.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 font-medium">
                        {tour.completions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 font-medium">
                        {tour.questions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            tour.completionRate > 0.7
                              ? 'bg-success-100 text-success-800'
                              : tour.completionRate > 0.4
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-error-100 text-error-800'
                          }`}
                        >
                          {(tour.completionRate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No tours created yet"
              description="Create your first tour to start tracking detailed analytics and performance metrics."
            />
          )}
        </div>
      </div>
    </div>
  );
}
