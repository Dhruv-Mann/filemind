interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  onModelChange: (model: string) => void;
}

export function SettingsModal({ isOpen, onClose, modelName, onModelChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary" data-icon="settings">
              settings
            </span>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Organizer Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-1 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4 font-body-sm text-body-sm">
          <div className="space-y-1">
            <label className="text-on-surface-variant block">Active Local Ollama LLM Model</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded h-10 px-3 font-body-sm text-on-surface focus:border-primary focus:outline-none"
              placeholder="e.g. qwen3.5:4b"
            />
            <p className="text-[12px] text-outline">Runs 100% locally on http://localhost:11434</p>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-on-surface-variant block">Debounce Delay</label>
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-2.5 font-label-code text-label-code text-on-surface">
              4.0 Seconds (Mandatory for complete file downloads)
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-on-surface-variant block">Database Engine</label>
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-2.5 font-label-code text-label-code text-on-surface">
              SQLite WAL Mode (rusqlite)
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-body-sm text-body-sm px-5 py-2 rounded transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
