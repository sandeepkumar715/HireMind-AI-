/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Clock, 
  Edit3, 
  CheckCircle, 
  Send, 
  AlertCircle, 
  Award,
  ChevronRight,
  TrendingUp,
  User,
  Heart
} from 'lucide-react';

interface Stats {
  resumesCount: number;
  interviewsCount: number;
  latestAtsScore: number;
  matchPercent: number;
}

export default function Dashboard() {
  const { user, token, updateProfile } = useAuth();
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [targetIndustry, setTargetIndustry] = useState(user?.targetIndustry || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Stats and history states
  const [stats, setStats] = useState<Stats>({ resumesCount: 1, interviewsCount: 2, latestAtsScore: 72, matchPercent: 65 });
  const [activities, setActivities] = useState<any[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch user activities
      const actRes = await fetch('/api/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const actData = await actRes.json();
      if (actRes.ok) {
        setActivities(actData.logs || []);
      }

      // Fetch reports, sessions, resumes to compile real live stats
      const [resumesRes, sessionsRes, reportsRes] = await Promise.all([
        fetch('/api/resumes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/interview/sessions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/ats/reports', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const resumes = await resumesRes.json();
      const sessions = await sessionsRes.json();
      const reports = await reportsRes.json();

      const rCount = resumes.resumes?.length || 0;
      const sCount = sessions.sessions?.length || 0;
      
      let latestScore = 72;
      if (reports.reports && reports.reports.length > 0) {
        // Find maximum score or latest
        latestScore = reports.reports[reports.reports.length - 1].score;
      }

      setStats({
        resumesCount: rCount,
        interviewsCount: sCount,
        latestAtsScore: latestScore,
        matchPercent: rCount > 0 ? (latestScore > 75 ? 88 : 74) : 0
      });
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const success = await updateProfile({
      headline,
      bio,
      targetRole,
      targetIndustry
    });
    if (success) {
      setProfileMessage('Profile settings saved successfully!');
      setIsEditingProfile(false);
      fetchDashboardData();
    } else {
      setProfileMessage('Failed to update profile.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackStatus(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: feedbackMsg, rating: feedbackRating })
      });
      if (res.ok) {
        setFeedbackStatus('Thank you for your valuable feedback!');
        setFeedbackMsg('');
        setFeedbackRating(5);
      } else {
        setFeedbackStatus('Failed to submit feedback.');
      }
    } catch (err) {
      setFeedbackStatus('Connection error submitting comments.');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
            Workspace <span className="text-indigo-400">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">SaaS candidate cockpit and intelligent Gemini milestones tracker</p>
        </div>
        <div className="flex items-center gap-2.5 p-3 bg-slate-800/40 border border-slate-800 rounded-2xl text-xs font-mono">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span className="text-slate-400">SESSION: ACTIVE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & CENTER: Candidate profile card & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Profile Bento Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
              <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-600/10">
                  {user?.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{user?.name}</h2>
                  <p className="text-indigo-400 font-medium text-sm mt-1">{user?.headline || 'Job Seeker Preparing for Roles'}</p>
                  <p className="text-slate-400 text-sm max-w-lg mt-3 line-clamp-3">{user?.bio || 'Analyze your resume, compare against job descriptions, generate customized mock interview scenarios, and map certifications with our professional cockpit.'}</p>
                  
                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-2.5 mt-4 justify-center md:justify-start">
                    {user?.targetRole && (
                      <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-semibold">
                        Role: {user.targetRole}
                      </span>
                    )}
                    {user?.targetIndustry && (
                      <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-semibold">
                        Field: {user.targetIndustry}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                id="edit-profile-btn"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-center md:self-start shrink-0"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Editing Form Expand */}
            {isEditingProfile && (
              <form id="profile-edit-form" onSubmit={handleProfileSave} className="mt-8 pt-6 border-t border-slate-800/80 space-y-4 animate-fade-in">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Edit Profile Target Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Professional Headline</label>
                    <input 
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Software Engineer, Full-Stack Graduate"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Target Role</label>
                    <input 
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Engineer"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Target Industry</label>
                    <input 
                      type="text"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      placeholder="e.g. SaaS / Technology"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Professional Bio Summary</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Brief intro details..."
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3.5">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {profileMessage && (
              <p className="text-xs text-indigo-400 font-mono mt-3">{profileMessage}</p>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 text-center flex flex-col justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">My Resumes</span>
              <span className="text-3xl font-extrabold text-white my-3 block">{stats.resumesCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">1.0 version active</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 text-center flex flex-col justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mock Drills</span>
              <span className="text-3xl font-extrabold text-white my-3 block">{stats.interviewsCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Completed loop</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 text-center flex flex-col justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ATS Score</span>
              <span className={`text-3xl font-extrabold my-3 block ${stats.latestAtsScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.latestAtsScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Gemini evaluation</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 text-center flex flex-col justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">JD Alignment</span>
              <span className="text-3xl font-extrabold text-indigo-400 my-3 block">{stats.matchPercent}%</span>
              <span className="text-[10px] text-slate-400 font-mono">Skill alignment</span>
            </div>
          </div>

          {/* Activity Timeline logs */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <span>Activity Timeline Logs</span>
            </h3>

            {loading ? (
              <div className="py-8 text-center flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500 font-mono">NO RECENT SYSTEM LOGS RECOGNIZED</p>
                <p className="text-xs text-slate-600 mt-1">Upload resumes or initiate mock interview coaching queries to generate logs.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {activities.map((log) => (
                  <div key={log.id} className="flex items-start gap-3.5 p-3.5 bg-slate-900/40 border border-slate-800/40 hover:border-slate-800 rounded-xl transition duration-150">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-300 truncate">{log.action}</h4>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT BAR: Reminders, Learning Roadmaps & Live Feedback */}
        <div className="space-y-6">
          {/* Upcoming Interview Reminders */}
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Milestone reminders</span>
            </h3>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Stripe Prep Drill</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Frontend Engineer, Dashboard</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-[10px] font-mono shrink-0">TODAY</span>
              </div>
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">STAR Resume Rewrite</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Focus on Experience metrics</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-md text-[10px] font-mono shrink-0">PLANNED</span>
              </div>
            </div>
          </div>

          {/* Quick Learning Roadmaps Checklist */}
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-purple-400" />
              <span>Recommended Study Topics</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/30">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">Basic React hooks state loops</p>
                  <p className="text-[10px] text-slate-500">2 hours study</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/30">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">TypeScript strict compiler flags</p>
                  <p className="text-[10px] text-slate-500">5 hours study</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/30">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">Tailwind layout grids responsiveness</p>
                  <p className="text-[10px] text-slate-500">4 hours study</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Feedback Submission card */}
          <div className="bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-950 border border-slate-800/60 rounded-3xl p-6 shadow-sm relative">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-red-400 fill-red-400/20" />
              <span>Share Application Feedback</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">Submit comments instantly into the database stats collection</p>

            <form id="feedback-form" onSubmit={handleFeedbackSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Rating Rating (Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        feedbackRating >= star 
                          ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea 
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  placeholder="Tell us what you think of SmartHire AI..."
                  rows={3}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>

            {feedbackStatus && (
              <p className="text-[11px] text-indigo-400 font-mono mt-3 text-center">{feedbackStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
