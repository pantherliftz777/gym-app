import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Zap, Play, Flame, Activity, Clock, ShieldCheck, Users } from 'lucide-react';

export interface HeroSectionProps {
  theme: 'dark' | 'light';
  onStart: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme,
  onStart,
  onWatchDemo,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 50, y: 45 });
  const mouseTarget = useRef({ x: 50, y: 45 });
  const currentPos = useRef({ x: 50, y: 45, tiltX: 0, tiltY: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      mouseTarget.current = {
        x: Math.max(10, Math.min(90, xPct)),
        y: Math.max(10, Math.min(90, yPct)),
      };
    };

    const container = heroRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // 60fps lerp loop with alpha = 0.08
    const lerp = () => {
      const alpha = 0.08;
      currentPos.current.x += (mouseTarget.current.x - currentPos.current.x) * alpha;
      currentPos.current.y += (mouseTarget.current.y - currentPos.current.y) * alpha;

      // 3D tilt angles (-10deg to +10deg)
      const tiltY = ((currentPos.current.x - 50) / 50) * 8;
      const tiltX = -((currentPos.current.y - 50) / 50) * 8;
      currentPos.current.tiltX = tiltX;
      currentPos.current.tiltY = tiltY;

      if (container) {
        container.style.setProperty('--cone-x', `${currentPos.current.x.toFixed(2)}%`);
        container.style.setProperty('--cone-y', `${currentPos.current.y.toFixed(2)}%`);
        container.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        container.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      }

      animFrameId.current = requestAnimationFrame(lerp);
    };

    animFrameId.current = requestAnimationFrame(lerp);

    return () => {
      if (container) container.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] pt-28 pb-16 sm:pt-36 sm:pb-24 flex items-center justify-center overflow-hidden"
    >
      {/* Volumetric light cone / Sunbeam behind athlete */}
      <div
        className="hero-volumetric-cone absolute inset-0 w-full h-full opacity-90 z-0 transition-opacity"
        aria-hidden="true"
      />

      {/* Subtle background glow rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-accent/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-accent/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Top Tagline Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-surface/80 border border-border backdrop-blur-md text-xs font-bold tracking-wider uppercase text-text">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Athletic Intelligence Platform • PWA Ready</span>
          </div>
        </div>

        {/* Oversized Syne Display Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-8">
          <h1 className="font-display text-[2.8rem] sm:text-[4.2rem] lg:text-[5.5rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-text">
            Sculpt Your Body, <br />
            <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
              Elevate
            </span>{' '}
            Your Spirit.
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl font-body text-text-muted max-w-2xl mx-auto leading-relaxed">
            One app for precision nutrition, strength tracking, on-device AI form checking, and seamless gym turnstile access. Offline-first, privacy-first.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="text-base px-8 py-4 group"
          >
            <span>Let's Start</span>
            <span className="ml-2 font-mono tracking-tighter group-hover:translate-x-1 transition-transform">
              &gt;&gt;&gt;
            </span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onWatchDemo}
            className="text-base px-6 py-4"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Watch Demo
          </Button>
        </div>

        {/* Center Athlete Cut-out Stage with 5 Floating Badges */}
        <div className="relative max-w-3xl mx-auto h-[420px] sm:h-[520px] lg:h-[600px] flex items-end justify-center">
          {/* Athlete Cutout Image */}
          <div className="relative w-full h-full flex items-end justify-center z-10">
            <img
              src="/images/athlete_hero.png"
              onError={(e) => {
                // Fallback to cutouts if needed
                (e.currentTarget as HTMLImageElement).src = '/images/cutouts/hero_athlete_front.png';
              }}
              alt="Elite FitFuel Athlete"
              className="max-h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none pointer-events-none"
              style={{
                aspectRatio: '680 / 840',
              }}
            />
          </div>

          {/* Floating Stat Badge 1: 1.5 Hours */}
          <div className="absolute top-12 left-2 sm:left-6 z-20 bg-surface/90 backdrop-blur-md border border-border p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform animate-in fade-in duration-normal">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-base sm:text-lg font-bold text-text">1.5 Hours</div>
                <div className="text-[11px] text-text-muted font-medium">Daily training</div>
              </div>
            </div>
          </div>

          {/* Floating Stat Badge 2: 20 Poses */}
          <div className="absolute top-10 right-2 sm:right-6 z-20 bg-surface/90 backdrop-blur-md border border-border p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform animate-in fade-in duration-normal">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/15 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-base sm:text-lg font-bold text-text">20 Poses</div>
                <div className="text-[11px] text-text-muted font-medium">Movement patterns</div>
              </div>
            </div>
          </div>

          {/* Floating Stat Badge 3: 550 Kcal */}
          <div className="absolute bottom-24 left-0 sm:left-4 z-20 bg-surface/90 backdrop-blur-md border border-border p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-base sm:text-lg font-bold text-text">550 Kcal</div>
                <div className="text-[11px] text-text-muted font-medium">Avg. active burn</div>
              </div>
            </div>
          </div>

          {/* Floating Stat Badge 4: 5 Sets */}
          <div className="absolute bottom-28 right-0 sm:right-4 z-20 bg-surface/90 backdrop-blur-md border border-border p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="font-mono text-base sm:text-lg font-bold text-text">5 Sets</div>
                <div className="text-[11px] text-text-muted font-medium">Progression baseline</div>
              </div>
            </div>
          </div>

          {/* Floating Stat Badge 5: 12k+ Happy Spirits with Avatar Stack */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 bg-surface/95 backdrop-blur-xl border border-accent/40 px-5 py-2.5 rounded-pill shadow-2xl flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white">
                JD
              </div>
              <div className="w-7 h-7 rounded-full bg-cyan-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white">
                SR
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white">
                MK
              </div>
              <div className="w-7 h-7 rounded-full bg-accent border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-accent">
                +
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-xs text-text block leading-none">
                12k+ Happy Spirits
              </span>
              <span className="text-[10px] text-accent font-semibold">Active in 48 Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
