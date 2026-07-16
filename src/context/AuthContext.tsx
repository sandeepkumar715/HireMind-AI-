/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-restore login session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('smarthire_user');
    const storedToken = localStorage.getItem('smarthire_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error('Failed to parse cached user state', err);
        localStorage.removeItem('smarthire_user');
        localStorage.removeItem('smarthire_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordPlain }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please double-check your credentials.');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('smarthire_user', JSON.stringify(data.user));
      localStorage.setItem('smarthire_token', data.token);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, passwordPlain: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: passwordPlain }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('smarthire_user', JSON.stringify(data.user));
      localStorage.setItem('smarthire_token', data.token);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smarthire_user');
    localStorage.removeItem('smarthire_token');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      localStorage.setItem('smarthire_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      console.error('Profile update failed:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called inside an AuthProvider');
  }
  return context;
}
