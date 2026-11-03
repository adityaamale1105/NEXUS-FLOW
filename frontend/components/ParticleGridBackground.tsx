"use client";

import React, { useEffect, useRef } from "react";

export const ParticleGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBlobs();
    };

    window.addEventListener("resize", handleResize);

    const BLOB_DEFS = [
      { r: 0.52, rxScale: 1.1, baseColor: [48, 37, 31],   opacity: 0.32, speed: 0.003 }, // Walnut brown
      { r: 0.44, rxScale: 0.9, baseColor: [73, 55, 45],   opacity: 0.22, speed: 0.004 }, // Warm brown
      { r: 0.36, rxScale: 1.0, baseColor: [163, 177, 138],opacity: 0.075,speed: 0.005 }, // Sage green
      { r: 0.30, rxScale: 0.8, baseColor: [111, 152, 125],opacity: 0.065,speed: 0.003 }, // Muted emerald
      { r: 0.20, rxScale: 1.2, baseColor: [99, 214, 208],  opacity: 0.038,speed: 0.006 }, // Electric cyan
    ];

    let blobs: Array<any> = [];

    function initBlobs() {
      blobs = BLOB_DEFS.map((def, i) => ({
        x: (0.15 + (i * 0.2)) * width,
        y: (0.2 + ((i * 0.25) % 0.6)) * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        rx: def.r * Math.min(width, height) * def.rxScale,
        ry: def.r * Math.min(width, height),
        color: def.baseColor,
        opacity: def.opacity,
        phase: i * (Math.PI * 0.4),
        speed: def.speed
      }));
    }
    initBlobs();

    let tick = 0;

    const render = () => {
      if (!prefersReducedMotion) {
        tick++;
      }

      ctx.fillStyle = "#0B0B0D";
      ctx.fillRect(0, 0, width, height);

      // Subtle warm graphite grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 1;
      const gridSize = 80;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Atmospheric Blooms
      for (const blob of blobs) {
        if (!prefersReducedMotion) {
          blob.x += blob.vx + Math.sin(tick * blob.speed + blob.phase) * 0.15;
          blob.y += blob.vy + Math.cos(tick * blob.speed + blob.phase) * 0.12;

          if (blob.x < -blob.rx) blob.x = width + blob.rx;
          if (blob.x > width + blob.rx) blob.x = -blob.rx;
          if (blob.y < -blob.ry) blob.y = height + blob.ry;
          if (blob.y > height + blob.ry) blob.y = -blob.ry;
        }

        const [r, g, b] = blob.color;
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.rx);
        grad.addColorStop(0,   `rgba(${r},${g},${b},${blob.opacity})`);
        grad.addColorStop(0.45,`rgba(${r},${g},${b},${blob.opacity * 0.45})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.ellipse(blob.x, blob.y, blob.rx, blob.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
