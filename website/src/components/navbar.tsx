'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Code2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-neutral-900 px-6 sm:px-12 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" className="flex items-center gap-3 text-white font-medium text-base group">
          <div className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-700 flex items-center justify-center group-hover:border-neutral-500 transition-colors">
            <span className="text-xs font-mono font-bold text-white">FM</span>
          </div>
          <span className="tracking-tight font-semibold text-white">
            Filemind <span className="text-neutral-500 font-normal">Local MCP</span>
          </span>
        </Link>
      </motion.div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Docs</span>
        </Link>
        <a
          href="https://github.com/Dhruv-Mann/filemind"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <Code2 className="w-4 h-4" />
          <span>Source</span>
        </a>

        {/* Quick Download Navbar Action */}
        <a
          href="/api/download?arch=x64"
          download="filemind.exe"
          className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-black" />
          <span>Download .exe</span>
        </a>
      </div>
    </header>
  );
};
