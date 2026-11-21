import React, { useState, useRef } from 'react';
import { Dumbbell, HeartPulse, Flame, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const FeaturesSection: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const [activeTab, setActiveTab] = useState<'cardio' | 'strength' | 'fatloss' | 'hiit'>('strength');
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const tabs = [
    {
      id: 'strength' as const,
      label: 'Strength Build',
      icon: <Dumbbell className="w-4 h-4" />,
      headline: 'Develop Power and Resilience',
      desc: 'Expert-guided strength training tailored to all fitness levels. Progressive overload calibration, real-time RPE tracking, and auto-computed e1RM ceilings ensure perpetual athletic adaptations.',
      statLabel: 'Hypertrophy Efficiency',
      statValue: '+34.2%',
      image: '/images/card_strength.png',
      fallbackIcon: <Dumbbell className="w-20 h-20 text-accent" />,
    },
    {
      id: 'cardio' as const,
      label: 'Cardio Training',
      icon: <HeartPulse className="w-4 h-4" />,
      headline: 'Boost Endurance and Heart Health',
      desc: 'High-energy cardio sessions designed to keep you moving. Zone 2 aerobic base building, VO2 max intervals, and real-time heart rate pacing algorithms.',
      statLabel: 'Aerobic Capacity',
      statValue: '+28.5%',
      image: '/images/card_cardio.png',
      fallbackIcon: <HeartPulse className="w-20 h-20 text-cyan-400" />,
    },
    {
      id: 'fatloss' as const,
      label: 'Fat Loss',
      icon: <Flame className="w-4 h-4" />,
      headline: 'Shed Unwanted Fat With Precision',
      desc: 'Dynamic workout routines and fat-burning strategies that deliver lasting results. Calibrated energy deficits protect metabolically active lean muscle tissue.',
      statLabel: 'Fat-to-Lean Ratio',
      statValue: '-4.8 kg',
      image: '/images/card_fatloss.png',
      fallbackIcon: <Flame className="w-20 h-20 text-rose-500" />,
    },
    {
      id: 'hiit' as const,
      label: 'HIIT Workouts',
      icon: <Zap className="w-4 h-4" />,
      headline: 'Maximize Calorie Burn & Work Capacity',
      desc: 'Short, intense interval training sessions built to skyrocket your metabolic conditioning without burning out your central nervous system.',
      statLabel: 'EPOC Afterburn',
      statValue: '24 Hours',
      image: '/images/card_hiit.png',
      fallbackIcon: <Zap className="w-20 h-20 text-amber-400" />,
    },
  ];

  const current = tabs.find(t => t.id === activeTab) || tabs[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tiltX = ((y / rect.height) - 0.5) * -12;
    const tiltY = ((x / rect.width) - 0.5) * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="programs" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3">
          Methodology & Protocols
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
          Discover What Sets Us Apart
        </h2>
        <p className="mt-4 text-base text-text-muted">
          Dynamic protocols designed to eliminate plateauing. Select a discipline below to inspect the athletic framework.
        </p>

        {/* 4 Interactive Category Tabs */}
        <div
          role="tablist"
          aria-label="Fitness Disciplines"
          className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-pill bg-surface border border-border inline-flex"
        >
          {tabs.map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[46px] px-5 py-2.5 rounded-pill font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-fast ${
                  isSelected
                    ? 'bg-accent text-on-accent shadow-[0_2px_14px_var(--accent-glow)]'
                    : 'text-text-muted hover:text-text hover:bg-surface-hover'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Tilt Feature Showcase Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        id={`panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
        className="relative bg-surface-card border border-border rounded-3xl p-6 sm:p-12 overflow-hidden shadow-2xl transition-transform duration-fast ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Card Copy */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider mb-4">
              <span>Scientific Training Standard</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text mb-4 leading-snug">
              {current.headline}
            </h3>
            <p className="text-base text-text-muted leading-relaxed mb-8">
              {current.desc}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted block">
                  {current.statLabel}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-accent">
                  {current.statValue}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted block">
                  Biomechanical Safety
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-text">
                  Tier-1 A+
                </span>
              </div>
            </div>

            <Button variant="primary" onClick={onExplore}>
              <span>Launch {current.label} Tracker</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Card Media Preview */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-border bg-surface flex items-center justify-center group">
              <img
                src={current.image}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                alt={current.headline}
                className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
              />
              {/* Fallback Graphic */}
              <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface via-surface-card to-surface">
                {current.fallbackIcon}
                <span className="font-display font-extrabold text-lg text-text mt-4">
                  {current.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
