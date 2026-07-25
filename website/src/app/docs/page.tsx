'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Download, ChevronRight, Copy, Check, Terminal, Cpu, ShieldCheck, Database, BookOpen } from 'lucide-react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('getting-started');

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

          {/* Section: Ollama Setup */}
          <section id="ollama-setup" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Local Ollama AI Configuration</h2>
            <p className="text-sm text-neutral-400">
              The application connects to Ollama running locally at <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-emerald-400">http://localhost:11434</code>. Pull the recommended models using terminal:
            </p>

            {/* Code Snippet Box */}
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

          {/* Section: MCP Configuration */}
          <section id="claude-desktop" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Model Context Protocol (MCP) Setup</h2>
            <p className="text-sm text-neutral-400">
              Add the Local MCP File Organizer binary to your <code className="font-mono text-xs bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-blue-400">claude_desktop_config.json</code>:
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

          {/* Section: SQLite Ledger & Undo */}
          <section id="sqlite-ledger" className="space-y-6 scroll-mt-28 pt-8 border-t border-neutral-900">
            <h2 className="text-2xl font-semibold text-white tracking-tight">SQLite Transaction Ledger & Safety</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every automated file move operation performed by the file watcher or MCP tool is recorded inside a local SQLite ledger database (`rusqlite`). In case of an unexpected relocation, any transaction can be reverted with 1-click single-file or batch undo.
            </p>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Confidence Score Threshold:</span> Files with AI classification confidence below 70% (<code className="font-mono text-blue-300">confidence_score &lt; 0.70</code>) are safely routed into a <code className="font-mono text-blue-300">_Needs_Review/</code> staging folder rather than being moved automatically.
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
