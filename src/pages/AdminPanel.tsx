/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  Activity, 
  Sparkles, 
  Trash2, 
  UserCheck, 
  Calendar, 
  Star, 
  Mail,
  Search,
  AlertCircle
} from 'lucide-react';

export default function AdminPanel() {
  const { token } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminMetrics();
  }, [token]);

  const fetchAdminMetrics = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const [usersRes, feedbacksRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/feedback', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/activities', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!usersRes.ok || !feedbacksRes.ok || !activitiesRes.ok) {
        setErrorMsg('Unauthorized or failed to load administrative telemetry.');
        return;
      }

      const usersData = await usersRes.json();
      const feedbacksData = await feedbacksRes.json();
      const activitiesData = await activitiesRes.json();

      setUsers(usersData.users || []);
      setFeedbacks(feedbacksData.feedbacks || []);
      setActivities(activitiesData.activities || []);
    } catch (err) {
      setErrorMsg('Network error connecting to administrative API.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = activities.filter(log => 
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Administrative <span className="text-purple-400">Control Panel</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">SaaS telemetry overview, candidate profile directories, feedback trackers, and system audit logs</p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">STREAMING TELEMETRY STACKS...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Quick High-Level telemetry counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Candidate Registrations</span>
                <span className="text-3xl font-extrabold text-white mt-2 block">{users.length}</span>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Candidate Feedbacks</span>
                <span className="text-3xl font-extrabold text-white mt-2 block">{feedbacks.length}</span>
              </div>
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Heart className="h-6 w-6 fill-indigo-400/10" />
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Audit events</span>
                <span className="text-3xl font-extrabold text-white mt-2 block">{activities.length}</span>
              </div>
              <div className="h-12 w-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Users Directory & Feedbacks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidates User list */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2.5 border-b border-slate-800/50 flex items-center gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-purple-400" />
                  <span>Candidates database directory</span>
                </h3>

                <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-300 truncate">{u.name}</h4>
                          <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded-md border ${
                            u.role === 'Admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {u.role || 'User'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{u.email}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-1.5 font-sans">Headline: {u.headline || 'Not Specified'}</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono text-right shrink-0">
                        <span className="block font-semibold">{u.targetRole || 'General Job Seeker'}</span>
                        <span className="block text-[9px] mt-1 text-slate-600">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate Feedback boards */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2.5 border-b border-slate-800/50 flex items-center gap-2">
                  <Heart className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400/10" />
                  <span>Candidate Feedbacks Archive</span>
                </h3>

                <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-500 font-mono border border-dashed border-slate-850 rounded-2xl">
                      NO FEEDBACK SUBMISSIONS DETECTED
                    </div>
                  ) : (
                    feedbacks.map((f) => (
                      <div key={f.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-slate-500 font-mono font-bold truncate">UID: {f.userId}</span>
                          
                          <div className="flex gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed">"{f.message}"</p>
                        <span className="text-[9px] text-slate-600 font-mono block text-right">
                          {new Date(f.timestamp || Date.now()).toLocaleDateString()} @ {new Date(f.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Real-time Audit logs */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <span>System Chronological Audit Logs</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-500 mt-2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs by keyword..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl py-1.5 pl-9 pr-3 text-slate-300 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 font-mono">
                <thead className="bg-slate-900 text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-850">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Candidate Reference</th>
                    <th className="p-4">Log details</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4 font-bold text-purple-400">{log.action}</td>
                      <td className="p-4 text-slate-500 truncate max-w-[120px]">{log.userId}</td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">{log.details}</td>
                      <td className="p-4 text-slate-500 text-right">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="p-10 text-center text-xs text-slate-500 font-mono">
                  NO AUDIT EVENTS MATCH THE SPECIFIED FILTERS.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
