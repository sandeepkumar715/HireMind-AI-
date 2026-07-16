/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials fields');
      return;
    }
    setError(null);
    setSubmitting(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  const handleDemoFill = async (role: 'User' | 'Admin') => {
    setError(null);
    const demoEmail = role === 'Admin' ? 'admin@smarthire.ai' : 'demo@smarthire.ai';
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] -z-10"></div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-4">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2 text-sm">Empowering your career goals with Gemini AI coaching</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div id="login-error" className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Mock password reset link triggered. Simply use 'One-Click' quick fill buttons to login."); }} className="text-xs text-indigo-400 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-600/20 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Seeding Demo Autofills */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">One-Click Quick Try Accounts</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="fill-demo-user"
                onClick={() => handleDemoFill('User')}
                className="py-2.5 px-3 bg-slate-800/40 hover:bg-indigo-600/15 border border-slate-700/60 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-indigo-300 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Candidate Profile</span>
              </button>
              <button 
                id="fill-demo-admin"
                onClick={() => handleDemoFill('Admin')}
                className="py-2.5 px-3 bg-slate-800/40 hover:bg-purple-600/15 border border-slate-700/60 hover:border-purple-500/30 text-xs text-slate-300 hover:text-purple-300 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>Admin Suite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Redirect link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" id="link-to-register" className="text-indigo-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
