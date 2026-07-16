/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Sparkles, 
  Play, 
  Send, 
  CheckCircle, 
  Award, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Mic, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Clock,
  User
} from 'lucide-react';

export default function InterviewSession() {
  const { token } = useAuth();

  // Arena configuration states
  const [role, setRole] = useState('Full Stack Engineer');
  const [company, setCompany] = useState('Stripe');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [category, setCategory] = useState<'HR' | 'Technical' | 'Behavioral' | 'Situational' | 'CompanySpecific'>('Technical');
  
  const [session, setSession] = useState<any | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio / Speech settings
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.chatHistory, submittingResponse]);

  // Trigger browser SpeechSynthesis for AI questions if enabled
  useEffect(() => {
    if (speechEnabled && session?.chatHistory) {
      const lastMsg = session.chatHistory[session.chatHistory.length - 1];
      if (lastMsg && lastMsg.sender === 'AI') {
        speakText(lastMsg.text);
      }
    }
  }, [session?.chatHistory, speechEnabled]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Terminate existing voices
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      // Prefer standard English female/male natural voices
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
      if (engVoice) utterance.voice = engVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !company) {
      setErrorMsg('Please specify target role and company.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/interview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, company, difficulty, type: category })
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
        // Alert browser voice loading
        if (speechEnabled) speakText(data.session.questions[0]?.question || "Welcome!");
      } else {
        setErrorMsg(data.error || 'Failed to initialize mock interview.');
      }
    } catch (err) {
      setErrorMsg('Connection error creating interview simulation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submittingResponse) return;
    setErrorMsg(null);
    setSubmittingResponse(true);
    const candidateAnswer = answer;
    setAnswer('');

    // Pre-emptively append candidate's text locally to keep the chat feel rapid
    setSession((prev: any) => ({
      ...prev,
      chatHistory: [
        ...prev.chatHistory,
        {
          id: 'temp-ans',
          sender: 'User',
          text: candidateAnswer,
          timestamp: new Date().toISOString()
        }
      ]
    }));

    try {
      const res = await fetch(`/api/interview/${session.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer: candidateAnswer })
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data.session);
      } else {
        setErrorMsg(data.error || 'Failed to submit response.');
      }
    } catch (err) {
      setErrorMsg('Connection error evaluating response.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setAnswer('');
    setErrorMsg(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
            AI Interview <span className="text-indigo-400">Coach</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Simulate strict technical loops, capture speech triggers, and receive analytical grade scorecards</p>
        </div>
        
        {/* Toggle Speech */}
        <button
          onClick={() => {
            setSpeechEnabled(!speechEnabled);
            if (!speechEnabled && 'speechSynthesis' in window) {
              speakText("Voice narrator activated.");
            } else {
              window.speechSynthesis?.cancel();
            }
          }}
          className={`px-3 py-2 rounded-xl text-xs font-mono border transition flex items-center gap-1.5 ${
            speechEnabled 
              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {speechEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          <span>VOICE: {speechEnabled ? 'ENABLED' : 'MUTED'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-4 py-24">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono tracking-wider text-slate-500 animate-pulse">GENERATING TAILORED DRILL QUESTIONS VIA GEMINI...</p>
        </div>
      ) : !session ? (
        /* PHASE 1: CONFIGURATION ARENA */
        <div className="max-w-2xl bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 mx-auto w-full animate-fade-in">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-200">Prepare Mock Interview Arena</h3>
            <p className="text-xs text-slate-500 mt-1">Specify target parameters to prompt customized HR or technical case drills</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="start-interview-form" onSubmit={handleStartSession} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Target Job Role</label>
                <input 
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Target Company</label>
                <input 
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Netflix"
                  className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Difficulty Tier</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Easy">Easy (Graduate / Basic)</option>
                  <option value="Medium">Medium (Mid-level Standard)</option>
                  <option value="Hard">Hard (Staff / Senior Architect)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Interview Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Technical">Technical (Coding, Systems, Architecture)</option>
                  <option value="HR">HR / Professional Introduction</option>
                  <option value="Behavioral">Behavioral (STAR Competencies)</option>
                  <option value="Situational">Situational (Ethical Case Scenarios)</option>
                  <option value="CompanySpecific">Company Culture & Mission Alignment</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-600/10 active:scale-[0.99] transition flex items-center justify-center gap-2 text-xs"
            >
              <Play className="h-4 w-4 text-white fill-white" />
              <span>Begin Simulation Drill</span>
            </button>
          </form>
        </div>
      ) : (
        /* PHASE 2: ACTIVE COACH ARENA */
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full animate-fade-in min-h-[550px]">
          {/* LEFT: Interactive Chat Container */}
          <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm h-[580px]">
            {/* Header / Question Tracker */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8.5 w-8.5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                  {session.status === 'Completed' ? '✓' : session.currentQuestionIndex + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{session.role} Drill</h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">{session.company} • {session.difficulty} • {session.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {session.status !== 'Completed' && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    QUESTION {session.currentQuestionIndex + 1} OF {session.questions.length}
                  </span>
                )}
                <button 
                  onClick={handleReset}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition"
                  title="Quit current interview session"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversational Chats Scroller */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
              {session.chatHistory?.map((msg: any, i: number) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div key={msg.id || i} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}>
                    <div className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center shrink-0 border ${
                      isAI 
                        ? 'bg-slate-900 border-slate-800 text-slate-300' 
                        : 'bg-indigo-600/15 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    <div className="space-y-2">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isAI 
                          ? 'bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none' 
                          : 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      }`}>
                        {msg.text}
                      </div>

                      {/* Display answer analytical scorecard beneath user responses */}
                      {!isAI && msg.evaluation && (
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Real-time response diagnostics</span>
                          
                          {/* Mini metrics bar */}
                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                            <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                              <span className="text-slate-500 block">COMM</span>
                              <strong className="text-slate-200 block mt-0.5">{msg.evaluation.communicationScore}%</strong>
                            </div>
                            <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                              <span className="text-slate-500 block">TECH</span>
                              <strong className="text-slate-200 block mt-0.5">{msg.evaluation.technicalAccuracy}%</strong>
                            </div>
                            <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                              <span className="text-slate-500 block">CONF</span>
                              <strong className="text-slate-200 block mt-0.5">{msg.evaluation.confidence}%</strong>
                            </div>
                            <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                              <span className="text-slate-500 block">GRAM</span>
                              <strong className="text-slate-200 block mt-0.5">{msg.evaluation.grammar}%</strong>
                            </div>
                          </div>

                          <div className="text-[11px] leading-relaxed text-slate-400 font-sans border-t border-slate-900 pt-2.5">
                            <strong className="text-slate-300">Suggestion:</strong> {msg.evaluation.suggestions}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {submittingResponse && (
                <div className="flex gap-3 max-w-[80%] self-start mr-auto">
                  <div className="h-8.5 w-8.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 font-mono tracking-wider animate-pulse flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>EVALUATING YOUR ANSWER AND STREAMING DIAGNOSTICS...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Form area */}
            <div className="bg-slate-950 p-4 border-t border-slate-800/50">
              {session.status === 'Completed' ? (
                <div className="p-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle className="h-4 w-4" />
                  <span>Interview completed! Full performance diagnostics loaded on the right-hand board.</span>
                </div>
              ) : (
                <form id="respond-form" onSubmit={handleSubmitAnswer} className="flex gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your interview response here..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none"
                    disabled={submittingResponse}
                    required
                  />
                  <button
                    type="submit"
                    id="submit-answer-btn"
                    disabled={submittingResponse || !answer.trim()}
                    className="h-10 w-10 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md transition disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: Active Question card & Overall Performance Scorecard */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[580px] overflow-y-auto custom-scrollbar">
            {session.status === 'Completed' && session.overallPerformance ? (
              /* PERFORMANCE SUMMARY COCKPIT */
              <div className="space-y-5 animate-fade-in">
                <div className="text-center pb-4 border-b border-slate-800/50">
                  <Award className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-200">Session Evaluation</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Final scorecard</p>
                </div>

                <div className="h-32 w-32 rounded-full bg-indigo-600/10 border-2 border-indigo-500/20 flex flex-col items-center justify-center mx-auto shadow-inner">
                  <span className="text-4xl font-extrabold text-indigo-400">{session.overallPerformance.score}%</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Rating</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recruiter Summary</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{session.overallPerformance.summary}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Recommended Drills</span>
                  {session.overallPerformance.recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart Arena</span>
                </button>
              </div>
            ) : (
              /* IN-PROGRESS TOPICS GUIDE CARD */
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-800/50 text-center">
                    <Clock className="h-6 w-6 text-indigo-400 mx-auto mb-1.5" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Evaluation Metrics</h3>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Gemini acts as technical lead, measuring and diagnostics</p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Listening keywords</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">Our parsing indexes critical software terms you should mention to score higher:</p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {session.questions[session.currentQuestionIndex]?.expectedKeywords?.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-md font-mono">{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Expected categories</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-center">HR & BEHAVIORAL</div>
                      <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-center">SYSTEMS CODE</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-950/15 border border-indigo-900/30 rounded-2xl text-[11px] text-indigo-400 leading-relaxed">
                  💡 <strong>NAR-DRIVE:</strong> Turn on <strong>VOICE NARRATION</strong> to listen to realistic speech flows. Take your time, formulate your response, and hit Send!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
