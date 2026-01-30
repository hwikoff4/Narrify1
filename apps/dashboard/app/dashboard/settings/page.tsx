'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, User, Building2, CreditCard, Bell, Shield, Trash2 } from 'lucide-react';

interface ClientData {
  id: string;
  email: string;
  name: string;
  company?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [client, setClient] = useState<ClientData | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadClientData();
  }, []);

  async function loadClientData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single();

      if (clientData) {
        setClient(clientData);
        setName(clientData.name || '');
        setCompany(clientData.company || '');
        setEmail(clientData.email || '');
      }
    } catch (err) {
      console.error('Failed to load client data:', err);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name,
          company,
        })
        .eq('id', client?.id);

      if (error) throw error;

      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
      await loadClientData();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-neutral-600 font-medium">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
            Settings
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your account settings and preferences
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 px-6 py-4 rounded-xl shadow-glass animate-fade-down ${
              message.includes('success')
                ? 'bg-success-50 text-success-800 border border-success-200/50'
                : 'bg-error-50 text-error-800 border border-error-200/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.includes('success') ? (
                <Save className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 animate-fade-up">
            <div className="p-6 sm:p-8 border-b border-neutral-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-neutral-900">Profile Information</h2>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-neutral-900 mb-3">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 font-medium shadow-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-neutral-900 mb-3">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed font-medium shadow-sm"
                />
                <p className="text-xs text-neutral-600 mt-2 font-medium flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-bold text-neutral-900 mb-3">
                  Company Name <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 font-medium shadow-sm"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 font-semibold hover:scale-[1.02]"
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
              </div>
            </form>
          </div>

          {/* Subscription */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-6 sm:p-8 border-b border-neutral-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-neutral-900">Subscription</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3">Current Plan</label>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-bold capitalize shadow-lg">
                      {client?.subscription_plan || 'Free'}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize shadow-sm ${
                        client?.subscription_status === 'active'
                          ? 'bg-gradient-to-r from-success-500 to-success-600 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {client?.subscription_status || 'Active'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3">Member Since</label>
                  <p className="text-neutral-900 font-medium text-lg">
                    {client?.created_at ? new Date(client.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    className="px-6 py-3 bg-neutral-100 text-neutral-400 rounded-xl transition font-semibold cursor-not-allowed"
                    disabled
                  >
                    Upgrade Plan (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 sm:p-8 border-b border-neutral-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-neutral-900">Notifications</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 mb-1">Email Notifications</h3>
                    <p className="text-sm text-neutral-600 font-medium">Receive email updates about your tours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-neutral-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-success-500 peer-checked:to-success-600 shadow-sm opacity-60"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 mb-1">Analytics Reports</h3>
                    <p className="text-sm text-neutral-600 font-medium">Weekly summary of your tour performance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-neutral-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-success-500 peer-checked:to-success-600 shadow-sm opacity-60"></div>
                  </label>
                </div>
                <div className="bg-primary-50/50 border border-primary-200/50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-primary-800 font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notification preferences coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-6 sm:p-8 border-b border-neutral-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-neutral-900">Security</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-neutral-900 mb-2">Password</h3>
                  <p className="text-sm text-neutral-600 mb-4 font-medium">
                    Manage your password through your authentication provider
                  </p>
                  <button
                    className="px-6 py-3 bg-neutral-100 text-neutral-400 rounded-xl transition font-semibold cursor-not-allowed"
                    disabled
                  >
                    Change Password (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gradient-to-br from-error-50 to-warning-50 rounded-2xl border-2 border-error-300/50 shadow-glass hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 sm:p-8 border-b border-error-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-error-900">Danger Zone</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-neutral-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-neutral-700 mb-4 font-semibold">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    className="px-6 py-3 bg-neutral-100 text-neutral-400 rounded-xl transition font-bold cursor-not-allowed"
                    disabled
                  >
                    Delete Account (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
