"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AboutPage() {
  const { isReady } = useAuthGuard();
  const [copied, setCopied] = useState(false);

  if (!isReady) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  const email = "harshvardhanmishra31@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const techStack = [
    "Python", "FastAPI", "LangGraph", "Machine Learning", 
    "React", "Next.js", "Three.js", "PostgreSQL", 
    "Docker", "Kubernetes"
  ];

  const agents = [
    { name: "Recruiter Agent", desc: "Simulates decisions and parses core hiring requirements." },
    { name: "Resume Agent", desc: "Extracts profiles and evaluates ATS match probability." },
    { name: "GitHub Agent", desc: "Scans repos for code readability, cadence, and patterns." },
    { name: "Project Reviewer Agent", desc: "Analyzes system architecture and implementation quality." },
    { name: "Career Coach Agent", desc: "Finds skill gaps and lays down target developer roadmaps." },
    { name: "Interview Agent", desc: "Simulates interactive technical mock interview streams." }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-10 py-6"
    >
      {/* Page Heading */}
      <motion.div variants={itemVariants} className="text-center md:text-left flex flex-col gap-3">
        <h1 className="text-4xl md:text-6xl font-black font-['Outfit'] tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
          Intelligence Dossier
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-light max-w-2xl">
          System blueprint, agent topology, and development team details for DevScope AI.
        </p>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - About DevScope AI Platform */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-7 flex flex-col gap-6"
        >
          <div className="glass-panel rounded-2xl p-8 border border-white/10 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Platform Blueprint</span>
              <h2 className="text-2xl font-bold font-['Outfit'] text-white">About DevScope AI</h2>
            </div>
            
            <div className="text-sm text-gray-300 font-light leading-relaxed flex flex-col gap-4">
              <p>
                <strong>DevScope AI</strong> is an AI-powered Developer Intelligence Platform that helps software engineers understand, evaluate, and improve their professional profile through advanced analytics, machine learning, and multi-agent AI systems.
              </p>
              <p>
                Modern developers are evaluated across multiple dimensions such as technical skills, project quality, GitHub activity, open-source contributions, resume quality, problem-solving ability, and interview readiness. However, there is no single platform that provides a comprehensive and explainable assessment of these factors. DevScope AI bridges this gap by acting as an AI recruiter, engineering mentor, career coach, and portfolio evaluator in one unified system.
              </p>
              <p>
                The platform analyzes GitHub repositories, resumes, technical projects, certifications, and developer skills to generate deep insights into employability, engineering maturity, hiring readiness, and career growth opportunities. Using a network of specialized AI agents—including Recruiter Agent, Resume Agent, GitHub Agent, Project Reviewer Agent, Career Coach Agent, and Interview Agent—DevScope AI simulates real-world hiring and evaluation processes used by recruiters and engineering managers.
              </p>
              <p>
                One of the platform's key differentiators is its <strong>Explainable AI architecture</strong>. Instead of producing black-box scores, DevScope AI visualizes how recommendations and hiring decisions are generated through interconnected reasoning workflows, helping developers understand exactly where they excel and where they need improvement.
              </p>
              <p>
                To create a highly immersive user experience, DevScope AI incorporates a futuristic <strong>3D Developer Intelligence Operating System</strong> interface where skills, projects, repositories, and career pathways are visualized as interactive intelligence networks. This transforms traditional portfolio analysis into an engaging exploration of a developer's technical journey.
              </p>
              <p>
                More than just a portfolio analyzer, DevScope AI serves as a personalized AI-powered career companion that empowers developers to benchmark themselves, identify skill gaps, prepare for interviews, improve project quality, and accelerate professional growth in today's competitive technology landscape.
              </p>
            </div>
          </div>

          {/* System Tech Stack badges */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span 
                  key={tech} 
                  className="px-3 py-1 rounded-md text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Developer Intro & Contact */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-5 flex flex-col gap-6"
        >
          {/* Developer profile card */}
          <div className="glass-panel rounded-2xl p-8 border border-white/10 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest">Architect / Developer</span>
              <h2 className="text-2xl font-bold font-['Outfit'] text-white">Harshvardhan Mishra</h2>
              <p className="text-xs text-purple-300 font-medium">Computer Science Student</p>
            </div>

            <div className="text-sm text-gray-300 font-light leading-relaxed flex flex-col gap-4">
              <p>
                Hi, I'm <strong>Harshvardhan Mishra</strong>, a Computer Science student passionate about Artificial Intelligence, Software Engineering, System Design, and building impactful products.
              </p>
              <p>
                DevScope AI is my flagship project, created to combine AI engineering, developer analytics, and career intelligence into a single platform that helps developers understand their strengths, improve their weaknesses, and prepare for real-world opportunities.
              </p>
              <p>
                Through this project, I aim to demonstrate advanced skills in AI systems, full-stack development, cloud architecture, and product design while solving a meaningful problem for the global developer community.
              </p>
            </div>

            {/* Glowing divider line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

            {/* Contact details */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact Channels</span>
              
              <div className="flex flex-col gap-2 bg-black/40 border border-white/5 rounded-xl p-4 transition-all hover:border-white/15">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wide">Direct Email</span>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <a 
                    href={`mailto:${email}`}
                    className="text-xs text-white hover:text-indigo-400 transition-colors font-medium break-all select-all"
                  >
                    {email}
                  </a>
                  <button 
                    onClick={handleCopyEmail}
                    className={`shrink-0 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                      copied 
                        ? 'bg-green-600/30 border border-green-500/40 text-green-300' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Committee Agents Topology preview */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Agent Topology</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <div 
                  key={agent.name} 
                  className="flex flex-col gap-1 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default"
                >
                  <span className="text-[11px] font-bold text-white font-['Outfit']">{agent.name}</span>
                  <span className="text-[10px] text-gray-400 font-light leading-tight">{agent.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}
