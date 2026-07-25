interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary" data-icon="help">
              help
            </span>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              FileOrganizer Help & Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-1 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
          <div className="space-y-1">
            <h4 className="text-on-surface font-semibold">1. How Categorization Works</h4>
            <p className="text-[13px] leading-relaxed">
              FileOrganizer extracts text content from your documents (PDF, DOCX, TXT, MD, Images) and uses your local LLM (qwen3.5:4b) via Ollama to determine the ideal 2-level category folder.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-on-surface font-semibold">2. 1-Click Undo Security</h4>
            <p className="text-[13px] leading-relaxed">
              Every file move is logged to SQLite before execution. Click <strong>Path Logs</strong> anytime to inspect or undo any move operation with 1 click.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-on-surface font-semibold">3. Privacy Guarantee</h4>
            <p className="text-[13px] leading-relaxed">
              100% local operation. No files or text ever leave your computer.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="bg-surface-container-highest hover:bg-secondary-container text-on-surface font-body-sm text-body-sm px-5 py-2 rounded transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
