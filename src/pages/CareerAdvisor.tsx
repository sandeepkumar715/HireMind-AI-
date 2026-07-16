/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Code2, 
  Linkedin, 
  Github,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CareerAdvisor() {
  const { token } = useAuth();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Plan states
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialOptions();
  }, [token]);

  const fetchInitialOptions = async () => {
    if (!token) return;
    try {
      const resumesRes = await fetch('/api/resumes', { headers: { 'Authorization': `Bearer ${token}` } });
      const resumesData = await resumesRes.json();
      setResumes(resumesData.resumes || []);

      if (resumesData.resumes && resumesData.resumes.length > 0) {
        setSelectedResumeId(resumesData.resumes[resumesData.resumes.length - 1].id);
      }

      // Restore latest plan if any exists
      const planRes = await fetch('/api/career/plans', { headers: { 'Authorization': `Bearer ${token}` } });
      const planData = await planRes.json();
      if (planRes.ok && planData.plans && planData.plans.length > 0) {
        setPlan(planData.plans[planData.plans.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load strategic options', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setErrorMsg('Please select an indexed resume to map your career trajectory.');
      return;
    }
    setErrorMsg(null);
    setPlan(null);
    setLoading(true);
    setStatusMsg('Gemini is projecting 5-year growth, salary targets, and coding portfolio architectures...');

    try {
      const res = await fetch('/api/career/advise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: selectedResumeId })
      });
      const data = await res.json();
      if (res.ok) {
        setPlan(data.plan);
        setStatusMsg('Career development blueprint mapped successfully! Explore the dashboards below.');
      } else {
        setErrorMsg(data.error || 'Failed to generate career strategy.');
      }
    } catch (err) {
      setErrorMsg('Connection error creating strategic trajectory plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Strategic <span className="text-indigo-400">Career Advisor</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Map 5-year career hierarchies, view regional salary curves, and build recommended portfolio apps</p>
      </div>

      {/* Trajectory parameter selection */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Set Strategic Basis</h3>
        
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

        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Base Profile Resume</label>
            <div className="relative">
              <FileText className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Select Resume Profile --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.fileName} (v{r.version || 1}.0)</option>
                ))}
              </select>
            </div>
          </div>

          <button
            id="career-advise-btn"
            onClick={handleGenerate}
            disabled={loading || !selectedResumeId}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 transition shrink-0 disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5 text-indigo-200" />
            <span>Map Trajectory Strategy</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">GEMINI EXTRAPOLATING CAREER HEURISTICS...</p>
        </div>
      )}

      {/* RENDER PLAN RESULTS */}
      {plan && !loading && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Timeline and Salary curves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 5-Year Trajectory Timeline */}
            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800/50">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                <span>5-Year Development Trajectory</span>
              </h3>

              <div className="space-y-6 relative pl-4 border-l border-slate-800">
                {plan.trajectory?.map((step: any, i: number) => (
                  <div key={i} className="relative space-y-1.5">
                    {/* Circle Bullet indicator */}
                    <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-indigo-500 border border-slate-900 shadow-sm"></div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        {step.years}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{step.milestoneTitle}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-1">{step.milestoneDetails}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Salary Paths */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800/50">
                  <DollarSign className="h-4.5 w-4.5 text-purple-400" />
                  <span>Salary Compensation targets</span>
                </h3>

                <div className="space-y-3.5">
                  {[
                    { label: 'Entry / Junior Level', val: plan.salaryPath?.entry, col: 'text-slate-400' },
                    { label: 'Mid-Level Professional', val: plan.salaryPath?.mid, col: 'text-indigo-400' },
                    { label: 'Staff / Lead Architect', val: plan.salaryPath?.senior, col: 'text-emerald-400' }
                  ].map((sal, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-400 font-medium">{sal.label}</span>
                      <span className={`text-sm font-extrabold font-mono ${sal.col}`}>{sal.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/10 border border-indigo-900/30 rounded-xl text-[10px] text-slate-500 text-center font-mono leading-relaxed mt-4">
                Compensation targeted on standard Silicon Valley SaaS roles metrics.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Projects blueprints */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800/50">
                  <Code2 className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Recommended Coding Portfolios Blueprint</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {plan.recommendedProjects?.map((proj: any, i: number) => (
                    <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/60 hover:border-slate-800 rounded-2xl transition duration-150 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-200">{proj.title}</h4>
                        
                        {/* Stack tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {proj.stack?.map((st: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-mono rounded-md">{st}</span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-400 leading-normal font-sans">{proj.scopeDescription}</p>
                      </div>

                      <div className="pt-3 mt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                        <strong className="text-indigo-400 font-semibold block uppercase">Recruiter pitch:</strong>
                        <p className="mt-0.5 leading-relaxed">{proj.recruiterPitch}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications and Social Tweaks */}
            <div className="space-y-6">
              {/* Credentials / Certifications roadmap */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/50">
                  <Award className="h-4.5 w-4.5 text-purple-400" />
                  <span>Respected Certifications</span>
                </h3>

                <div className="space-y-3">
                  {plan.certifications?.map((cert: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 bg-slate-900/30 border border-slate-850 rounded-xl">
                      <div className="h-5 w-5 bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">✓</div>
                      <span className="text-xs text-slate-300 font-medium font-sans leading-tight">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social profile optimizations (LinkedIn / GitHub) */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/50">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Profile Positioning Tweaks</span>
                </h3>

                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn Headline</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic bg-slate-950/40 p-2 border border-slate-800/40 rounded-lg">
                      "{plan.profileOptimizations?.linkedinHeadline}"
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                      <Github className="h-4 w-4" />
                      <span>GitHub Pinning Guide</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {plan.profileOptimizations?.githubPinningAdvice}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
