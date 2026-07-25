import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ActivityFeed } from './components/ActivityFeed';
import { SystemStatus } from './components/SystemStatus';
import type { FileTransaction } from './types';
import { getTransactions } from './lib/tauri';

export default function App() {
  const [transactions, setTransactions] = useState<FileTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load initial transaction ledger history from SQLite backend
    getTransactions().then((txs) => {
      if (Array.isArray(txs)) {
        setTransactions(txs);
      }
    });
  }, []);

  const handleRunBatch = () => {
    setIsProcessing(true);
    // Refresh ledger after batch triggering
    setTimeout(() => {
      getTransactions().then((txs) => {
        if (Array.isArray(txs)) {
          setTransactions(txs);
        }
        setIsProcessing(false);
      });
    }, 1500);
  };

  const handleUndone = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, undo_status: true } : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onRunBatch={handleRunBatch} isProcessing={isProcessing} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed transactions={transactions} onUndone={handleUndone} />
        </div>

        <div>
          <SystemStatus />
        </div>
      </main>
    </div>
  );
}
