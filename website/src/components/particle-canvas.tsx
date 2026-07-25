'use client';

import React, { useEffect, useRef } from 'react';

interface SwarmParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radiusOffset: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initial position centered or offset
    let targetX = width * 0.65;
    let targetY = height * 0.4;
    let currentX = targetX;
    let currentY = targetY;
    let isMouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleColors = ['#60a5fa', '#38bdf8', '#818cf8', '#93c5fd', '#3b82f6'];
    const PARTICLE_COUNT = 110; // Medium-sized particle swarm

    const particles: SwarmParticle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radiusOffset = 15 + Math.random() * 160;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1);
      const baseAlpha = 0.35 + Math.random() * 0.55;

      particles.push({
        x: targetX + Math.cos(angle) * radiusOffset,
        y: targetY + Math.sin(angle) * radiusOffset,
        vx: 0,
        vy: 0,
        radiusOffset,
        angle,
        speed,
        size: Math.random() * 1.8 + 1.2,
        alpha: baseAlpha,
        baseAlpha,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      });
    }

    const render = () => {
      // Smooth lerp following cursor
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update orbital angle around cursor target
        p.angle += p.speed;

        // Desired target position around cursor swarm
        const desiredX = currentX + Math.cos(p.angle) * p.radiusOffset;
        const desiredY = currentY + Math.sin(p.angle) * p.radiusOffset;

        // Velocity spring physics towards desired position
        p.vx += (desiredX - p.x) * 0.06;
        p.vy += (desiredY - p.y) * 0.06;

        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;

        // Render dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isMouseActive ? p.baseAlpha : p.baseAlpha * 0.6;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
