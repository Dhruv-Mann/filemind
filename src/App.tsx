import React from 'react';
import { FolderCheck, Cpu, RefreshCw, Undo2, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
              Local MCP File Organizer
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Local
              </span>
            </h1>
            <p className="text-xs text-slate-400">Semantic AI File Categorization & Real-time Ledger</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-slate-300">Ollama: <strong className="text-white">llama3.2:3b</strong></span>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            <RefreshCw className="w-3.5 h-3.5" />
            Run Batch Processing
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Activity Feed */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Live Operation Feed</h2>
            </div>
            <span className="text-xs text-slate-400">Monitoring ~/Downloads</span>
          </div>

          {/* Placeholder / Empty State */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <FolderCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-300">File Watcher Ready</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any file dropped into <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">~/Downloads</code> will be automatically extracted, classified by LLM, and organized cleanly.
            </p>
          </div>
        </section>

        {/* Right Column: Taxonomy & System Status */}
        <section className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy & Local Engine
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Protocol</span>
                <span className="font-mono text-slate-200">MCP Stdio / JSON-RPC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>DB Engine</span>
                <span className="font-mono text-slate-200">SQLite (rusqlite)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>OCR Extractor</span>
                <span className="font-mono text-slate-200">Local Native Extractors</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span>Vector Search</span>
                <span className="font-mono text-slate-200">LanceDB + 384-dim</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
