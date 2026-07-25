'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Download, ChevronRight, Copy, Check, Terminal, Cpu, ShieldCheck, Database, BookOpen, HardDrive, Lock } from 'lucide-react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const navSections = [
    {
      title: 'Getting Started',
      items: [
        { id: 'overview', label: 'Overview' },
        { id: 'installation', label: 'Installation' },
        { id: 'system-requirements', label: 'System Requirements' },
      ],
    },
    {
      title: 'Local AI Configuration',
      items: [
        { id: 'ollama-setup', label: 'Ollama Setup' },
        { id: 'model-selection', label: 'LLM & Embeddings' },
      ],
    },
    {
      title: 'MCP Server Integration',
      items: [
        { id: 'mcp-overview', label: 'Model Context Protocol' },
        { id: 'claude-desktop', label: 'Claude Desktop Config' },
        { id: 'cursor-ide', label: 'Cursor IDE Config' },
      ],
    },
    {
      title: 'Architecture & Safety',
      items: [
        { id: 'sqlite-ledger', label: 'SQLite Undo Ledger' },
        { id: 'file-watcher', label: 'File Watcher & Debounce' },
        { id: 'privacy-guarantee', label: 'Privacy Guarantees' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white flex flex-col">
      <Navbar />

      {/* Docs Subheader Breadcrumb */}
      <div className="w-full border-b border-neutral-900 bg-neutral-950/60 px-6 sm:px-12 py-3 text-xs text-neutral-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-white font-medium">Documentation</span>
      </div>

      {/* Main Docs Body Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Sticky Sidebar */}
        <aside className="lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-8 pr-4 border-r border-neutral-900/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Documentation Index</span>
            </div>

            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">{section.title}</h4>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                          activeSection === item.id
                            ? 'bg-neutral-900 text-white font-medium border-l-2 border-blue-500'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-950'
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Article */}
        <main className="lg:col-span-9 max-w-3xl space-y-16">

          {/* Section: Overview */}
          <section id="overview" className="space-y-4 scroll-mt-28">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Local MCP File Organizer Documentation</h1>
            <p className="text-base text-neutral-400 leading-relaxed">
              Local MCP File Organizer is a 100% private, local-first desktop application engineered with Tauri v2 (Rust backend + React frontend). It automatically categorizes and organizes your <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-blue-400">~/Downloads</code> directory using local LLMs (via Ollama) and exposes a Model Context Protocol (MCP) server for Claude Desktop and Cursor IDE.
            </p>
          </section>

          {/* Section: Installation */}
          <section id="installation" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Installation</h2>
            <p className="text-sm text-neutral-400">Download the pre-compiled installer for your target architecture:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/downloads/Local_MCP_File_Organizer_0.1.0_x64-setup.exe"
                download
                className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Windows x64 Installer (.exe)</div>
                  <div className="text-xs text-neutral-500 mt-1">64-bit Intel / AMD processors</div>
                </div>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </a>

              <a
                href="/downloads/Local_MCP_File_Organizer_0.1.0_arm64-setup.exe"
                download
                className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Windows ARM64 Installer (.exe)</div>
                  <div className="text-xs text-neutral-500 mt-1">ARM64 architecture devices</div>
                </div>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </section>

          {/* Section: System Requirements */}
          <section id="system-requirements" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">System Requirements</h2>
            <p className="text-sm text-neutral-400">Review the hardware and local dependency requirements before deploying:</p>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-mono uppercase">
                  <tr>
                    <th className="p-3.5">Component</th>
                    <th className="p-3.5">Minimum Specification</th>
                    <th className="p-3.5">Recommended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  <tr>
                    <td className="p-3.5 font-medium text-white">Operating System</td>
                    <td className="p-3.5">Windows 10 64-bit (Build 19041+)</td>
                    <td className="p-3.5">Windows 11 x64 or ARM64</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-white">RAM</td>
                    <td className="p-3.5">8 GB System RAM</td>
                    <td className="p-3.5">16 GB+ System RAM</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-white">Local LLM Engine</td>
                    <td className="p-3.5">Ollama v0.3.0+ (<code className="font-mono text-blue-400">http://localhost:11434</code>)</td>
                    <td className="p-3.5">Ollama v0.3.14+ with GPU acceleration</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-white">Disk Space</td>
                    <td className="p-3.5">500 MB (App) + 3 GB for Ollama model</td>
                    <td className="p-3.5">SSD Storage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Ollama Setup */}
          <section id="ollama-setup" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Local Ollama AI Configuration</h2>
            <p className="text-sm text-neutral-400">
              The application connects to Ollama running locally at <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-emerald-400">http://localhost:11434</code>. Pull the recommended models using terminal:
            </p>

            <div className="relative rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/60 border-b border-neutral-800 text-neutral-400">
                <span>Terminal Command</span>
                <button
                  onClick={() => copyToClipboard('ollama pull llama3.2:3b-instruct-q4_K_M\nollama pull bge-small-en-v1.5', 'ollama')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {copiedCode === 'ollama' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'ollama' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-neutral-200 overflow-x-auto leading-relaxed">
{`# 1. Install Llama 3.2 3B Instruct model for semantic document classification
ollama pull llama3.2:3b-instruct-q4_K_M

# 2. Install BGE Small embedding model for vector search indexing
ollama pull bge-small-en-v1.5`}
              </pre>
            </div>
          </section>

          {/* Section: LLM & Embeddings */}
          <section id="model-selection" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">LLM & Embedding Models</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              The hybrid classification pipeline combines file extension rules, keyword extraction, and vector embedding similarity with <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-blue-400">bge-small-en-v1.5</code>.
            </p>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-3 text-xs">
              <div className="font-semibold text-white">Classification Pipeline:</div>
              <ul className="space-y-2 text-neutral-400 list-disc list-inside">
                <li><strong className="text-neutral-200">Text Extractors:</strong> Custom Rust text parsers for PDF, DOCX, TXT, and Markdown files.</li>
                <li><strong className="text-neutral-200">Confidence Routing:</strong> Score &ge; 0.70 routes directly to target category (e.g., <code className="font-mono text-blue-400">Documents/Invoices/</code>). Score &lt; 0.70 routes to <code className="font-mono text-amber-400">_Needs_Review/</code>.</li>
              </ul>
            </div>
          </section>

          {/* Section: MCP Overview */}
          <section id="mcp-overview" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Model Context Protocol (MCP)</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Local MCP File Organizer implements the official Model Context Protocol over stdio (JSON-RPC 2.0). Exposed MCP tools include:
            </p>
            <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono">
              <li><strong className="text-blue-400">organize_downloads:</strong> Trigger batch classification and reorganization.</li>
              <li><strong className="text-emerald-400">query_file_taxonomy:</strong> Inspect file taxonomy and folder structure.</li>
              <li><strong className="text-amber-400">undo_last_transaction:</strong> Revert the last file move operation.</li>
            </ul>
          </section>

          {/* Section: MCP Configuration */}
          <section id="claude-desktop" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Claude Desktop Configuration</h2>
            <p className="text-sm text-neutral-400">
              Add the Local MCP File Organizer executable path to your <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-blue-400">claude_desktop_config.json</code>:
            </p>

            <div className="relative rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/60 border-b border-neutral-800 text-neutral-400">
                <span>claude_desktop_config.json</span>
                <button
                  onClick={() => copyToClipboard(`{\n  "mcpServers": {\n    "local-file-organizer": {\n      "command": "C:\\\\Program Files\\\\Local MCP File Organizer\\\\local-mcp-file-organizer.exe",\n      "args": ["--mcp-stdio"]\n    }\n  }\n}`, 'mcp-config')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {copiedCode === 'mcp-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'mcp-config' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-neutral-200 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "local-file-organizer": {
      "command": "C:\\\\Program Files\\\\Local MCP File Organizer\\\\local-mcp-file-organizer.exe",
      "args": ["--mcp-stdio"]
    }
  }
}`}
              </pre>
            </div>
          </section>

          {/* Section: Cursor IDE Configuration */}
          <section id="cursor-ide" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Cursor IDE Configuration</h2>
            <p className="text-sm text-neutral-400">
              In Cursor IDE settings (under <em>Features &gt; MCP Servers</em>), add a new MCP server:
            </p>

            <div className="relative rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/60 border-b border-neutral-800 text-neutral-400">
                <span>.cursor/mcp.json</span>
                <button
                  onClick={() => copyToClipboard(`{\n  "mcpServers": {\n    "local-organizer": {\n      "command": "local-mcp-file-organizer",\n      "args": ["--mcp-stdio"]\n    }\n  }\n}`, 'cursor-config')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {copiedCode === 'cursor-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'cursor-config' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-neutral-200 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "local-organizer": {
      "command": "local-mcp-file-organizer",
      "args": ["--mcp-stdio"]
    }
  }
}`}
              </pre>
            </div>
          </section>

          {/* Section: SQLite Ledger & Undo */}
          <section id="sqlite-ledger" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">SQLite Transaction Ledger & Safety</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every automated file move operation performed by the file watcher or MCP tool is recorded inside a local SQLite ledger database (`rusqlite`). In case of an unexpected relocation, any transaction can be reverted with 1-click single-file or batch undo.
            </p>
          </section>

          {/* Section: File Watcher */}
          <section id="file-watcher" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">File Watcher &amp; Debounce Protection</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              The Rust backend relies on the <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-blue-400">notify</code> crate with a 4-second debounce buffer. Files with extensions such as <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-amber-400">.crdownload</code>, <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-amber-400">.part</code>, and <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-amber-400">.tmp</code> are automatically ignored until download streams finalize.
            </p>
          </section>

          {/* Section: Privacy Guarantees */}
          <section id="privacy-guarantee" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Privacy Guarantees</h2>
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-neutral-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Network Telemetry</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                All AI inference, embeddings, SQLite database transactions, and file IO take place exclusively on your local computer. No cloud telemetry, zero external HTTP calls, and no remote servers ever touch your files.
              </p>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
