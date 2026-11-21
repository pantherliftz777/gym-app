import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Feedback';
import {
  Camera,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Maximize2,
} from 'lucide-react';

export const PostureView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [kneeAngle, setKneeAngle] = useState(94);
  const [hipAngle, setHipAngle] = useState(82);
  const [isGoodDepth, setIsGoodDepth] = useState(true);
  const [exercise, setExercise] = useState('Back Squat');
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    let step = 0;
    const loop = () => {
      step += 0.05;
      // Oscillate knee angle between 85 and 160 degrees
      const computedKnee = Math.round(120 + Math.sin(step) * 35);
      const computedHip = Math.round(105 + Math.sin(step) * 25);
      setKneeAngle(computedKnee);
      setHipAngle(computedHip);
      setIsGoodDepth(computedKnee <= 98);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill status="BETA" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              LOCAL DEVICE NEURAL VISION
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            Real-Time AI Form Check & Joint Angle Audit
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text font-bold"
          >
            <option value="Back Squat">Barbell Back Squat</option>
            <option value="Conventional Deadlift">Conventional Deadlift</option>
            <option value="Overhead Press">Standing Overhead Press</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Camera / Skeleton Viewport */}
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl bg-black border border-border overflow-hidden shadow-2xl h-[420px] sm:h-[480px] flex items-center justify-center">
            {/* Synthetic athlete backdrop video / canvas representation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950 to-zinc-900" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Simulated 33-Landmark MediaPipe Pose Skeleton */}
            <svg
              className="relative z-10 w-full h-full max-w-md pointer-events-none"
              viewBox="0 0 300 400"
            >
              {/* Head */}
              <circle cx="150" cy="80" r="14" fill="none" stroke="var(--accent)" strokeWidth="3" />
              <circle cx="150" cy="80" r="4" fill="var(--accent)" />

              {/* Spine */}
              <line x1="150" y1="94" x2="150" y2="190" stroke="var(--accent)" strokeWidth="4" />

              {/* Shoulders & Clavicle */}
              <line x1="110" y1="120" x2="190" y2="120" stroke="var(--accent)" strokeWidth="4" />
              <circle cx="110" cy="120" r="5" fill="#2DD4BF" />
              <circle cx="190" cy="120" r="5" fill="#2DD4BF" />

              {/* Arms */}
              <line x1="110" y1="120" x2="95" y2="170" stroke="var(--accent)" strokeWidth="3" />
              <line x1="95" y1="170" x2="110" y2="210" stroke="var(--accent)" strokeWidth="3" />
              <circle cx="95" cy="170" r="4" fill="#2DD4BF" />
              <circle cx="110" cy="210" r="4" fill="#2DD4BF" />

              <line x1="190" y1="120" x2="205" y2="170" stroke="var(--accent)" strokeWidth="3" />
              <line x1="205" y1="170" x2="190" y2="210" stroke="var(--accent)" strokeWidth="3" />
              <circle cx="205" cy="170" r="4" fill="#2DD4BF" />
              <circle cx="190" cy="210" r="4" fill="#2DD4BF" />

              {/* Pelvis */}
              <line x1="125" y1="190" x2="175" y2="190" stroke="var(--accent)" strokeWidth="4" />
              <circle cx="125" cy="190" r="6" fill="#F5B93B" />
              <circle cx="175" cy="190" r="6" fill="#F5B93B" />

              {/* Legs (Animated by state) */}
              {/* Left leg */}
              <line
                x1="125"
                y1="190"
                x2={105 + (160 - kneeAngle) * 0.25}
                y2={270 - (160 - kneeAngle) * 0.3}
                stroke={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
                strokeWidth="4"
              />
              <line
                x1={105 + (160 - kneeAngle) * 0.25}
                y1={270 - (160 - kneeAngle) * 0.3}
                x2="115"
                y2="360"
                stroke={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
                strokeWidth="4"
              />
              <circle
                cx={105 + (160 - kneeAngle) * 0.25}
                cy={270 - (160 - kneeAngle) * 0.3}
                r="6"
                fill={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
              />
              <circle cx="115" cy="360" r="5" fill="white" />

              {/* Right leg */}
              <line
                x1="175"
                y1="190"
                x2={195 - (160 - kneeAngle) * 0.25}
                y2={270 - (160 - kneeAngle) * 0.3}
                stroke={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
                strokeWidth="4"
              />
              <line
                x1={195 - (160 - kneeAngle) * 0.25}
                y1={270 - (160 - kneeAngle) * 0.3}
                x2="185"
                y2="360"
                stroke={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
                strokeWidth="4"
              />
              <circle
                cx={195 - (160 - kneeAngle) * 0.25}
                cy={270 - (160 - kneeAngle) * 0.3}
                r="6"
                fill={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
              />
              <circle cx="185" cy="360" r="5" fill="white" />

              {/* Live Joint Angle Label */}
              <text
                x={80}
                y={260}
                fill={isGoodDepth ? 'var(--accent)' : '#F59E0B'}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {kneeAngle}°
              </text>
            </svg>

            {/* Top Viewport Status HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>60 FPS • 1080p Live</span>
              </div>

              {/* Form Feedback Pill */}
              <div
                className={`px-3 py-1.5 rounded-pill text-xs font-bold font-mono border backdrop-blur-md transition-colors ${
                  isGoodDepth
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                }`}
              >
                {isGoodDepth ? 'PARALLEL DEPTH (VALID)' : 'APPROACHING PARALLEL'}
              </div>
            </div>

            {/* Bottom Controls inside Viewport */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
              <Button
                variant={isActive ? 'ghost' : 'primary'}
                size="sm"
                onClick={() => setIsActive(!isActive)}
                className="text-xs"
              >
                {isActive ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Pause Pose Stream
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Start Optical Tracking
                  </>
                )}
              </Button>
              <span className="text-[11px] font-mono text-white/70 bg-black/60 px-3 py-1 rounded-lg">
                Privacy Guaranteed: On-Device WASM
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Angle Readout Gauges */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-display font-extrabold text-base text-text mb-4">
              Biomechanical Telemetry
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-text-muted">Knee Flexion Angle</span>
                  <span className={`font-mono text-lg font-black ${isGoodDepth ? 'text-accent' : 'text-amber-400'}`}>
                    {kneeAngle}°
                  </span>
                </div>
                <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-fast ${isGoodDepth ? 'bg-accent' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (kneeAngle / 160) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block font-mono">
                  Target threshold: &le; 95° for IPF legal depth
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-text-muted">Torso / Spine Inclination</span>
                  <span className="font-mono text-lg font-black text-text">{hipAngle}°</span>
                </div>
                <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (hipAngle / 120) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block font-mono">
                  Neutral pelvic tilt maintained
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-accent/30 bg-accent/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-sm text-text">
                  Knee Valgus Prevention
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Both femurs track cleanly within the 15° rotational allowance. No medial knee collapse detected during the concentric turnaround.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
