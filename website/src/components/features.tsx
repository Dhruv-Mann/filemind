'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Terminal, RotateCcw, Eye, FolderKanban } from 'lucide-react';

const featureList = [
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    title: '100% Privacy & Offline AI',
    description: 'All document categorization runs locally on your machine via Ollama. No telemetry, no API keys, zero internet calls.',
  },
  {
    icon: Terminal,
    color: 'text-blue-400',
    title: 'Native MCP Protocol',
    description: 'Functions as a Model Context Protocol server over stdio. Seamlessly connect Claude Desktop or Cursor IDE to query your file taxonomy.',
  },
  {
    icon: RotateCcw,
    color: 'text-amber-400',
    title: 'SQLite Transaction Ledger',
    description: 'Every automated file relocation is logged as an atomic transaction. Revert any accidental move with 1-click instant undo.',
  },
  {
    icon: Cpu,
    color: 'text-cyan-400',
    title: 'Tauri v2 + Rust Core',
    description: 'Ultra-lightweight native desktop app with <30MB memory footprint. Engineered in Rust for blazingly fast text extraction and IO.',
  },
  {
    icon: Eye,
    color: 'text-indigo-400',
    title: 'Debounced File Watcher',
    description: 'Continuously monitors ~/Downloads with a intelligent 4-second debounce buffer to allow downloads to finish safely before organizing.',
  },
  {
    icon: FolderKanban,
    color: 'text-purple-400',
    title: 'Smart Confidence Routing',
    description: 'High confidence files route automatically. Low confidence (<0.70) files route into _Needs_Review/ for human review.',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-28 px-6 sm:px-12 lg:px-24 bg-black border-t border-neutral-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Engineered for Privacy & Control</h2>
          <p className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Local AI intelligence meet native desktop performance.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative p-7 rounded-2xl bg-neutral-950/80 border border-neutral-900 hover:border-neutral-800 transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Subtle top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent group-hover:via-blue-500/50 transition-colors" />

                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>

                <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-normal">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
