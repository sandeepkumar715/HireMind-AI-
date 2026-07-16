/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  HelpCircle,
  FileCheck2,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function ATSAnalyzer() {
  const { token } = useAuth();
  
  // Selection models
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // Report states
  const [report, setReport] = useState<any | null>(null);
  const [optimization, setOptimization] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialOptions();
  }, [token]);

  const fetchInitialOptions = async () => {
    if (!token) return;
    try {
      const [resumesRes, jobsRes, reportsRes, optRes] = await Promise.all([
        fetch('/api/resumes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/ats/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/optimizations', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const resumesData = await resumesRes.json();
      const jobsData = await jobsRes.json();
      const reportsData = await reportsRes.json();
      const optData = await optRes.json();

      setResumes(resumesData.resumes || []);
      setJobs(jobsData.jobs || []);

      if (resumesData.resumes && resumesData.resumes.length > 0) {
        setSelectedResumeId(resumesData.resumes[resumesData.resumes.length - 1].id);
      }
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        setSelectedJobId(jobsData.jobs[jobsData.jobs.length - 1].id);
      }

      // Restore latest report and optimizer if existing
      if (reportsData.reports && reportsData.reports.length > 0) {
        setReport(reportsData.reports[reportsData.reports.length - 1]);
      }
      if (optData.optimizations && optData.optimizations.length > 0) {
        setOptimization(optData.optimizations[optData.optimizations.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load analyzer presets', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setErrorMsg('Please select an indexed resume to analyze.');
      return;
    }
    setErrorMsg(null);
    setReport(null);
    setLoading(true);
    setStatusMsg('Gemini is crawling your experience bullets and checking formatting standards...');

    try {
      const res = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJobId || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setStatusMsg('ATS report generated successfully! Scroll down to explore matching scores.');
      } else {
        setErrorMsg(data.error || 'Failed to complete ATS analysis.');
      }
    } catch (err) {
      setErrorMsg('Network error compiling ATS scorecard.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedResumeId) {
      setErrorMsg('Please select a resume to optimize.');
      return;
    }
    setErrorMsg(null);
    setOptimization(null);
    setOptimizing(true);
    setStatusMsg('Gemini is generating metrics-rich bullet rewrites using the STAR method...');

    try {
      const res = await fetch(`/api/resumes/${selectedResumeId}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOptimization(data.optimization);
        setStatusMsg('Resume optimization templates generated successfully! Check out the STAR rewriting console below.');
      } else {
        setErrorMsg(data.error || 'Failed to optimize bullets.');
      }
    } catch (err) {
      setErrorMsg('Network error optimizing resume bullets.');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
          ATS <span className="text-indigo-400">Analyzer & Optimizer</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Simulate corporate applicant filters, isolate missing terms, and generate STAR-method rewrites</p>
      </div>

      {/* Preset selections card */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Set Comparison Parameters</h3>
        
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
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Select My Resume</label>
            <div className="relative">
              <FileText className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Resume Version --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.fileName} (v{r.version || 1}.0)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Compare with Job Posting (Optional)</label>
            <div className="relative">
              <Briefcase className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Target Job Description (Optional) --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.jobTitle} at {j.companyName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 justify-end">
          <button
            id="ats-optimize-btn"
            onClick={handleOptimize}
            disabled={loading || optimizing || !selectedResumeId}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${optimizing ? 'animate-spin' : ''}`} />
            <span>Optimize Bullet Points</span>
          </button>
          
          <button
            id="ats-analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || optimizing || !selectedResumeId}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>Generate ATS Scorecard</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">GEMINI COMPUTING COGNITIVE ANALYSIS CODES...</p>
        </div>
      )}

      {/* RENDER REPORT RESULTS */}
      {report && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Circular SVG Matching Gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Overall Match', score: report.score, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Formatting Standard', score: report.formattingScore, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Keyword Density', score: report.keywordScore, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Grammar Accuracy', score: report.grammarScore, color: 'text-amber-500', bg: 'bg-amber-500/10' }
            ].map((gauge, i) => {
              // Standard SVG circular layout
              const radius = 50;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (gauge.score / 100) * circumference;
              
              return (
                <div key={i} className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 text-center flex flex-col items-center shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold mb-4 uppercase tracking-wider block">{gauge.label}</span>
                  
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r={radius} className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r={radius} 
                        className={gauge.color} 
                        strokeWidth="10" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor" 
                        fill="transparent" 
                      />
                    </svg>
                    <span className="absolute text-2xl font-extrabold text-white">{gauge.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Summary and missing keywords */}
            <div className="space-y-6">
              {/* Summary and strengths */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">AI Resume Assessment</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{report.strengthSummary}</p>
              </div>

              {/* Missing keywords alerts */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Missing Keywords</h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-normal">Injecting these key phrases or technologies into your experience descriptions can increase your compatibility score by up to 25 points.</p>
                
                {report.missingKeywords && report.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.missingKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-mono font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-medium">Excellent match! No critical keywords missing.</p>
                )}
              </div>
            </div>

            {/* Right: Technical/Soft Skills & Actionable recommendations list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills matched breakdown */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Indexed Skill badging</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">Technical & Hard Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.technicalSkills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-md text-[11px] font-semibold">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2.5">Interpersonal & Soft Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.softSkills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-md text-[11px] font-semibold">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action recommendations checklist */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Actionable Structural Recommendations</h3>
                
                <div className="space-y-3.5">
                  {report.suggestions?.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl hover:border-slate-800 transition">
                      <div className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section weak points expander list */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Section-by-Section Enhancement Guides</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.weakSections?.map((ws: any, i: number) => (
                <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-md font-mono">
                    Needs Improvement: {ws.section}
                  </span>
                  <ul className="space-y-2 mt-3">
                    {ws.suggestions?.map((sug: string, j: number) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-400 font-sans">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OPTIMIZER MODULE SIDE-BY-SIDE CONSOLE */}
      {optimization && !loading && (
        <div className="mt-8 bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm animate-fade-in space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
            <div>
              <h3 className="text-base font-bold text-slate-200">STAR Bullet Points Optimizer</h3>
              <p className="text-xs text-slate-500 mt-0.5">Rewriting dry descriptions into dynamic metrics-rich statements with logical STAR breakdowns</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded-lg font-mono">
              ACTIVE REWRITER
            </span>
          </div>

          {/* Summary upgrade */}
          <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1.5">Optimized Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed italic">"{optimization.summary}"</p>
          </div>

          {/* Bullets side-by-side comparators */}
          <div className="space-y-5">
            {optimization.bulletPoints?.map((bp: any, i: number) => (
              <div key={i} className="border border-slate-800/80 rounded-2xl p-5 bg-slate-900/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Original description</span>
                    <p className="text-xs text-slate-400 line-through bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                      {bp.original}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Optimized STAR statement</span>
                    </span>
                    <p className="text-xs text-slate-200 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20 font-sans font-medium leading-relaxed">
                      {bp.optimized}
                    </p>
                  </div>
                </div>

                {/* STAR Breakdown */}
                <div className="pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-slate-500 font-mono">
                  <div>
                    <span className="text-indigo-400 font-semibold uppercase">Situation / Task:</span>
                    <p className="mt-0.5 leading-relaxed">{bp.starMethod?.situationTask}</p>
                  </div>
                  <div>
                    <span className="text-indigo-400 font-semibold uppercase">Action taken:</span>
                    <p className="mt-0.5 leading-relaxed">{bp.starMethod?.action}</p>
                  </div>
                  <div>
                    <span className="text-indigo-400 font-semibold uppercase">Quantified result:</span>
                    <p className="mt-0.5 leading-relaxed">{bp.starMethod?.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
