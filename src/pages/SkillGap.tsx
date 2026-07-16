/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Map, 
  Sparkles, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen, 
  Calendar, 
  ExternalLink, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default function SkillGap() {
  const { token } = useAuth();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // Results states
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialOptions();
  }, [token]);

  const fetchInitialOptions = async () => {
    if (!token) return;
    try {
      const [resumesRes, jobsRes, gapRes] = await Promise.all([
        fetch('/api/resumes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/skill-gaps', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const resumesData = await resumesRes.json();
      const jobsData = await jobsRes.json();
      const gapData = await gapRes.json();

      setResumes(resumesData.resumes || []);
      setJobs(jobsData.jobs || []);

      if (resumesData.resumes && resumesData.resumes.length > 0) {
        setSelectedResumeId(resumesData.resumes[resumesData.resumes.length - 1].id);
      }
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        setSelectedJobId(jobsData.jobs[jobsData.jobs.length - 1].id);
      }

      // Restore latest analysis if any exists
      if (gapData.skillGaps && gapData.skillGaps.length > 0) {
        setAnalysis(gapData.skillGaps[gapData.skillGaps.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load comparative options', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setErrorMsg('Please select both a resume and a target job posting to analyze skill gaps.');
      return;
    }
    setErrorMsg(null);
    setAnalysis(null);
    setLoading(true);
    setStatusMsg('Comparing skills matrix against job posting requirements...');

    try {
      const res = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJobId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.skillGap);
        setStatusMsg('Upskilling roadmap created successfully! Check out your priority items below.');
      } else {
        setErrorMsg(data.error || 'Failed to analyze skill gaps.');
      }
    } catch (err) {
      setErrorMsg('Connection error conducting skill gap analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Skill Gap <span className="text-indigo-400">Analysis</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Isolate technology overlaps, discover framework deficits, and generate structured learning roadmaps</p>
      </div>

      {/* Preset parameter selector */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Select Target Parameters</h3>
        
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-mono">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Select Resume Version</label>
            <div className="relative">
              <FileText className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.fileName} (v{r.version || 1}.0)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Target Job description</label>
            <div className="relative">
              <Briefcase className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Opportunity --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.jobTitle} at {j.companyName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="skillgap-analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !selectedResumeId || !selectedJobId}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
          >
            <Map className="h-3.5 w-3.5 text-indigo-200 animate-pulse" />
            <span>Map Skill Gap Gaps</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">COMPILING COMPARATIVE MATRIX GRIDS...</p>
        </div>
      )}

      {/* RENDER DETAILED GAPS ROADMAP */}
      {analysis && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Match Score Gauge card */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="h-28 w-28 rounded-full bg-indigo-600/10 border-2 border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold text-indigo-400">{analysis.matchPercentage}%</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Overlap</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Competency Alignment Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1.5">{analysis.overallAdvice}</p>
            </div>
          </div>

          {/* Overlaps check: Matched skills vs Deficits list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Matched core skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills?.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                <span>Deficit & Gaps Areas</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* INTUITIVE ROADMAP CARDS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Generated Curated learning roadmaps</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysis.roadmap?.map((item: any, i: number) => (
                <div key={i} className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                  <div className="space-y-3.5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase rounded-md font-mono">
                        {item.type}
                      </span>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-md font-mono border ${
                        item.importance === 'High' 
                          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        Priority: {item.importance}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-200">{item.skill}</h4>

                    {/* Resources link lists */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended tutorials & documentation</span>
                      {item.resources?.map((res: any, idx: number) => (
                        <a 
                          key={idx}
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-xs text-slate-300 hover:text-white rounded-xl transition"
                        >
                          <span className="truncate pr-4 flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="font-sans font-medium">{res.name}</span>
                          </span>
                          <span className="text-[10px] text-indigo-400 font-mono shrink-0 flex items-center gap-1 font-semibold">
                            <span>{res.duration}</span>
                            <ExternalLink className="h-3 w-3 text-indigo-500" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Estimated learning commitment: <strong className="text-slate-300">{item.estimatedHours} study hours</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
