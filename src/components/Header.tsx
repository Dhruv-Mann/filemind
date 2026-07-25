import { FolderCheck, Cpu, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRunBatch: () => void;
  isProcessing: boolean;
  modelName?: string;
}

export function Header({ onRunBatch, isProcessing, modelName = 'qwen3.5:4b' }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
          <FolderCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
            Local MCP File Organizer
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100% Local
            </span>
          </h1>
          <p className="text-xs text-slate-400">Semantic AI File Categorization & Real-time Ledger</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-slate-300">Ollama: <strong className="text-white font-mono">{modelName}</strong></span>
        </div>

        <button
          onClick={onRunBatch}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? 'Processing...' : 'Run Batch Processing'}
        </button>
      </div>
    </header>
  );
}
