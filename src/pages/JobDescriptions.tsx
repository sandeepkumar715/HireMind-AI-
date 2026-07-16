/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  PlusCircle, 
  Calendar, 
  Building, 
  MapPin, 
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function JobDescriptions() {
  const { token } = useAuth();
  
  const [jds, setJds] = useState<any[]>([]);
  const [selectedJd, setSelectedJd] = useState<any | null>(null);
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [url, setUrl] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJds();
  }, [token]);

  const fetchJds = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJds(data.jobs || []);
        if (data.jobs && data.jobs.length > 0) {
          setSelectedJd(data.jobs[data.jobs.length - 1]);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve JDs list', err);
    }
  };

  const handleSampleFill = () => {
    setCompanyName('Stripe');
    setJobTitle('Frontend Engineer, Dashboard');
    setRawText(`Stripe is looking for a Frontend Software Engineer to join our Dashboard team. 

Minimum Requirements:
- Experience building web applications using React and TypeScript.
- Strong proficiency in modern CSS frameworks like Tailwind CSS.
- Experience with custom chart visualization tools like D3.js or Recharts.
- High attention to detail and a passion for crafting elegant user interfaces.`);
    setUrl('https://stripe.com/jobs');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle || !rawText) {
      setErrorMsg('Please enter company name, job title, and description text.');
      return;
    }
    setErrorMsg(null);
    setStatusMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyName, jobTitle, rawText, url })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('Job description parsed and saved successfully!');
        setCompanyName('');
        setJobTitle('');
        setRawText('');
        setUrl('');
        setIsCreating(false);
        fetchJds();
      } else {
        setErrorMsg(data.error || 'Failed to save job description.');
      }
    } catch (err) {
      setErrorMsg('Network error saving job description.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
            Target <span className="text-indigo-400">Jobs</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Paste job requirements, map corporate roles, and save profiles for comparative analysis</p>
        </div>
        <button
          id="add-job-toggle"
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{isCreating ? 'View Target Jobs' : 'Track New Job'}</span>
        </button>
      </div>

      {isCreating ? (
        /* CREATE JOB FORM */
        <div className="max-w-3xl bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-5 mx-auto animate-fade-in">
          <h3 className="text-base font-bold text-slate-200">Track Targeted Opportunity</h3>
          
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="create-job-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Company / Organization</label>
                <div className="relative">
                  <Building className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
                  <input 
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, Google"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Target Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
                  <input 
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Original Posting Link (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
                <input 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://careers.stripe.com/jobs/frontend-engineer"
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Job Description Text requirements</label>
              <textarea 
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full job responsibilities, candidate profile expectations, and technical stack details here..."
                rows={10}
                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none resize-none font-mono"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSampleFill}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                ⚡ Load Sample Stripe JD
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Indexing requirements...' : 'Track Opportunity'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* TARGET JOBS DISPLAY */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Tracked jobs checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tracked opportunities</h3>
            
            {jds.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                <Briefcase className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-semibold">No tracked jobs found</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-xs text-indigo-400 hover:underline mt-2 font-semibold"
                >
                  Add targeted job role
                </button>
              </div>
            ) : (
              jds.map((jd) => (
                <div 
                  key={jd.id}
                  onClick={() => setSelectedJd(jd)}
                  className={`p-4 border rounded-2xl cursor-pointer transition ${
                    selectedJd?.id === jd.id 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <h4 className="text-xs font-bold truncate">{jd.jobTitle}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5 font-medium">
                    <Building className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{jd.companyName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(jd.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ACTIVE JD DETAIL PREVIEW */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
            {selectedJd ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/50">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">{selectedJd.jobTitle}</h3>
                    <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold mt-1">
                      <Building className="h-4 w-4 shrink-0" />
                      <span>{selectedJd.companyName}</span>
                    </div>
                  </div>
                  {selectedJd.url && (
                    <a 
                      href={selectedJd.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <LinkIcon className="h-3 w-3" />
                      <span>View post</span>
                    </a>
                  )}
                </div>

                <div className="bg-slate-950/60 border border-slate-800/40 rounded-xl p-4 max-h-[480px] overflow-y-auto custom-scrollbar font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedJd.rawText}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500 text-xs">
                Select a tracked job opportunity to view its raw posting criteria.
              </div>
            )}

            {selectedJd && (
              <div className="mt-6 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>Job criteria saved. Ready for ATS matching and interview queries.</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
