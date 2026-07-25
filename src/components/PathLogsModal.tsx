import { useState } from 'react';
import type { FileTransaction } from '../types';
import { undoTransaction } from '../lib/tauri';

interface PathLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: FileTransaction[];
  onUndone: (id: string) => void;
}

export function PathLogsModal({
  isOpen,
  onClose,
  transactions,
  onUndone,
}: PathLogsModalProps) {
  const [isUndoingId, setIsUndoingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUndo = async (id: string) => {
    setIsUndoingId(id);
    try {
      await undoTransaction(id);
      onUndone(id);
    } catch (err) {
      console.error('Failed to undo transaction:', err);
    } finally {
      setIsUndoingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary" data-icon="history">
              history
            </span>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Path Activity Logs ({transactions.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-1 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="close">
              close
            </span>
          </button>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px]" data-icon="folder_open">
                folder_open
              </span>
              <p className="font-body-sm text-body-sm">No file activity logs recorded yet.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className={`bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-2 transition-all ${
                  tx.undo_status ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-label-code text-label-code text-[#38BDF8]">
                    <span className="material-symbols-outlined text-[16px]">folder</span>
                    <span>{tx.category_path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-label-code text-on-surface-variant">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                    {!tx.undo_status ? (
                      <button
                        onClick={() => handleUndo(tx.id)}
                        disabled={isUndoingId === tx.id}
                        className="bg-surface-container-highest hover:bg-secondary-container text-on-surface text-[12px] font-body-sm px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <span className={`material-symbols-outlined text-[14px] ${isUndoingId === tx.id ? 'animate-spin' : ''}`}>
                          undo
                        </span>
                        Undo Move
                      </button>
                    ) : (
                      <span className="text-[11px] font-label-code text-outline px-2 py-0.5 rounded bg-surface-container-lowest">
                        Undone
                      </span>
                    )}
                  </div>
                </div>

                {tx.summary && (
                  <p className="font-body-sm text-[13px] text-on-surface-variant italic">
                    "{tx.summary}"
                  </p>
                )}

                <div className="font-label-code text-[11px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/40 space-y-1">
                  <div className="truncate">
                    <span className="text-outline">From: </span>
                    <span>{tx.original_path}</span>
                  </div>
                  <div className="truncate text-emerald-400">
                    <span className="text-outline">To: </span>
                    <span>{tx.new_path}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="bg-surface-container-highest hover:bg-secondary-container text-on-surface font-body-sm text-body-sm px-4 py-1.5 rounded transition-colors cursor-pointer"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
}
