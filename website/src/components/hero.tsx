'use client';

import React from 'react';
import { ParticleCanvas } from './particle-canvas';
import { DownloadPills } from './download-pills';
import { TextAnimate } from './ui/text-animate';

export const Hero: React.FC = () => {
  return (
    <section className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-hidden bg-black text-white selection:bg-blue-500 selection:text-white">
      {/* Dynamic Cursor-Following Swarm Canvas Background */}
      <ParticleCanvas />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl py-6 my-auto">
        {/* Magic UI BlurIn Title */}
        <TextAnimate
          animation="blurIn"
          as="h1"
          delay={0.1}
          className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-white"
        >
          Download Filemind
          <br className="hidden sm:inline" />
          <span className="text-neutral-400"> Local MCP Organizer</span>
          {/* Antigravity vertical blinking cursor accent */}
          <span className="inline-block w-[3px] h-[0.9em] ml-2.5 align-baseline bg-gradient-to-b from-blue-400 via-emerald-400 to-amber-400 animate-pulse rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
        </TextAnimate>

        {/* Magic UI FadeIn by line Subtitle Paragraph */}
        <TextAnimate
          animation="fadeIn"
          by="line"
          as="p"
          delay={0.3}
          className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl font-normal leading-relaxed"
        >
          {`A private, local-first desktop application that categorizes and organizes your Downloads directory (or any custom target directory)\nusing embedded Ollama AI inference and real-time transaction undo capabilities.`}
        </TextAnimate>

        {/* Action Pills */}
        <DownloadPills version="v0.1.0" />
      </div>
    </section>
  );
};
