/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Sparkles, 
  FileText, 
  Briefcase, 
  Copy, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export default function CoverLetter() {
  const { token } = useAuth();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Letter state
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInitialOptions();
  }, [token]);

  const fetchInitialOptions = async () => {
    if (!token) return;
    try {
      const [resumesRes, jobsRes, lettersRes] = await Promise.all([
        fetch('/api/resumes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/cover-letters', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const resumesData = await resumesRes.json();
      const jobsData = await jobsRes.json();
      const lettersData = await lettersRes.json();

      setResumes(resumesData.resumes || []);
      setJobs(jobsData.jobs || []);

      if (resumesData.resumes && resumesData.resumes.length > 0) {
        setSelectedResumeId(resumesData.resumes[resumesData.resumes.length - 1].id);
      }
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        setSelectedJobId(jobsData.jobs[jobsData.jobs.length - 1].id);
      }

      // Restore latest letter if any
      if (lettersData.letters && lettersData.letters.length > 0) {
        setLetter(lettersData.letters[lettersData.letters.length - 1].content);
      }
    } catch (err) {
      console.error('Failed to load letter configuration options', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setErrorMsg('Please select both a resume and a target job to generate a tailored cover letter.');
      return;
    }
    setErrorMsg(null);
    setLetter(null);
    setLoading(true);
    setStatusMsg('Gemini is tailoring an executive pitch connecting your key experience metrics...');

    try {
      const res = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJobId,
          additionalNotes: additionalNotes || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLetter(data.letter.content);
        setStatusMsg('Cover letter crafted successfully! Review it in the paper editor layout.');
      } else {
        setErrorMsg(data.error || 'Failed to generate cover letter.');
      }
    } catch (err) {
      setErrorMsg('Connection error creating cover letter draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!letter) return;
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!letter) return;
    const element = document.createElement("a");
    const file = new Blob([letter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "SmartHire_Cover_Letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Cover Letter <span className="text-indigo-400">Tailoring</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Blend your resume with targeted job specifications to create hyper-personalized candidate pitches</p>
      </div>

      {/* Configurations panel */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
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
            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Target Job Description</label>
            <div className="relative">
              <Briefcase className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-500 mt-3.5" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Target Job --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.jobTitle} at {j.companyName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Additional Pitch Angle & Focus Area (Optional)</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g. Focus on my experience scaling database clusters and managing React frontend optimizations..."
            rows={3}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            id="coverletter-generate-btn"
            onClick={handleGenerate}
            disabled={loading || !selectedResumeId || !selectedJobId}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-200" />
            <span>Generate Pitch Letter</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">GEMINI WEAVING EXECUTIVE LETTER STRUCTURES...</p>
        </div>
      )}

      {/* PAPER SIMULATOR OUTPUT CONTAINER */}
      {letter && !loading && (
        <div className="max-w-3xl mx-auto bg-white text-slate-800 border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-fade-in relative">
          
          {/* Quick actions top bar overlayed elegantly */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Virtual Letter simulator</span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-slate-200/60 rounded-lg text-slate-600 transition flex items-center gap-1"
                title="Copy letter to clipboard"
              >
                <Copy className="h-4 w-4" />
                <span className="text-[10px] font-semibold">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-slate-200/60 rounded-lg text-slate-600 transition flex items-center gap-1"
                title="Download text file"
              >
                <Download className="h-4 w-4" />
                <span className="text-[10px] font-semibold">Download</span>
              </button>
            </div>
          </div>

          {/* Letter Body */}
          <div className="p-8 md:p-12 font-serif text-[13px] leading-relaxed whitespace-pre-wrap max-h-[620px] overflow-y-auto custom-scrollbar">
            {letter}
          </div>

          {/* Subtle footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center text-[10px] text-slate-400 font-sans flex items-center justify-center gap-1.5 font-medium">
            <FileCheck2 className="h-4 w-4 text-emerald-500" />
            <span>Tailored and saved in your smart archive. ready to submit.</span>
          </div>
        </div>
      )}
    </div>
  );
}
