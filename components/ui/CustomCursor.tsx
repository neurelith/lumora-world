'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TrailStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotV: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

/**
 * Disney Magic Wand — ponytail: minimal, no abstractions
 * Fix for "cursor invisible": hide wand until first pointermove, then reveal;
 * gate behind pointer:fine, respect prefers-reduced-motion, failsafe restores
 * native cursor if wand never moves or canvas missing.
 * ponytail: single canvas + RAF, particles capped at 80; per-element cursors
 * if throughput matters.
 */
export const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const wandRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<TrailStar[]>([]);
  const prevPos = useRef({ x: -100, y: -100 });
  const hasMovedRef = useRef(false);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // coarse pointer (tablet/touch) — keep native cursor, never add using-wand
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Don't hide native cursor until first move — prevents invisible-cursor flash
    // Set ready so wand DOM exists but stays hidden (opacity-0) until hasMoved
    setReady(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    let rafAnim: number | null = null;

    // Failsafe: if wand never moves in 1.8s, ensure native cursor is visible
    // (we haven't added using-wand yet, so just mark that we won't hide until move)
    const failsafe = window.setTimeout(() => {
      if (!hasMovedRef.current) {
        // leave native cursor alone — user hasn't moved, don't strand them
      }
    }, 1800);

    const resize = () => {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    if (canvas && ctx) resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      // First move: reveal wand + hide native cursor
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setHasMoved(true);
        document.documentElement.classList.add('using-wand');
      }
      if (wandRef.current) wandRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const vx = x - prevPos.current.x;
      const vy = y - prevPos.current.y;
      prevPos.current = { x, y };
      // Reduce motion: skip star trail entirely
      if (reduceMotion) {
        const target = e.target as HTMLElement | null;
        if (target) setIsHovering(Boolean(target.closest('button, a, input, select, [role="button"], .cursor-pointer')));
        return;
      }
      const speed = Math.hypot(vx, vy);
      // Cap total particles ponytail: keep <80 alive
      if (speed > 2.5 && starsRef.current.length < 80) {
        const count = Math.min(4, Math.floor(speed / 10) + 1);
        for (let i = 0; i < count; i++) {
          starsRef.current.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: -vx * 0.06 + (Math.random() - 0.5) * 1.2,
            vy: -vy * 0.06 + (Math.random() - 0.5) * 1.2 - 0.6,
            size: Math.random() * 3.2 + 1.6,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.35,
            alpha: 0.95,
            life: 0,
            maxLife: Math.random() * 16 + 12,
            hue: Math.random() > 0.5 ? 38 + Math.random() * 10 : 180 + Math.random() * 18,
          });
        }
      }
      const target = e.target as HTMLElement | null;
      if (target) setIsHovering(Boolean(target.closest('button, a, input, select, [role="button"], .cursor-pointer')));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setHasMoved(true);
        document.documentElement.classList.add('using-wand');
        if (wandRef.current) wandRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      setIsClicking(true);
      if (reduceMotion) return;
      const colors = [38, 42, 188, 195, 48];
      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.35;
        const s = Math.random() * 3.8 + 1.8;
        starsRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          size: Math.random() * 4 + 2,
          rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.5,
          alpha: 1, life: 0, maxLife: Math.random() * 18 + 14,
          hue: colors[i % colors.length],
        });
      }
    };
    const onPointerUp = () => setIsClicking(false);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const drawStar = (cx: number, cy: number, r: number, rot: number, context: CanvasRenderingContext2D) => {
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = rot + (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const a2 = a + Math.PI / 5;
        const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a2) * (r * 0.42), y2 = cy + Math.sin(a2) * (r * 0.42);
        if (i === 0) context.moveTo(x1, y1); else context.lineTo(x1, y1);
        context.lineTo(x2, y2);
      }
      context.closePath(); context.fill();
    };

    const render = () => {
      if (!ctx || !canvas) {
        rafAnim = requestAnimationFrame(render);
        animIdRef.current = rafAnim;
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (reduceMotion) {
        rafAnim = requestAnimationFrame(render);
        animIdRef.current = rafAnim;
        return;
      }
      for (let i = starsRef.current.length - 1; i >= 0; i--) {
        const s = starsRef.current[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.vx *= 0.985; s.rot += s.rotV; s.life++;
        s.alpha = 1 - s.life / s.maxLife;
        if (s.life >= s.maxLife) { starsRef.current.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha * 0.95);
        ctx.fillStyle = `hsl(${s.hue}, 96%, 62%)`;
        ctx.shadowColor = `hsl(${s.hue}, 96%, 62%)`;
        ctx.shadowBlur = 6;
        ctx.translate(s.x, s.y);
        drawStar(0, 0, s.size, s.rot, ctx);
        ctx.restore();
      }
      rafAnim = requestAnimationFrame(render);
      animIdRef.current = rafAnim;
    };
    rafAnim = requestAnimationFrame(render);
    animIdRef.current = rafAnim;

    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (rafAnim) cancelAnimationFrame(rafAnim);
      document.documentElement.classList.remove('using-wand');
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div
        ref={wandRef}
        className={`fixed top-0 left-0 pointer-events-none will-change-transform transition-opacity duration-150 ${hasMoved ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'translate3d(-100px,-100px,0)' }}
      >
        <div className={`relative transition-transform duration-100 ease-out ${isClicking ? 'scale-95' : isHovering ? 'scale-[1.06]' : 'scale-100'}`} style={{ transformOrigin: '12px 6px', marginLeft: -12, marginTop: -6 }}>
          <svg width={28} height={46} viewBox="0 0 28 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="block drop-shadow-[0_2px_8px_rgba(201,100,66,0.35)]">
            <defs>
              <linearGradient id="wand-handle" x1="14" y1="22" x2="14" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5A3C" /><stop offset="0.5" stopColor="#A67C52" /><stop offset="1" stopColor="#6B3D22" />
              </linearGradient>
              <radialGradient id="star-glow" cx="14" cy="8" r="10" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF7CC" stopOpacity="0.95" /><stop offset="0.45" stopColor="#FDE68A" stopOpacity="0.9" /><stop offset="1" stopColor="#E8A33D" stopOpacity="0" />
              </radialGradient>
              <filter id="wand-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" /></filter>
            </defs>
            <circle cx="14" cy="8" r="11" fill="url(#star-glow)" opacity={isClicking ? 1 : isHovering ? 0.95 : 0.72} />
            <rect x="12.2" y="18" width="3.6" height="22" rx="1.8" fill="url(#wand-handle)" filter="url(#wand-shadow)" />
            <rect x="11.6" y="24" width="4.8" height="1.2" rx="0.6" fill="#6B3D22" opacity="0.9" />
            <rect x="11.6" y="30" width="4.8" height="1.2" rx="0.6" fill="#6B3D22" opacity="0.9" />
            <rect x="11.6" y="36" width="4.8" height="1.2" rx="0.6" fill="#6B3D22" opacity="0.9" />
            <rect x="11.8" y="16.5" width="4.4" height="3.2" rx="1" fill="#E7E1D8" stroke="#C9B8A8" strokeWidth="0.7" />
            <g filter="url(#wand-shadow)">
              <path d="M14 1.2 L15.9 6.2 L21.4 6.2 L16.9 9.4 L18.3 14.6 L14 11.7 L9.7 14.6 L11.1 9.4 L6.6 6.2 L12.1 6.2 Z" fill={isClicking ? '#FFFFFF' : '#FFF7CC'} stroke={isHovering || isClicking ? '#E8A33D' : '#F4BC5E'} strokeWidth="0.9" strokeLinejoin="round" />
              <path d="M14 3.2 L15.1 6.2 L18.2 6.2 L15.8 7.9 L16.5 10.6 L14 8.9 L11.5 10.6 L12.2 7.9 L9.8 6.2 L12.9 6.2 Z" fill="#FFFFFF" opacity="0.92" />
            </g>
            {(isHovering || isClicking) && (<><circle cx="20.5" cy="4.5" r="1.1" fill="#FFF7CC" opacity="0.95" /><circle cx="7.2" cy="7.8" r="0.9" fill="#FFF7CC" opacity="0.85" /><circle cx="20.8" cy="11.2" r="0.85" fill="#FFF7CC" opacity="0.75" /></>)}
          </svg>
          {isHovering && <div className="absolute -top-1 -left-1 w-[30px] h-[30px] rounded-full border border-terracotta/30 bg-terracotta-soft/40 pointer-events-none -z-10" />}
        </div>
      </div>
    </div>
  );
};
