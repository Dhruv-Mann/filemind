'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-neutral-900 px-6 sm:px-12 py-5 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Dhruv-Mann"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition-colors font-medium"
          >
            Built by Dhruv Mann
          </a>
        </div>

        <div className="flex items-center gap-6 text-neutral-400">
          <a href="/docs" className="hover:text-white transition-colors">Docs</a>
          <a href="https://github.com/Dhruv-Mann/filemind" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="/api/download?arch=x64" download="filemind.exe" className="hover:text-white transition-colors">Windows .exe</a>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <span>Built for local privacy</span>
        </div>
      </div>
    </footer>
  );
};
