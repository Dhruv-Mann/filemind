'use client';

import React from 'react';
import { FolderGit2, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-neutral-900 px-6 sm:px-12 py-12 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">Built by Dhruv Mann</span>
        </div>

        <div className="flex items-center gap-6 text-neutral-400">
          <a href="/docs" className="hover:text-white transition-colors">Docs</a>
          <a href="https://github.com/Dhruv-Mann/filemind" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="/downloads/Local_MCP_File_Organizer_0.1.0_x64-setup.exe" download className="hover:text-white transition-colors">Windows .exe</a>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Built for local privacy</span>
        </div>
      </div>
    </footer>
  );
};
