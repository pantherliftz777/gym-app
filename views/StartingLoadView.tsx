import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Slider, SegmentedPills } from '@/components/ui/Inputs';
import { Button } from '@/components/ui/Button';
import {
  startingLoadCeiling,
  startingLoadPropose,
  calculateEpley1RM,
  LEVEL_MULTIPLIERS,
} from '@/lib/algo';
import { Calculator, ShieldCheck, Dumbbell, ArrowRight } from 'lucide-react';

export const StartingLoadView: React.FC<{ onApplyToWorkout?: (lift: string, weight: number) => void }> = ({
  onApplyToWorkout,
}) => {
  const [lift, setLift] = useState('bench');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [bodyweight, setBodyweight] = useState<number>(78);
  const [experience, setExperience] = useState<keyof typeof LEVEL_MULTIPLIERS>('beginner');
  const [hasPriorExperience, setHasPriorExperience] = useState<boolean>(true);

  const lifts = [
    { id: 'bench', label: 'Barbell Bench Press' },
    { id: 'squat', label: 'Barbell Back Squat' },
    { id: 'deadlift', label: 'Conventional Deadlift' },
    { id: 'press', label: 'Standing Overhead Press' },
    { id: 'row', label: 'Bent-Over Barbell Row' },
  ];

  const ceiling = startingLoadCeiling(bodyweight, sex, lift, experience);
  const proposed = startingLoadPropose(bodyweight, sex, lift, hasPriorExperience, experience);
  const estimated1RM = calculateEpley1RM(proposed, 8);

  const liftName = lifts.find(l => l.id === lift)?.label || 'Lift';

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
          Safe Starting Load & Ceiling Calculator
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          1RM-free strength calibration algorithm. Estimates safe working ceilings based on bodyweight ratios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Target Compound Movement
              </label>
              <select
                value={lift}
                onChange={e => setLift(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {lifts.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Biological Sex Standards
              </label>
              <SegmentedPills
                value={sex}
                onChange={setSex}
                options={[
                  { label: 'Male Baseline Standards', value: 'male' },
                  { label: 'Female Baseline Standards', value: 'female' },
                ]}
                className="w-full"
              />
            </div>

            <Slider
              label="Athlete Bodyweight"
              value={bodyweight}
              min={45}
              max={150}
              step={0.5}
              unit="kg"
              onChange={e => setBodyweight(Number(e.target.value))}
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                Experience Tier
              </label>
              <SegmentedPills
                value={experience}
                onChange={setExperience}
                options={[
                  { label: 'Beginner (0-6mo)', value: 'beginner' },
                  { label: 'Novice (6-18mo)', value: 'novice' },
                  { label: 'Intermediate (2-4yr)', value: 'intermediate' },
                  { label: 'Advanced (5yr+)', value: 'advanced' },
                ]}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border">
              <input
                type="checkbox"
                id="priorExp"
                checked={hasPriorExperience}
                onChange={e => setHasPriorExperience(e.target.checked)}
                className="w-4 h-4 rounded accent-accent cursor-pointer"
              />
              <label htmlFor="priorExp" className="text-xs text-text cursor-pointer select-none">
                I have performed this specific movement pattern in the past 60 days
              </label>
            </div>
          </Card>
        </div>

        {/* Results Card Column */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-accent/50 shadow-[0_12px_40px_var(--accent-glow)] space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Prescribed Baseline
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent text-on-accent text-[10px] font-mono font-bold">
                SAFE CEILING
              </span>
            </div>

            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Recommended 8-Rep Working Load:
              </span>
              <div className="font-mono text-5xl font-black text-text mt-1">
                {proposed} <span className="text-2xl text-accent font-bold">kg</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Calibrated safely for a {bodyweight} kg athlete at {experience} level on {liftName}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">Safe Warmup Minimum:</span>
                <span className="font-mono font-bold text-text">{ceiling.min} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">Maximum Safe Ramp Ceiling:</span>
                <span className="font-mono font-bold text-amber-400">{ceiling.max} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                <span className="text-text-muted">Implied e1RM (Epley):</span>
                <span className="font-mono font-bold text-accent">{estimated1RM} kg</span>
              </div>
            </div>

            {onApplyToWorkout && (
              <Button
                variant="primary"
                onClick={() => onApplyToWorkout(liftName, proposed)}
                className="w-full text-xs"
              >
                <span>Adopt {proposed}kg Load In Session</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
