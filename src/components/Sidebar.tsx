/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Sparkles, 
  Map, 
  MessageSquare, 
  Mail, 
  Compass, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
    { name: 'Job Descriptions', path: '/jobs', icon: Briefcase },
    { name: 'ATS Analyzer', path: '/ats', icon: Sparkles },
    { name: 'Skill Gap', path: '/skill-gap', icon: Map },
    { name: 'Interview Coach', path: '/interview', icon: MessageSquare },
    { name: 'Cover Letter', path: '/cover-letter', icon: Mail },
    { name: 'Career Advisor', path: '/career', icon: Compass },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeClass = "flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 transition-all font-medium duration-200";
  const inactiveClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent transition-all duration-200";

  return (
    <>
      {/* Mobile Top Header */}
      <header id="mobile-header" className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-5 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-indigo-500" />
          <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartHire AI</span>
        </div>
        <button 
          id="toggle-sidebar"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          aria-label="Toggle sidebar menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Drawer */}
      <aside 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0c0c0e] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:h-screen`}
      >
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-slate-800/50">
          <div className="hidden md:flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-white block">SmartHire AI</span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider block uppercase">AI INTERVIEW & ATS</span>
            </div>
          </div>
          <p className="md:hidden text-xs text-slate-500 font-mono tracking-wider">AI INTERVIEW & ATS COACH</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                isActive 
                  ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm transition-all duration-200"
                  : "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-850 hover:text-slate-100 border border-transparent transition-all duration-200"
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}

          {user?.role === 'Admin' && (
            <NavLink 
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                isActive 
                  ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-sm transition-all duration-200"
                  : "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-850 hover:text-slate-100 border border-transparent transition-all duration-200"
              }
            >
              <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0" />
              <span className="text-purple-400 font-semibold text-sm">Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* User Footer Profile card */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0c0e]">
          <div className="flex items-center gap-3 p-2.5 bg-[#111114] rounded-xl border border-slate-800 mb-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs">{user?.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-200 truncate">{user?.name}</h4>
                <span className="px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold font-mono rounded">PRO</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button 
            id="logout-button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors duration-200 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay background for mobile */}
      {isOpen && (
        <div 
          id="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}
    </>
  );
}
