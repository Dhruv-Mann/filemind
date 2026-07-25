import { ShieldCheck, Wrench, FileSearch } from 'lucide-react';

export function SystemStatus() {
  return (
    <aside className="space-y-6">
      {/* Privacy & System Config Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy & Local Engine
          </span>
        </div>
        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span>Protocol</span>
            <span className="font-mono text-slate-200">MCP Stdio / JSON-RPC</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span>Local LLM</span>
            <span className="font-mono text-slate-200">llama3.2:3b-instruct</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span>DB Engine</span>
            <span className="font-mono text-slate-200">SQLite WAL (rusqlite)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span>Debounce Pipeline</span>
            <span className="font-mono text-slate-200">4-Second Guard</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/50">
            <span>Vector Indexing</span>
            <span className="font-mono text-slate-200">LanceDB + 384-dim</span>
          </div>
        </div>
      </div>

      {/* Local MCP Tools Register Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Wrench className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active MCP Tools
          </h3>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-indigo-300">extract_content</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">Tool</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Extracts raw text (first 2,000 chars) from PDF, DOCX, TXT, MD & image assets.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-indigo-300">move_and_index</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">Tool</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Moves files into category paths, resolves name collisions & writes SQLite ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Target Taxonomy Reference */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileSearch className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Routing Rules
          </h3>
        </div>
        <div className="space-y-1.5 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>&gt; 85% Score:</span>
            <span className="text-slate-300">Auto Vector Fast Path</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span>70-85% Score:</span>
            <span className="text-slate-300">LLM Reasoning Path</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span>&lt; 70% Score:</span>
            <span className="text-slate-300">_Needs_Review/ Directory</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
