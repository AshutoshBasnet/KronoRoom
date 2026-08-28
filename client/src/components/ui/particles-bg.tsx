"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  baseOpacity: number;
  opacitySpeed: number;
  sizeSpeed: number;
}

export function ParticlesComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Helper to determine active theme
  const checkIsDarkMode = useCallback((): boolean => {
    if (typeof document === "undefined") return true;
    const html = document.documentElement;
    if (html.classList.contains("dark") || html.getAttribute("data-theme") === "dark") return true;
    if (html.classList.contains("light") || html.getAttribute("data-theme") === "light") return false;
    return window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches || true : true;
  }, []);

  useEffect(() => {
    setIsDark(checkIsDarkMode());

    const observer = new MutationObserver(() => {
      setIsDark(checkIsDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleMedia = () => setIsDark(checkIsDarkMode());
    mediaQuery?.addEventListener("change", handleMedia);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener("change", handleMedia);
    };
  }, [checkIsDarkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 220, // grab radius
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle colors according to specification
    const colors = isDark
      ? {
          particles: "#00f5ff",
          lines: "rgba(0, 217, 255, ",
          accent: "#0096c7",
        }
      : {
          particles: "#0277bd",
          lines: "rgba(2, 136, 209, ",
          accent: "#039be5",
        };

    const particleCount = Math.min(140, Math.max(60, Math.floor((width * height) / 10000)));
    const particles: Particle[] = [];

    const createParticle = (x?: number, y?: number): Particle => {
      const radius = Math.random() * 2 + 1.5;
      const opacity = Math.random() * 0.4 + 0.3;
      return {
        x: x !== undefined ? x : Math.random() * width,
        y: y !== undefined ? y : Math.random() * height,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        radius,
        baseRadius: radius,
        opacity,
        baseOpacity: opacity,
        opacitySpeed: 0.01 + Math.random() * 0.015,
        sizeSpeed: 0.015 + Math.random() * 0.02,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) {
        if (particles.length < 180) {
          particles.push(createParticle(e.clientX + (Math.random() - 0.5) * 20, e.clientY + (Math.random() - 0.5) * 20));
        }
      }
    };

    window.addEventListener("click", handleClick);

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const maxDistance = 160;

      // Draw particle-to-particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${colors.lines}${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Draw grab connections to mouse
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < mouse.radius && mouse.x > 0) {
          const mAlpha = (1 - mDist / mouse.radius) * 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `${colors.lines}${mAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce on borders
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        // Pulse animation
        const pulse = Math.sin(tick * p.opacitySpeed + i);
        p.opacity = Math.max(0.25, Math.min(0.85, p.baseOpacity + pulse * 0.25));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.particles;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = isDark ? 10 : 5;
        ctx.fill();

        // Stroke border
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = colors.accent;
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      id="particles-js"
      className={`
        fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden
        transition-colors duration-500
        bg-gradient-to-tr from-[#e3f2fd] via-[#90caf9] to-[#64b5f6]
        dark:from-[#000814] dark:via-[#003566] dark:to-[#0077b6]
      `}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default ParticlesComponent;
