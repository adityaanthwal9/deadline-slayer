'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function GoogleCalendarPage() {
  const [authUrl, setAuthUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; total: number; errors?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get OAuth URL and check if already connected
    fetch('/api/calendar')
      .then(r => r.json())
      .then(data => {
        setAuthUrl(data.auth_url || '');
        setConnected(data.connected || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const syncToCalendar = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      if (data.synced !== undefined) {
        setSyncResult({ synced: data.synced, total: data.total, errors: data.errors });
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.2)' }}>
          <CalendarDays size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Google Calendar</h1>
          <p className="text-[#9898B0] text-sm">Sync your deadlines directly to Google Calendar</p>
        </div>
      </div>

      {loading ? (
        <div className="ds-card p-10 text-center">
          <Loader2 size={24} className="animate-spin text-blue-400 mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection status */}
          <div className="ds-card p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${connected ? 'bg-green-500/20' : 'bg-white/5'}`}>
                {connected
                  ? <CheckCircle size={22} className="text-green-400" />
                  : <CalendarDays size={22} className="text-[#5C5C74]" />
                }
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {connected ? 'Connected to Google Calendar' : 'Not connected'}
                </div>
                <div className="text-sm text-[#9898B0] mt-0.5">
                  {connected
                    ? 'Your deadlines will sync as Google Calendar events'
                    : 'Connect to sync all task deadlines with color-coded risk levels'}
                </div>
              </div>
              {!connected && authUrl && (
                <a href={authUrl} className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
                  <ExternalLink size={14} />
                  Connect
                </a>
              )}
            </div>
          </div>

          {/* What gets synced */}
          <div className="ds-card p-5">
            <div className="text-xs text-[#5C5C74] font-medium mb-4">WHAT GETS SYNCED</div>
            <div className="space-y-3">
              {[
                { color: 'bg-red-500', label: 'Critical risk tasks', desc: 'Red in Google Calendar' },
                { color: 'bg-orange-500', label: 'High risk tasks', desc: 'Orange in Google Calendar' },
                { color: 'bg-green-500', label: 'Low/medium risk tasks', desc: 'Green in Google Calendar' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-[#5C5C74]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              Each event is created with a 1-hour reminder and a 24-hour reminder. AI recommendation is included in the event description.
            </div>
          </div>

          {/* Sync button */}
          {connected && (
            <div className="ds-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">Sync Now</div>
                  <div className="text-sm text-[#9898B0]">Push all active task deadlines to Google Calendar</div>
                </div>
                <button
                  onClick={syncToCalendar}
                  disabled={syncing}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  {syncing ? 'Syncing...' : 'Sync Deadlines'}
                </button>
              </div>

              {syncResult && (
                <div className={`p-3 rounded-lg border text-sm ${
                  syncResult.errors?.length
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-green-500/10 border-green-500/20 text-green-300'
                }`}>
                  <div className="font-medium mb-1">
                    ✓ Synced {syncResult.synced}/{syncResult.total} tasks to Google Calendar
                  </div>
                  {syncResult.errors?.length ? (
                    <div className="text-xs mt-1 space-y-0.5">
                      {syncResult.errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Setup instructions if not connected */}
          {!connected && (
            <div className="ds-card p-5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-300 font-medium">Requires Google OAuth setup</div>
              </div>
              <div className="text-xs text-[#9898B0] space-y-1">
                <div>1. Go to <strong className="text-white">console.cloud.google.com</strong></div>
                <div>2. Create project → Enable <strong className="text-white">Google Calendar API</strong></div>
                <div>3. OAuth 2.0 → Add redirect URI: <code className="text-amber-300">YOUR_URL/api/calendar/callback</code></div>
                <div>4. Add <code className="text-amber-300">GOOGLE_CLIENT_ID</code> and <code className="text-amber-300">GOOGLE_CLIENT_SECRET</code> to .env.local</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
