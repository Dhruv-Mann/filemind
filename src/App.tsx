import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { PathLogsModal } from './components/PathLogsModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import type { FileTransaction } from './types';
import {
  getTransactions,
  getModelInfo,
  runBatchProcessing,
  openExternalUrl,
} from './lib/tauri';

export default function App() {
  const [folderPath, setFolderPath] = useState('C:/Users/Dhruv Mann/Downloads/Downloads');
  const [transactions, setTransactions] = useState<FileTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState(true);
  const [modelName, setModelName] = useState('qwen3.5:4b');
  const [processedCount, setProcessedCount] = useState(0);

  // Modals state
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    // Fetch transaction ledger history from SQLite backend
    getTransactions().then((txs) => {
      if (Array.isArray(txs)) {
        setTransactions(txs);
        setProcessedCount(txs.length);
      }
    });

    // Check Ollama connectivity and watch path
    getModelInfo().then((info) => {
      if (info) {
        setIsOllamaConnected(info.available ?? true);
        if (info.model) setModelName(info.model);
        if ((info as unknown as { watch_dir?: string }).watch_dir) {
          setFolderPath((info as unknown as { watch_dir?: string }).watch_dir || 'C:/Users/Dhruv Mann/Downloads/Downloads');
        }
      }
    });

    // Listen for real-time file-processed events from Rust backend
    const unlisten = listen<FileTransaction>('file-processed', (event) => {
      if (event.payload) {
        setTransactions((prev) => [event.payload, ...prev]);
        setProcessedCount((c) => c + 1);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleStartCategorizing = async () => {
    setIsProcessing(true);
    try {
      await runBatchProcessing();
    } catch (err) {
      console.error('Batch processing failed:', err);
    } finally {
      setTimeout(() => {
        getTransactions().then((txs) => {
          if (Array.isArray(txs)) {
            setTransactions(txs);
            setProcessedCount(txs.length);
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
    <div className="h-full flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-6 h-16 shrink-0 fixed top-0 z-40">
        <div className="flex items-center">
          <span className="text-headline-md font-headline-md font-semibold text-on-surface">
            FileOrganizer
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-secondary hover:bg-surface-container transition-colors p-2 rounded cursor-pointer active:opacity-80 flex items-center justify-center"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="settings">
              settings
            </span>
          </button>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-secondary hover:bg-surface-container transition-colors p-2 rounded cursor-pointer active:opacity-80 flex items-center justify-center"
            title="Help"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="help">
              help
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center mt-16 mb-[60px] px-6">
        <div className="w-full max-w-[600px] flex flex-col items-center text-center">
          <h1 className="font-display text-display text-on-surface mb-2">
            Organize your files
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            Specify the folder path to begin intelligent categorization.
          </p>

          {/* Input Group */}
          <div className="w-full flex flex-col items-start mb-8">
            <label
              className="font-body-sm text-body-sm text-on-surface-variant mb-1 ml-2"
              htmlFor="folderPath"
            >
              Target Folder
            </label>

            <div className="w-full relative flex items-center">
              <span
                className="material-symbols-outlined absolute left-3 text-outline z-10 text-[20px]"
                data-icon="folder"
              >
                folder
              </span>
              <input
                id="folderPath"
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="e.g., C:/Users/Name/Downloads"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded h-12 pl-10 pr-4 py-2 font-body-sm text-body-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleStartCategorizing}
            disabled={isProcessing}
            className="bg-blue-600 text-white hover:bg-blue-700 active:brightness-90 transition-all rounded px-8 h-12 font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 shadow-sm w-[280px] cursor-pointer disabled:opacity-60"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isProcessing ? 'animate-spin' : ''
              }`}
              data-icon="auto_awesome"
            >
              {isProcessing ? 'sync' : 'auto_awesome'}
            </span>
            {isProcessing ? 'Categorizing...' : 'Start Categorizing'}
          </button>

          {/* Status Bar */}
          <div className="mt-6 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOllamaConnected ? 'bg-[#10b981] animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Ollama: {isOllamaConnected ? `Connected (${modelName})` : 'Disconnected'}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant fixed bottom-0 w-full flex justify-between items-center px-6 py-2 h-[60px] z-40">
        <div className="flex items-center gap-6">
          <span className="font-body-sm text-body-sm text-on-surface-variant cursor-default flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 opacity-80" />
            v1.0.4 • {isProcessing ? 'Categorizing files...' : 'Ready to scan'}
            {processedCount > 0 && ` • ${processedCount} logged`}
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Combined GitHub Icon + Documentation Link (Opens in System Browser via Shell Plugin) */}
          <button
            onClick={() => openExternalUrl('https://github.com/Dhruv-Mann/filemind')}
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer group bg-transparent border-0 p-0"
          >
            <svg
              className="w-4 h-4 fill-on-surface-variant group-hover:fill-primary transition-colors shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Documentation</span>
          </button>

          <button
            onClick={() => setIsLogsOpen(true)}
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Activity Logs ({transactions.length})
          </button>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PathLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        transactions={transactions}
        onUndone={handleUndone}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelName={modelName}
        onModelChange={setModelName}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
