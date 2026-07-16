/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import JobDescriptions from './pages/JobDescriptions';
import ATSAnalyzer from './pages/ATSAnalyzer';
import SkillGap from './pages/SkillGap';
import InterviewSession from './pages/InterviewSession';
import CoverLetter from './pages/CoverLetter';
import CareerAdvisor from './pages/CareerAdvisor';
import AdminPanel from './pages/AdminPanel';

function AppLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/jobs" element={<JobDescriptions />} />
          <Route path="/ats" element={<ATSAnalyzer />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/interview" element={<InterviewSession />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
          <Route path="/career" element={<CareerAdvisor />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure SaaS dashboard routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
