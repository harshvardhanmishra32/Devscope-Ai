"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthOverlay from '@/components/auth/AuthOverlay';

const techStack = [
  "Python", "FastAPI", "LangGraph", "Machine Learning",
  "React", "Next.js", "Three.js", "PostgreSQL",
  "Docker", "Kubernetes", "Redis", "Celery"
];

const agents = [
  { label: "Recruiter Agent", color: "indigo", desc: "Simulates hiring panel decisions" },
  { label: "Resume Agent", color: "purple", desc: "ATS scoring & keyword extraction" },
  { label: "GitHub Agent", color: "blue", desc: "Repository & commit analysis" },
  { label: "Career Coach", color: "pink", desc: "30/90/365-day growth roadmaps" },
  { label: "Interview Agent", color: "violet", desc: "AI-powered mock interviews" },
  { label: "Project Reviewer", color: "cyan", desc: "Code quality & architecture audit" },
];

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('devscope_token');
    if (token) {
      window.location.replace('/dashboard');
    } else {
      setShowLanding(true);
      // Auto-open the modal if navigated here with ?signin=true
      const params = new URLSearchParams(window.location.search);
      if (params.get('signin') === 'true') {
        setShowAuthModal(true);
        // Clean up the URL without reload
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    window.location.replace('/dashboard');
  };

  if (!showLanding) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthOverlay
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center text-center gap-20 pb-24">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 max-w-4xl mt-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            System Online: Developer Intelligence Network Active
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] tracking-tight leading-tight drop-shadow-xl text-white">
            Developer <br />
            Intelligence{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              OS.
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-light tracking-wide leading-relaxed drop-shadow-md">
            An AI-powered Developer Intelligence Platform that analyzes GitHub profiles, resumes, skills, and career growth — so recruiters and developers get actionable insights instantly.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 mt-6"
          >
            <button
              id="btn-initialize-core"
              onClick={() => setShowAuthModal(true)}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] active:scale-95 transition-all"
            >
              Initialize Core
            </button>
            <p className="text-[11px] text-gray-500 font-light tracking-wide">
              Sign in or create a free account to access the platform
            </p>
          </motion.div>
        </motion.div>

        {/* ── FEATURE CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
        >
          <div className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center gap-4 group cursor-default">
            <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-['Outfit']">GitHub Intelligence</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Scan repositories, analyze code readability, documentation depth, tests, security alerts, and commit cadence.
            </p>
            <span className="text-[10px] uppercase font-bold text-indigo-400/60 tracking-widest mt-auto">Login Required →</span>
          </div>

          <div className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center gap-4 group cursor-default">
            <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-['Outfit']">ATS Resume Scorer</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Extract skills automatically. Benchmark keyword density and layout against real industry requirements.
            </p>
            <span className="text-[10px] uppercase font-bold text-purple-400/60 tracking-widest mt-auto">Login Required →</span>
          </div>

          <div className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center gap-4 group cursor-default">
            <div className="p-4 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-['Outfit']">AI Recruiter Panel</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Simulate decisions by an Engineering Manager, HR Specialist, and Startup CTO. Predict salaries using ML.
            </p>
            <span className="text-[10px] uppercase font-bold text-pink-400/60 tracking-widest mt-auto">Login Required →</span>
          </div>
        </motion.div>

        {/* ── ABOUT DEVSCOPE AI (PUBLIC) ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="w-full max-w-6xl flex flex-col gap-8"
          id="about"
        >
          {/* Section heading */}
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              About the Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-['Outfit'] text-white">What is DevScope AI?</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About text */}
            <div className="glass-panel rounded-2xl p-8 text-left flex flex-col gap-4">
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                <strong className="text-white">DevScope AI</strong> is an AI-powered Developer Intelligence Platform that helps software engineers understand, evaluate, and improve their professional profile through advanced analytics, machine learning, and multi-agent AI systems.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Modern developers are evaluated across multiple dimensions — technical skills, project quality, GitHub activity, open-source contributions, resume quality, and interview readiness. DevScope AI bridges this gap by acting as an <strong className="text-white">AI recruiter, engineering mentor, career coach, and portfolio evaluator</strong> in one unified system.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                One of the platform's key differentiators is its <strong className="text-white">Explainable AI architecture</strong> — instead of black-box scores, DevScope AI visualizes how decisions are generated through interconnected reasoning workflows, helping developers understand exactly where they excel and where they need improvement.
              </p>
            </div>

            {/* Creator card */}
            <div className="glass-panel rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden flex flex-col gap-5 text-left">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest">Architect & Creator</span>
                <h3 className="text-2xl font-black font-['Outfit'] text-white mt-1">Harshvardhan Mishra</h3>
                <p className="text-xs text-purple-300 font-medium mt-0.5">Computer Science Student</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Hi, I'm <strong className="text-white">Harshvardhan Mishra</strong>, a Computer Science student passionate about Artificial Intelligence, Software Engineering, System Design, and building impactful products. DevScope AI is my flagship project — combining AI engineering, developer analytics, and career intelligence into a single platform.
              </p>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Contact</span>
                <a
                  href="mailto:harshvardhanmishra31@gmail.com"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  harshvardhanmishra31@gmail.com
                </a>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Sign In to Explore Platform
              </button>
            </div>
          </div>

          {/* AI Agents grid */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col gap-6">
            <h3 className="text-lg font-bold font-['Outfit'] text-white text-left">Multi-Agent AI System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div key={agent.label} className="bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col gap-1.5 text-left transition-all">
                  <span className="text-xs font-bold text-indigo-300">{agent.label}</span>
                  <p className="text-[11px] text-gray-500 font-light leading-snug">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider text-left">Built With</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-md text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium hover:bg-indigo-500/20 hover:text-white transition-all cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
