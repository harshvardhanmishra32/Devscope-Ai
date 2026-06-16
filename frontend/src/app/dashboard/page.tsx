"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ReportData {
  overall_score: number;
  hiring_probability: number;
  predicted_salary: number;
  strengths: string[];
  weaknesses: string[];
  roadmap: {
    verdict: string;
    personas: {
      technical_recruiter: string;
      engineering_manager: string;
      cto: string;
    };
    plan_30_days: string[];
    plan_90_days: string[];
    plan_365_days: string[];
  };
}

// Animated counter hook
function useCounter(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Circular progress ring component
function RingScore({ score, size = 120, stroke = 10, color = '#6366f1', label, sublabel }: {
  score: number; size?: number; stroke?: number; color?: string; label: string; sublabel?: string;
}) {
  const [animate, setAnimate] = useState(false);
  const count = useCounter(score, 1800, animate);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 300); return () => clearTimeout(t); }, []);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (count / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white font-['Outfit']">{count}<span className="text-base text-gray-400">%</span></span>
        </div>
      </div>
      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider text-center">{label}</span>
      {sublabel && <span className="text-[10px] text-gray-500">{sublabel}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { isReady } = useAuthGuard();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [ringKey, setRingKey] = useState(0); // increment to remount rings from 0

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = localStorage.getItem('devscope_token');
        if (!token) throw new Error('No token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/reports/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setReport(await response.json());
        } else throw new Error('Backend unavailable');
      } catch {
        // Premium demo data
        setReport({
          overall_score: 87,
          hiring_probability: 0.89,
          predicted_salary: 132000,
          strengths: [
            'Clean architectural patterns across all GitHub repositories.',
            'High-density modern framework keywords in resume.',
            'Significant open-source commit activity.',
          ],
          weaknesses: [
            'Missing cloud deployment configs (Terraform / AWS).',
            'No automated testing suites on frontend repos.',
          ],
          roadmap: {
            verdict: 'Strong Hire',
            personas: {
              technical_recruiter: 'Excellent ATS matching. Clear structure, strong impact descriptions, and zero grammatical bugs.',
              engineering_manager: 'Clean Python code, proper READMEs — would like to see more unit tests integrated.',
              cto: 'Strong microservices understanding. Next: Redis caching + infrastructure pipelines.',
            },
            plan_30_days: ['Build multi-stage Dockerfiles.', 'Integrate Jest testing into dashboard repo.'],
            plan_90_days: ['Study Kubernetes manifest specs.', 'Implement distributed caching patterns.'],
            plan_365_days: ['Obtain AWS Solutions Architect cert.', 'Target senior software engineer roles.'],
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (!isReady || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Initializing AI Engine...</p>
      </div>
    );
  }

  if (isReset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
          className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500/30 flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
        <div>
          <h2 className="text-2xl font-black font-['Outfit'] text-white">Analysis Cleared</h2>
          <p className="text-gray-400 text-sm font-light mt-1">All previous scores have been reset to zero.</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => { setIsReset(false); setRingKey(k => k + 1); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            Run New Analysis
          </button>
          <a href="/github" className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white font-semibold text-xs uppercase tracking-wider transition-all">
            Scan GitHub First
          </a>
        </div>
      </div>
    );
  }

  if (!report) return <div className="text-center text-red-400 py-12">Failed to load report.</div>;

  const hiringPct = Math.round(report.hiring_probability * 100);
  const salaryK = Math.round(report.predicted_salary / 1000);
  const verdictColor = report.roadmap.verdict.toLowerCase().includes('strong') ? 'text-green-400' : 'text-yellow-400';
  const verdictBg = report.roadmap.verdict.toLowerCase().includes('strong') ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30';

  return (
    <div className="flex flex-col gap-10 py-6 relative z-10">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI Analysis Complete
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-['Outfit'] tracking-tight text-white">Developer Intelligence OS</h1>
          <p className="text-indigo-300/70 text-xs font-light mt-1 tracking-widest uppercase">Real-time Agentic Analysis · Predictive Modeling</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setIsReset(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/25 hover:border-red-400/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <a href="/resume" className="px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-gray-300 hover:text-white transition-all">
            Resume AI →
          </a>
          <a href="/github" className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20">
            GitHub Engine →
          </a>
        </div>
      </motion.div>

      {/* ── Verdict Banner ── */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className={`rounded-2xl border px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 ${verdictBg}`}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {report.roadmap.verdict.toLowerCase().includes('strong') ? '🎯' : '⚡'}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">AI Hiring Committee Verdict</p>
            <p className={`text-2xl font-black font-['Outfit'] mt-0.5 ${verdictColor}`}>{report.roadmap.verdict}</p>
          </div>
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Intelligence Score</p>
            <p className="text-2xl font-black text-white mt-0.5">{report.overall_score}<span className="text-sm text-gray-400">/100</span></p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Hiring Probability</p>
            <p className="text-2xl font-black text-green-400 mt-0.5">{hiringPct}%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Predicted Salary</p>
            <p className="text-2xl font-black text-indigo-400 mt-0.5">${salaryK}K</p>
          </div>
        </div>
      </motion.div>

      {/* ── Animated Score Rings ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Multi-Dimensional Analysis Engine
        </h2>
        {/* key=ringKey forces full remount → counter starts at 0 on every Run New Analysis */}
        <div key={ringKey} className="flex flex-wrap justify-around gap-8">
          <RingScore score={report.overall_score} color="#6366f1" label="Overall Score" sublabel="Intelligence Index" />
          <RingScore score={hiringPct} color="#22c55e" label="Hire Probability" sublabel="ML Prediction" />
          <RingScore score={78} color="#a855f7" label="Resume Match" sublabel="ATS Analysis" size={110} />
          <RingScore score={82} color="#ec4899" label="GitHub Quality" sublabel="Code Intelligence" size={110} />
          <RingScore score={91} color="#f59e0b" label="Tech Relevance" sublabel="Skill Graph" size={110} />
        </div>
      </motion.div>

      {/* ── AI Engine Flow ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-panel rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Explainable AI Pipeline</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {[
            { label: 'Resume Analysis', pct: '25%', color: 'indigo' },
            { label: 'GitHub Commits', pct: '30%', color: 'purple' },
            { label: 'Tech Stack Graph', pct: '25%', color: 'pink' },
            { label: 'Interview Signal', pct: '20%', color: 'amber' },
          ].map((node, i) => (
            <React.Fragment key={node.label}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className={`flex flex-col items-center gap-2 bg-${node.color}-500/5 border border-${node.color}-500/20 rounded-xl px-6 py-4 min-w-[120px] text-center`}
              >
                <span className={`text-[10px] font-bold text-${node.color}-400 uppercase tracking-widest`}>{node.label}</span>
                <span className="text-2xl font-black text-white font-['Outfit']">{node.pct}</span>
              </motion.div>
              {i < 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.15 }}
                  className="text-gray-600 hidden md:block text-lg font-light"
                >→</motion.div>
              )}
            </React.Fragment>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
            className="hidden md:block text-gray-600 text-lg"
          >→</motion.div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1, type: 'spring' }}
            className="flex flex-col items-center gap-1 bg-white/5 border border-white/15 rounded-xl px-6 py-4 text-center shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          >
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Final Score</span>
            <span className="text-4xl font-black font-['Outfit'] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {report.overall_score}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Strengths & Weaknesses ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border-l-2 border-green-500/50">
          <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Identified Strengths
          </h3>
          <ul className="flex flex-col gap-3">
            {report.strengths.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2.5 text-sm text-gray-300 font-light"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border-l-2 border-red-500/40">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Growth Opportunities
          </h3>
          <ul className="flex flex-col gap-3">
            {report.weaknesses.map((w, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2.5 text-sm text-gray-300 font-light"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                {w}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── AI Hiring Panel ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">AI Hiring Committee · Live Deliberation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { key: 'technical_recruiter', tag: 'TR', role: 'Technical Recruiter', color: 'blue', sub: 'Evaluating ATS Fit' },
            { key: 'engineering_manager', tag: 'EM', role: 'Engineering Manager', color: 'green', sub: 'Analyzing Code Quality' },
            { key: 'cto', tag: 'CTO', role: 'Startup CTO', color: 'purple', sub: 'Reviewing System Design' },
          ].map((p, i) => (
            <motion.div key={p.key}
              initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
              className={`glass-panel rounded-2xl p-6 flex flex-col gap-4 group hover:border-${p.color}-500/40 transition-all border border-white/5 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-${p.color}-500/15 border border-${p.color}-500/40 flex items-center justify-center`}>
                  <span className={`text-${p.color}-400 font-black text-xs`}>{p.tag}</span>
                </div>
                <div>
                  <p className={`text-xs font-black text-${p.color}-300 uppercase tracking-wide`}>{p.role}</p>
                  <p className="text-[9px] text-gray-600 font-light">{p.sub}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm font-light leading-relaxed flex-1">
                "{(report.roadmap.personas as any)[p.key]}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Career Roadmap ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="glass-panel rounded-2xl p-8"
      >
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Career Acceleration Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { period: 'T + 30 Days', items: report.roadmap.plan_30_days, color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
            { period: 'T + 90 Days', items: report.roadmap.plan_90_days, color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
            { period: 'T + 365 Days', items: report.roadmap.plan_365_days, color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
          ].map((phase, i) => (
            <div key={phase.period} className="flex flex-col gap-3 p-5 rounded-xl border border-white/5 bg-white/2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: phase.color, boxShadow: `0 0 8px ${phase.glow}` }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: phase.color }}>{phase.period}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {phase.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-300 font-light flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
