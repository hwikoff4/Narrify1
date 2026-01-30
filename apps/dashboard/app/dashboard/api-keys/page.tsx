'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateApiKey } from '@/lib/utils';
import { Key, Copy, Plus, Trash2, Check, AlertTriangle, Globe, X } from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  active: boolean;
  created_at: string;
  last_used_at?: string;
  domains?: string[];
}

export default function ApiKeysPage() {
  const supabase = createClient();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingDomains, setEditingDomains] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('client_id', client?.id)
        .order('created_at', { ascending: false });

      setKeys(data || []);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      setMessage('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const apiKey = generateApiKey();

      const { error } = await supabase.from('api_keys').insert({
        client_id: client?.id,
        key: apiKey,
        name: newKeyName,
        active: true,
      });

      if (error) throw error;

      setGeneratedKey(apiKey);
      setNewKeyName('');
      await loadKeys();
    } catch (err: any) {
      setMessage(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(keyId: string, currentActive: boolean) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ active: !currentActive })
        .eq('id', keyId);

      if (error) throw error;

      await loadKeys();
      setMessage(`API key ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to update API key');
    }
  }

  async function handleDelete(keyId: string) {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);

      if (error) throw error;

      await loadKeys();
      setDeleteConfirm(null);
      setMessage('API key deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete API key');
    }
  }

  async function handleAddDomain(keyId: string, currentDomains: string[] = []) {
    if (!newDomain.trim()) {
      setMessage('Please enter a valid domain');
      return;
    }

    // Basic domain validation
    const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainPattern.test(newDomain.trim())) {
      setMessage('Please enter a valid domain (e.g., example.com or subdomain.example.com)');
      return;
    }

    try {
      const updatedDomains = [...currentDomains, newDomain.trim().toLowerCase()];
      const { error } = await supabase
        .from('api_keys')
        .update({ domains: updatedDomains })
        .eq('id', keyId);

      if (error) throw error;

      setNewDomain('');
      await loadKeys();
      setMessage('Domain added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to add domain');
    }
  }

  async function handleRemoveDomain(keyId: string, currentDomains: string[], domainToRemove: string) {
    try {
      const updatedDomains = currentDomains.filter(d => d !== domainToRemove);
      const { error } = await supabase
        .from('api_keys')
        .update({ domains: updatedDomains })
        .eq('id', keyId);

      if (error) throw error;

      await loadKeys();
      setMessage('Domain removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to remove domain');
    }
  }

  function copyToClipboard(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function maskKey(key: string): string {
    const prefix = key.substring(0, 11); // "nr_live_" + first 3 chars
    return `${prefix}${'*'.repeat(20)}...`;
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-neutral-600 font-medium">Loading API keys...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
              API Keys
            </h1>
            <p className="text-lg text-neutral-600">
              Manage API keys for accessing Narrify services
            </p>
          </div>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Generate Key</span>
          </button>
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
                <Check className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-primary-50/50 border border-primary-200/50 rounded-2xl p-6 sm:p-8 mb-8 shadow-glass">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-primary-900 mb-3">
                API Key Security
              </h3>
              <div className="text-sm text-primary-800 space-y-3">
                <p className="font-semibold">✅ Your API keys are designed to be used in client-side code (like your website's HTML)</p>
                <p className="font-medium">This is safe because:</p>
                <ul className="list-disc list-inside ml-2 space-y-1.5">
                  <li>Keys only allow reading published tours - not creating, editing, or deleting</li>
                  <li>You can restrict keys to specific domains using the domain whitelist below</li>
                  <li>Each key is scoped to your account only - no access to other users' data</li>
                  <li>We track usage and alert you to suspicious activity</li>
                </ul>
                <p className="mt-3 pt-3 border-t border-primary-200 font-semibold">🔒 Best Practices:</p>
                <ul className="list-disc list-inside ml-2 space-y-1.5">
                  <li>Add your website domains to the whitelist for each key</li>
                  <li>Deactivate keys you're not using</li>
                  <li>Delete keys when you're done with them</li>
                  <li>Monitor the "Last Used" date to detect unauthorized use</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        {keys.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-neutral-200/50 shadow-glass p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Key className="w-10 h-10 text-neutral-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
                No API keys yet
              </h2>
              <p className="text-neutral-600 mb-8 text-lg">
                Generate your first API key to start using Narrify
              </p>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                <span>Generate First Key</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {keys.map((key) => (
              <div
                key={key.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-glass hover:shadow-xl transition-all duration-300 p-6 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                        <Key className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-bold text-neutral-900">
                          {key.name}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                          key.active
                            ? 'bg-gradient-to-r from-success-500 to-success-600 text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {key.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <code className="flex-1 text-sm font-mono bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200/50 text-neutral-900 shadow-sm">
                        {maskKey(key.key)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="p-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Copy to clipboard"
                      >
                        {copiedId === key.id ? (
                          <Check className="w-5 h-5 text-success-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-neutral-600 mb-6 font-medium">
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          Last used: {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Domain Whitelist */}
                    <div className="border-t border-neutral-200/50 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-100 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-accent-600" />
                          </div>
                          <h4 className="text-base font-display font-bold text-neutral-900">Allowed Domains</h4>
                        </div>
                        <button
                          onClick={() => setEditingDomains(editingDomains === key.id ? null : key.id)}
                          className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold transition-all duration-200"
                        >
                          {editingDomains === key.id ? 'Done' : 'Manage'}
                        </button>
                      </div>

                      {/* Domain List */}
                      {key.domains && key.domains.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {key.domains.map((domain) => (
                            <div
                              key={domain}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-accent-50 to-accent-100 text-accent-900 rounded-lg text-sm font-semibold shadow-sm"
                            >
                              <span>{domain}</span>
                              {editingDomains === key.id && (
                                <button
                                  onClick={() => handleRemoveDomain(key.id, key.domains || [], domain)}
                                  className="text-error-600 hover:text-error-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-warning-50 border border-warning-200/50 rounded-xl p-4 mb-3">
                          <p className="text-sm text-warning-800 font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            No domains configured - this key will work on any domain (less secure)
                          </p>
                        </div>
                      )}

                      {/* Add Domain Form */}
                      {editingDomains === key.id && (
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="text"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddDomain(key.id, key.domains);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddDomain(key.id, key.domains)}
                            className="px-5 py-2.5 text-sm bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-300 hover:scale-105"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={key.active}
                        onChange={() => handleToggleActive(key.id, key.active)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-neutral-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-success-500 peer-checked:to-success-600 shadow-sm group-hover:shadow-md transition-shadow"></div>
                    </label>

                    {deleteConfirm === key.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-300 hover:scale-105"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 text-sm border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(key.id)}
                        className="p-2.5 text-error-600 hover:bg-error-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                        title="Delete key"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Key Modal */}
        {showNewKeyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-neutral-200/50 animate-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <Key className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-neutral-900">
                  {generatedKey ? 'API Key Created' : 'Generate New API Key'}
                </h2>
              </div>

              {generatedKey ? (
                <div>
                  <div className="bg-gradient-to-r from-warning-50 to-warning-100 border-2 border-warning-300/50 rounded-2xl p-6 mb-6 shadow-glass">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-warning-900 font-bold mb-1">
                          Save this key now!
                        </p>
                        <p className="text-xs text-warning-800 font-medium">
                          For security reasons, you won't be able to see it again
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-neutral-900 mb-3">
                      Your API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-neutral-50 px-4 py-3 rounded-xl border-2 border-neutral-200/50 break-all text-neutral-900 shadow-sm">
                        {generatedKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedKey, 'new')}
                        className="p-3 text-neutral-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {copiedId === 'new' ? (
                          <Check className="w-5 h-5 text-success-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setGeneratedKey(null);
                    }}
                    className="w-full px-6 py-4 bg-gradient-primary text-white rounded-2xl hover:shadow-glow-lg font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-neutral-900 mb-3">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 font-medium shadow-sm"
                      placeholder="Production Key"
                      autoFocus
                    />
                    <p className="text-xs text-neutral-600 mt-2 font-medium">
                      Give your key a descriptive name to identify its purpose
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false);
                        setNewKeyName('');
                      }}
                      className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={creating}
                      className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:scale-[1.02]"
                    >
                      {creating ? 'Generating...' : 'Generate Key'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
