"use client";

import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

interface AuthOverlayProps {
  onLoginSuccess: () => void;
  onClose?: () => void; // optional — closes modal and goes back to landing
}

export default function AuthOverlay({ onLoginSuccess, onClose }: AuthOverlayProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGoogleSimulator, setShowGoogleSimulator] = useState(false);
  const [simulatorEmail, setSimulatorEmail] = useState('');
  const [simulatorName, setSimulatorName] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'mock-client-id';
  const isGoogleMock = googleClientId === 'mock-client-id' || !googleClientId;

  useEffect(() => {
    const token = localStorage.getItem('devscope_token');
    if (token) {
      setIsAuthenticated(true);
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check if backend is reachable
  const isNetworkError = (err: any) =>
    err instanceof TypeError ||
    err.message?.toLowerCase().includes('failed to fetch') ||
    err.message?.toLowerCase().includes('network') ||
    err.message?.toLowerCase().includes('fetch');

  // Standard Email/Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Incorrect email or password.');
      }

      const data = await response.json();
      localStorage.setItem('devscope_token', data.access_token);
      setIsAuthenticated(true);
      onLoginSuccess();
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Backend offline — silently log in as demo user
        handleDemoLogin();
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Standard Email/Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const signupRes = await fetch(`${apiUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!signupRes.ok) {
        const errData = await signupRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Account creation failed. Email may already be registered.');
      }

      const tokenRes = await fetch(`${apiUrl}/api/v1/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      if (!tokenRes.ok) throw new Error('Account created but login failed. Please sign in manually.');

      const tokenData = await tokenRes.json();
      localStorage.setItem('devscope_token', tokenData.access_token);
      setIsAuthenticated(true);
      onLoginSuccess();
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Backend offline — silently log in as demo user
        handleDemoLogin();
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const res = await fetch(`${apiUrl}/api/v1/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          token: credentialResponse.credential,
        }),
      });

      if (!res.ok) throw new Error('Google Sign-In failed on server.');

      const data = await res.json();
      localStorage.setItem('devscope_token', data.access_token);
      setIsAuthenticated(true);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Simulator Sign-In (when no real Google Client ID)
  const handleSimulatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = simulatorEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowGoogleSimulator(false);

    try {
      const name = simulatorName.trim() || targetEmail.split('@')[0];
      const res = await fetch(`${apiUrl}/api/v1/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: name,
          token: 'mock-google-id-token',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to authorize Google Account.');
      }

      const data = await res.json();
      localStorage.setItem('devscope_token', data.access_token);
      setIsAuthenticated(true);
      onLoginSuccess();
    } catch (err: any) {
      if (isNetworkError(err)) {
        handleDemoLogin();
      } else {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo mode — no backend needed, works fully on Vercel
  const handleDemoLogin = () => {
    const demoToken = 'demo_mode_token_devscope_ai_' + Date.now();
    localStorage.setItem('devscope_token', demoToken);
    localStorage.setItem('devscope_demo_mode', 'true');
    setIsAuthenticated(true);
    onLoginSuccess();
  };

  if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      {/* Backdrop — click to close */}
      <motion.div
        key="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-y-auto py-8"
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative glass-panel border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden pointer-events-auto flex flex-col items-center my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

          {/* ✕ Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/30 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <h2 className="text-3xl font-black font-['Outfit'] bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent mb-2">
            DEVSCOPE AI
          </h2>
          <p className="text-xs text-gray-400 mb-6 font-light">
            Centralized Developer Intelligence command center.
          </p>

          {/* Form Tabs */}
          <div className="flex w-full bg-white/5 border border-white/10 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setActiveTab('signin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeTab === 'signin'
                  ? 'bg-indigo-600/35 text-white shadow-md border border-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeTab === 'signup'
                  ? 'bg-indigo-600/35 text-white shadow-md border border-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Forms */}
          <form onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp} className="w-full flex flex-col gap-4">
            {activeTab === 'signup' && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition-all font-light"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition-all font-light"
              />
            </div>

            {/* Password with show/hide toggle */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 pr-11 text-sm text-white focus:outline-none focus:border-indigo-500/80 transition-all font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              {loading ? 'Processing...' : activeTab === 'signin' ? 'Access Console' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center my-6">
            <div className="flex-1 h-[1px] bg-white/10"></div>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest px-4">Or Continue With</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          {/* Google Sign In */}
          <div className="w-full flex justify-center">
            {isGoogleMock ? (
              <button
                type="button"
                onClick={() => { setShowGoogleSimulator(true); setError(null); }}
                className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.929a5.59 5.59 0 0 1 5.59-5.586c1.478 0 2.825.54 3.864 1.428l3.14-3.14a9.924 9.924 0 0 0-7.004-2.78 9.986 9.986 0 0 0-9.986 9.986 9.986 9.986 0 0 0 9.986 9.986c5.529 0 9.896-3.896 9.896-9.986 0-.583-.058-1.15-.158-1.532H12.24Z"/>
                </svg>
                Sign In with Google
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In failed. Please try again.')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            )}
          </div>

          {/* Demo Mode — works without backend */}
          <div className="w-full mt-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 py-3 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ⚡ Try Demo — No Login Required
            </button>
            <p className="text-[9px] text-gray-600 text-center mt-1.5 font-light">
              Explore all features instantly with sample AI analysis data
            </p>
          </div>

          {loading && (
            <p className="text-[10px] text-indigo-400 mt-4 animate-pulse uppercase font-semibold tracking-wider">Synchronizing Neural Channels...</p>
          )}

          {error && (
            <p className="text-xs text-red-400 mt-4 bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-500/20 w-full text-center">{error}</p>
          )}
        </motion.div>
      </motion.div>

      {/* Google Account Chooser Simulator */}
      {showGoogleSimulator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGoogleSimulator(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white text-gray-900 p-8 rounded-xl max-w-sm w-full shadow-2xl flex flex-col items-center border border-gray-200 relative"
          >
            {/* Close simulator */}
            <button
              onClick={() => setShowGoogleSimulator(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Google Logo */}
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-xl font-bold font-sans tracking-tight">
                <span className="text-blue-600">G</span>
                <span className="text-red-600">o</span>
                <span className="text-yellow-600">o</span>
                <span className="text-blue-600">g</span>
                <span className="text-green-600">l</span>
                <span className="text-red-600">e</span>
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 text-center mb-1">Choose an account</h3>
            <p className="text-xs text-gray-500 mb-6 text-center">to continue to DevScope AI</p>

            <form onSubmit={handleSimulatorSubmit} className="w-full flex flex-col gap-3">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-left w-full">Enter your Google email</p>

              <input
                type="text"
                placeholder="Full Name (optional)"
                value={simulatorName}
                onChange={(e) => setSimulatorName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />

              <input
                type="email"
                placeholder="your@gmail.com"
                value={simulatorEmail}
                onChange={(e) => setSimulatorEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />

              <p className="text-[9px] text-gray-400 text-center">Your data is private and isolated to your account only.</p>

              <div className="flex justify-between items-center gap-3 mt-1 w-full">
                <button
                  type="button"
                  onClick={() => setShowGoogleSimulator(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-md transition-all"
                >
                  Sign In
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
