import { Activity, FolderCheck } from 'lucide-react';
import type { FileTransaction } from '../types';
import { TransactionCard } from './TransactionCard';

interface ActivityFeedProps {
  transactions: FileTransaction[];
  onUndone: (id: string) => void;
}

export function ActivityFeed({ transactions, onUndone }: ActivityFeedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Live Operation Feed ({transactions.length})
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Monitoring ~/Downloads</span>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FolderCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-slate-300">File Watcher Listening</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Drop any document or image into <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">~/Downloads</code> to trigger debounced extraction, Ollama classification, and automatic organization.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} onUndone={onUndone} />
          ))}
        </div>
      )}
    </section>
  );
}
