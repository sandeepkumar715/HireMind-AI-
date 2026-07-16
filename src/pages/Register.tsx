/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all registration fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError(null);
    setSubmitting(true);

    const result = await register(name, email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] -z-10"></div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-4">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white">Create an account</h1>
          <p className="text-slate-400 mt-2 text-sm">Join SmartHire AI and elevate your career positioning</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div id="register-error" className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Your Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input 
                  type="text"
                  id="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input 
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input 
                  type="password"
                  id="reg-password"
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
              id="register-submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-600/20 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Redirect link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" id="link-to-login" className="text-indigo-400 hover:underline font-semibold">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
