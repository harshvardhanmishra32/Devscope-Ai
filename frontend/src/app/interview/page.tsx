"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface Message {
  role: 'interviewer' | 'user';
  text: string;
}

export default function InterviewSimulator() {
  const { isReady } = useAuthGuard();
  const [track, setTrack] = useState("Technical");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewId, setInterviewId] = useState("");
  const [finished, setFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isReady) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  const handleStart = async () => {
    setLoading(true);
    setFinished(false);
    
    const token = localStorage.getItem('devscope_token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || 'mock-token'}`
        },
        body: JSON.stringify({ type: track })
      });

      if (response.ok) {
        const result = await response.json();
        setInterviewId(result.interview_id);
        setMessages([{ role: 'interviewer', text: result.question }]);
        setSessionStarted(true);
      } else {
        throw new Error("Failed to start session.");
      }
    } catch (err) {
      // Offline fallback start
      const firstQuestion = track === "System Design" 
        ? "Let's begin. How would you design a distributed URL shortening service like Bit.ly? What database choices and caching strategy would you pick?" 
        : "Let's begin. Explain how asynchronous execution works in Python. What is the role of the event loop?";
        
      setInterviewId("mock-interview-session");
      setMessages([{ role: 'interviewer', text: firstQuestion }]);
      setSessionStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;

    const userMsg = currentInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setCurrentInput("");
    setLoading(true);

    const token = localStorage.getItem('devscope_token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/interview/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || 'mock-token'}`
        },
        body: JSON.stringify({
          interview_id: interviewId,
          user_response: userMsg
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, { role: 'interviewer', text: result.question }]);
        if (result.finished) {
          setFinished(true);
          try {
            localStorage.setItem('devscope_interview_score', String(result.score || 85));
            localStorage.setItem('devscope_interview_track', track);
          } catch (e) {
            console.warn("Storage access failed:", e);
          }
        }
      } else {
        throw new Error("Unable to submit response.");
      }
    } catch (err) {
      // Mock conversation loop — fixed stale closure using functional update
      setTimeout(() => {
        setMessages(prev => {
          const allMsgs = [...prev, { role: 'user' as const, text: userMsg }];
          const userRepliesCount = allMsgs.filter(m => m.role === 'user').length;

          if (userRepliesCount >= 3) {
            const allText = allMsgs
              .filter(m => m.role === 'user')
              .map(m => m.text)
              .join(' ')
              .toLowerCase();

            const totalWords = allText.split(/\s+/).filter(Boolean).length;
            const keywords = ['async', 'await', 'concurrency', 'thread', 'process', 'loop', 'redis',
              'database', 'scale', 'balancer', 'cache', 'shard', 'postgres', 'design', 'team', 'engineer'];
            const matchCount = keywords.filter(kw => allText.includes(kw)).length;
            const ignorancePhrases = ["don't know", 'no idea', 'not sure', 'dunno', 'skip', 'forgot'];
            const ignoranceCount = ignorancePhrases.filter(p => allText.includes(p)).length;

            let score = 55 + matchCount * 6 - ignoranceCount * 15;
            if (totalWords > 40) score += 10;
            else if (totalWords < 12) score -= 20;
            score = Math.max(15, Math.min(95, score));

            setFinished(true);
            try {
              localStorage.setItem('devscope_interview_score', String(score));
              localStorage.setItem('devscope_interview_track', track);
            } catch (e) {
              console.warn("Storage access failed:", e);
            }
            return [...allMsgs, {
              role: 'interviewer' as const,
              text: `Thank you for completing this mock interview. Your score is ${score}%.`
            }];
          }

          const followUps = [
            'Good point. How do you handle concurrency race conditions under this approach?',
            'Understood. How would you monitor and track error logs for this in production?'
          ];
          const nextQ = followUps[userRepliesCount - 1] ?? 'Great. Let us wrap up here — thank you for your time.';
          return [...allMsgs, { role: 'interviewer' as const, text: nextQ }];
        });
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-3xl mx-auto min-h-[600px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-['Outfit'] tracking-tight">AI Interview Simulator</h1>
          <p className="text-gray-400 text-sm font-light mt-1">Practice HR screens, system architecture design, and programming questions.</p>
        </div>
        {sessionStarted && (
          <button
            onClick={() => { setSessionStarted(false); setMessages([]); setFinished(false); setInterviewId(''); setCurrentInput(''); }}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/30 hover:border-red-400/60 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all flex items-center gap-2 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Session
          </button>
        )}
      </div>

      {!sessionStarted ? (
        /* Configuration Screen */
        <div className="glass-panel rounded-xl p-8 flex flex-col gap-6 items-center my-auto">
          <span className="text-sm font-semibold text-gray-300">Choose Your Interview Focus</span>
          <div className="flex gap-4 w-full justify-center">
            {["Technical", "System Design", "HR"].map(type => (
              <button
                key={type}
                onClick={() => setTrack(type)}
                className={`px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  track === type 
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" 
                    : "border-white/5 bg-white/5 text-gray-400 hover:text-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button 
            onClick={handleStart}
            disabled={loading}
            className="w-full max-w-xs px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-lg transition-all"
          >
            {loading ? "Initializing..." : "Start Interview"}
          </button>
        </div>
      ) : (
        /* Chat Simulator Interface */
        <div className="glass-panel rounded-xl flex flex-col justify-between flex-1 overflow-hidden h-[450px]">
          {/* Scrollable messages container */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[80%] rounded-xl p-4 text-sm font-light leading-relaxed ${
                  msg.role === 'interviewer' 
                    ? "bg-indigo-950/30 border border-indigo-500/10 self-start text-indigo-200" 
                    : "bg-white/5 border border-white/5 self-end text-gray-200"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                  {msg.role === 'interviewer' ? "AI Recruiter" : "You"}
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-xl p-4 text-sm font-light self-start text-indigo-200 animate-pulse">
                Thinking...
              </div>
            )}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Submission Row */}
          {!finished ? (
            <form onSubmit={handleSubmit} className="border-t border-white/5 p-4 flex gap-3 bg-black/10">
              <input 
                type="text" 
                placeholder="Type your response here..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Send
              </button>
            </form>
          ) : (
          <div className="border-t border-white/5 p-6 text-center bg-green-500/5 flex items-center justify-center gap-3">
              <button
                onClick={() => { setSessionStarted(false); setMessages([]); setFinished(false); setInterviewId(''); setCurrentInput(''); }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                New Session
              </button>
              <button
                onClick={() => { setSessionStarted(false); setMessages([]); setFinished(false); setInterviewId(''); setTrack('Technical'); }}
                className="px-6 py-2 border border-red-500/30 hover:border-red-400/60 bg-red-500/5 text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Full Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
