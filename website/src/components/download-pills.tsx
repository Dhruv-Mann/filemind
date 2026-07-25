'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Monitor, BookOpen } from 'lucide-react';

interface DownloadPillsProps {
  version?: string;
}

export const DownloadPills: React.FC<DownloadPillsProps> = ({ version = 'v0.1.0' }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
      {/* Primary Pill: x64 Windows Installer (filemind.exe) */}
      <motion.a
        href="/api/download?arch=x64"
        download="filemind.exe"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(255, 255, 255, 0.2)' }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-medium text-sm transition-all shadow-lg cursor-pointer select-none"
      >
        <Download className="w-4 h-4 text-black transition-transform group-hover:-translate-y-0.5" />
        <span>Download for Windows (.exe)</span>
      </motion.a>

      {/* Secondary Pill: ARM64 Windows Installer */}
      <motion.a
        href="/api/download?arch=arm64"
        download="filemind.exe"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.04, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-neutral-900/90 text-white font-medium text-sm border border-neutral-700/80 backdrop-blur-md transition-all cursor-pointer select-none hover:border-neutral-500"
      >
        <Monitor className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
        <span>Download for ARM64</span>
      </motion.a>

      {/* Docs Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link
          href="/docs"
          className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-transparent text-neutral-300 font-medium text-sm border border-neutral-800 backdrop-blur-md transition-all cursor-pointer hover:border-neutral-600 hover:text-white"
        >
          <BookOpen className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span>Documentation</span>
        </Link>
      </motion.div>
    </div>
  );
};
