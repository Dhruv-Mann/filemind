import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Header } from './components/Header';
import { ActivityFeed } from './components/ActivityFeed';
import { SystemStatus } from './components/SystemStatus';
import type { FileTransaction } from './types';
import { getTransactions, getModelInfo, runBatchProcessing } from './lib/tauri';

export default function App() {
  const [transactions, setTransactions] = useState<FileTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelName, setModelName] = useState('qwen3.5:4b');

  useEffect(() => {
    // Load initial transaction ledger history from SQLite backend
    getTransactions().then((txs) => {
      if (Array.isArray(txs)) {
        setTransactions(txs);
      }
    });

    // Fetch active model configuration
    getModelInfo().then((info) => {
      if (info && info.model) {
        setModelName(info.model);
      }
    });

    // Listen for real-time file-processed events from Rust backend
    const unlisten = listen<FileTransaction>('file-processed', (event) => {
      if (event.payload) {
        setTransactions((prev) => [event.payload, ...prev]);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleRunBatch = async () => {
    setIsProcessing(true);
    try {
      await runBatchProcessing();
    } catch (err) {
      console.error('Failed to trigger batch processing:', err);
    } finally {
      setTimeout(() => {
        getTransactions().then((txs) => {
          if (Array.isArray(txs)) {
            setTransactions(txs);
          }
          setIsProcessing(false);
        });
      }, 2000);
    }
  };

  const handleUndone = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, undo_status: true } : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onRunBatch={handleRunBatch} isProcessing={isProcessing} modelName={modelName} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed transactions={transactions} onUndone={handleUndone} />
        </div>

        <div>
          <SystemStatus modelName={modelName} />
        </div>
      </main>
    </div>
  );
}
