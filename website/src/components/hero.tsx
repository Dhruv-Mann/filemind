'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ParticleCanvas } from './particle-canvas';
import { DownloadPills } from './download-pills';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-hidden bg-black text-white selection:bg-blue-500 selection:text-white">
      {/* Dynamic Cursor-Following Swarm Canvas Background */}
      <ParticleCanvas />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl py-16 my-auto">
        {/* Top Minimal Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono mb-6"
        >
          <span>v0.1.0 • Tauri v2 • MCP Protocol</span>
        </motion.div>

        {/* Hero Title matching Google Antigravity aesthetic */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-white"
        >
          Download Local MCP
          <br className="hidden sm:inline" />
          <span className="text-neutral-400"> File Organizer</span>
          {/* Antigravity vertical blinking cursor accent */}
          <span className="inline-block w-[3px] h-[0.9em] ml-2.5 align-baseline bg-gradient-to-b from-blue-400 via-emerald-400 to-amber-400 animate-pulse rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl font-normal leading-relaxed"
        >
          A private, local-first desktop application that categorizes and organizes your files using embedded Ollama AI inference and real-time transaction undo capabilities.
        </motion.p>

        {/* Action Pills */}
        <DownloadPills version="v0.1.0" />
      </div>
    </section>
  );
};
