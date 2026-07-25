import { useState } from 'react';
import { Undo2, FileText, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { FileTransaction } from '../types';
import { undoTransaction } from '../lib/tauri';

interface TransactionCardProps {
  transaction: FileTransaction;
  onUndone: (id: string) => void;
}

export function TransactionCard({ transaction, onUndone }: TransactionCardProps) {
  const [isUndoing, setIsUndoing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUndo = async () => {
    setIsUndoing(true);
    setErrorMsg(null);
    try {
      await undoTransaction(transaction.id);
      onUndone(transaction.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUndoing(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> {(confidence * 100).toFixed(0)}% Fast Path
        </span>
      );
    }
    if (confidence >= 0.70) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> {(confidence * 100).toFixed(0)}% LLM Reasoning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <ShieldAlert className="w-3 h-3" /> Needs Review
      </span>
    );
  };

  const getBorderColor = (confidence: number) => {
    if (transaction.undo_status) return 'border-slate-800 opacity-60';
    if (confidence >= 0.85) return 'border-l-4 border-l-emerald-500 border-slate-800';
    if (confidence >= 0.70) return 'border-l-4 border-l-amber-500 border-slate-800';
    return 'border-l-4 border-l-red-500 border-slate-800';
  };

  return (
    <div className={`bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border transition-all hover:bg-slate-900/80 ${getBorderColor(transaction.confidence)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-slate-800 text-indigo-400 rounded-lg shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono text-indigo-300 font-medium block truncate">
              {transaction.category_path}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {new Date(transaction.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {getConfidenceBadge(transaction.confidence)}

          {!transaction.undo_status ? (
            <button
              onClick={handleUndo}
              disabled={isUndoing}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <Undo2 className={`w-3 h-3 ${isUndoing ? 'animate-spin' : ''}`} />
              Undo
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
              Undone
            </span>
          )}
        </div>
      </div>

      {transaction.summary && (
        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {transaction.summary}
        </p>
      )}

      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 rounded-lg p-2.5 space-y-1 border border-slate-800/50">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-slate-500 shrink-0">From:</span>
          <span className="text-slate-300 truncate" title={transaction.original_path}>
            {transaction.original_path}
          </span>
        </div>
        <div className="flex items-center space-x-2 truncate">
          <span className="text-slate-500 shrink-0">To:</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="text-emerald-400 truncate" title={transaction.new_path}>
            {transaction.new_path}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
