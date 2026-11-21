import React, { useState, useEffect } from 'react';
import { Card, GlassCard } from '../ui/Cards';
import { MacroRing, StatusPill } from '../ui/Feedback';
import { Button } from '../ui/Button';
import {
  Apple,
  Dumbbell,
  Camera,
  Activity,
  Bot,
  QrCode,
  CheckCircle2,
  Timer,
  Sparkles,
} from 'lucide-react';

export interface BentoShowcaseProps {
  onOpenView: (viewId: string) => void;
}

export const BentoShowcase: React.FC<BentoShowcaseProps> = ({ onOpenView }) => {
  const [restSeconds, setRestSeconds] = useState(74);
  const [qrSeconds, setQrSeconds] = useState(26);

  useEffect(() => {
    const timer = setInterval(() => {
      setRestSeconds(s => (s > 0 ? s - 1 : 90));
      setQrSeconds(s => (s > 1 ? s - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="platform" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3">
          Unified Athletic Suite
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
          Everything You Need In One Engine
        </h2>
        <p className="mt-4 text-base text-text-muted">
          No separate calorie app, no disjointed workout notebook, no third-party gym tag. A cohesive platform engineered for elite performers.
        </p>
      </div>

      {/* 6-Tile Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tile 1: Precision Nutrition */}
        <Card
          onClick={() => onOpenView('today')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                <Apple className="w-5 h-5" />
              </div>
              <StatusPill status="LIVE" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-accent transition-colors">
              Precision Nutrition
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Mifflin-St Jeor TDEE energy balance with dynamic protein, carb, and fat rings.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border flex items-center justify-around">
            <MacroRing
              label="Calories"
              current={2150}
              target={2800}
              unit="kcal"
              size={90}
              strokeWidth={8}
              isCalorieMaster
            />
            <div className="flex flex-col gap-2">
              <div className="text-xs">
                <span className="text-text-muted">Protein: </span>
                <span className="font-mono font-bold text-cyan-400">142 / 160g</span>
              </div>
              <div className="text-xs">
                <span className="text-text-muted">Carbs: </span>
                <span className="font-mono font-bold text-amber-400">220 / 310g</span>
              </div>
              <div className="text-xs">
                <span className="text-text-muted">Fat: </span>
                <span className="font-mono font-bold text-rose-500">58 / 75g</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tile 2: Smart Workout Logger */}
        <Card
          onClick={() => onOpenView('tracking')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                <Dumbbell className="w-5 h-5" />
              </div>
              <StatusPill status="LIVE" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-accent transition-colors">
              Smart Workout Logger
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Track sets, RPE fatigue calibration, and auto rest countdown with audio chime.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border">
            <div className="flex items-center justify-between text-xs font-bold text-text mb-2">
              <span>Barbell Bench Press</span>
              <span className="font-mono text-accent">Set 3 / 4</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-card text-xs font-mono mb-3">
              <span>102.5 kg × 6 reps</span>
              <span className="text-amber-400 font-bold">RPE 8.5</span>
              <CheckCircle2 className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-card border border-border text-xs">
              <span className="flex items-center gap-1.5 text-text-muted font-medium">
                <Timer className="w-3.5 h-3.5 text-accent animate-spin" />
                Auto Rest Timer:
              </span>
              <span className="font-mono font-bold text-accent">{restSeconds}s</span>
            </div>
          </div>
        </Card>

        {/* Tile 3: AI Form Check (BETA) */}
        <Card
          onClick={() => onOpenView('posture')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <StatusPill status="BETA" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-amber-400 transition-colors">
              On-Device AI Form Check
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              33-landmark pose estimation analyzes squat depth, spine flexion, and joint alignment.
            </p>
          </div>

          <div className="relative h-32 rounded-2xl bg-surface border border-border overflow-hidden flex items-center justify-center">
            {/* Synthetic Skeleton Overlay */}
            <svg className="w-full h-full text-accent/80" viewBox="0 0 200 120">
              <circle cx="100" cy="25" r="8" fill="var(--accent)" />
              <line x1="100" y1="33" x2="100" y2="65" stroke="var(--accent)" strokeWidth="3" />
              {/* Shoulders & Arms */}
              <line x1="80" y1="42" x2="120" y2="42" stroke="var(--accent)" strokeWidth="3" />
              <line x1="80" y1="42" x2="70" y2="60" stroke="var(--accent)" strokeWidth="2.5" />
              <line x1="120" y1="42" x2="130" y2="60" stroke="var(--accent)" strokeWidth="2.5" />
              {/* Hips & Legs */}
              <line x1="100" y1="65" x2="85" y2="90" stroke="var(--accent)" strokeWidth="3" />
              <line x1="85" y1="90" x2="88" y2="114" stroke="var(--accent)" strokeWidth="3" />
              <line x1="100" y1="65" x2="115" y2="90" stroke="var(--accent)" strokeWidth="3" />
              <line x1="115" y1="90" x2="112" y2="114" stroke="var(--accent)" strokeWidth="3" />
            </svg>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-pill bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
              Parallel Depth 94° • Valid
            </div>
          </div>
        </Card>

        {/* Tile 4: 3D Body Composition (BETA) */}
        <Card
          onClick={() => onOpenView('body-analysis')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <StatusPill status="BETA" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-amber-400 transition-colors">
              3D Body Composition
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Ramanujan elliptical circumference geometry with U.S. Navy clinical body-fat model.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-muted">Estimated Navy %BF</span>
              <span className="font-mono text-base font-black text-accent">14.8%</span>
            </div>
            <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden mb-3">
              <div className="bg-accent h-full rounded-full" style={{ width: '42%' }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-text-muted">
              <div>WHR: <span className="text-text font-bold">0.82 (Low Risk)</span></div>
              <div>WHtR: <span className="text-text font-bold">0.45 (Optimal)</span></div>
            </div>
          </div>
        </Card>

        {/* Tile 5: AI Coach Chat */}
        <Card
          onClick={() => onOpenView('ai-coach')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                <Bot className="w-5 h-5" />
              </div>
              <StatusPill status="LIVE" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-accent transition-colors">
              AI Coach Intelligence
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Context-injected LLM assistant trained on exercise physiology and nutrition protocols.
            </p>
          </div>

          <div className="p-3.5 bg-surface rounded-2xl border border-border space-y-2">
            <div className="p-2.5 rounded-xl bg-surface-card text-xs text-text-muted">
              "Generate a 4-day push/pull split focused on chest & shoulder density"
            </div>
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-xs text-text flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Program generated. 18 weekly working sets assigned with auto RPE progression.</span>
            </div>
          </div>
        </Card>

        {/* Tile 6: Facility Turnstile QR Pass */}
        <Card
          onClick={() => onOpenView('facility')}
          className="cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                <QrCode className="w-5 h-5" />
              </div>
              <StatusPill status="LIVE" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-1 group-hover:text-accent transition-colors">
              Facility Turnstile Pass
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              30-second rolling optical QR codes with crowd density breakdown across gym zones.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-border flex items-center justify-between">
            <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center">
              <QrCode className="w-12 h-12 text-black" />
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted">Rotating In</div>
              <div className="font-mono text-2xl font-black text-accent">{qrSeconds}s</div>
              <div className="text-[10px] text-emerald-400 font-bold">Turnstile Ready</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
