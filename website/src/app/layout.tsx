import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Download Filemind — Privacy-First Local AI File Organizer',
  description: 'A 100% private, local-first desktop application that automatically categorizes and organizes your files using local Ollama LLM and Model Context Protocol.',
  keywords: ['Filemind', 'Tauri', 'Rust', 'MCP', 'Model Context Protocol', 'File Organizer', 'Ollama', 'Local AI'],
  openGraph: {
    title: 'Download Filemind — Local MCP File Organizer',
    description: '100% Private, Local-First Semantic File Organizer powered by Ollama and Tauri v2.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark scroll-smooth`}>
      <body className="bg-black text-white font-sans antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
