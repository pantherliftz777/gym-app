import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input, SegmentedPills } from '@/components/ui/Inputs';
import { StatusPill } from '@/components/ui/Feedback';
import {
  calculateNavyBodyFat,
  calculateClinicalRatios,
  ramanujanEllipticalCircumference,
} from '@/lib/algo';
import {
  Activity,
  HeartPulse,
  Ruler,
  TrendingDown,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const BodyAnalysisView: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState(182);
  const [weightKg, setWeightKg] = useState(78.5);
  const [neckCm, setNeckCm] = useState(39);
  const [waistCm, setWaistCm] = useState(81);
  const [hipsCm, setHipsCm] = useState(97);

  // Navy Body Fat calculation
  const bodyFat = calculateNavyBodyFat({
    gender,
    heightCm,
    waistCm,
    neckCm,
    hipsCm,
  });

  // Clinical health ratios (WHR, WHtR)
  const clinical = calculateClinicalRatios({
    heightCm,
    weightKg,
    waistCm,
    hipsCm,
    gender,
    bodyFatPct: bodyFat,
  });

  // Ramanujan Elliptical derivation
  const waistWidth = waistCm * 0.38;
  const waistDepth = waistCm * 0.28;
  const ramanujanEst = ramanujanEllipticalCircumference(waistWidth, waistDepth);

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill status="BETA" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              ANTHROPOMETRIC COMPUTATION
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            Clinical Body Composition & WHR Model
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tape Measurements Input */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Ruler className="w-5 h-5 text-accent" />
              <h2 className="font-display font-extrabold text-base text-text">
                Circumference Tape Metrics
              </h2>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Biological Sex Model
              </label>
              <SegmentedPills
                value={gender}
                onChange={setGender}
                options={[
                  { label: 'Male Model', value: 'male' },
                  { label: 'Female Model', value: 'female' },
                ]}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                value={heightCm}
                onChange={e => setHeightCm(Number(e.target.value))}
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Neck (cm)"
                type="number"
                step="0.5"
                value={neckCm}
                onChange={e => setNeckCm(Number(e.target.value))}
              />
              <Input
                label="Waist (cm)"
                type="number"
                step="0.5"
                value={waistCm}
                onChange={e => setWaistCm(Number(e.target.value))}
              />
              <Input
                label="Hips (cm)"
                type="number"
                step="0.5"
                value={hipsCm}
                onChange={e => setHipsCm(Number(e.target.value))}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-text-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                Measured at standardized ISO 8559-1 levels (narrowest waist, thyroid cartilage for neck, maximum gluteal protrusion for hips).
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Navy %BF & Clinical Risk Meter */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                U.S. Navy Hodgdon-Beckett
              </span>
              <span className="px-2.5 py-0.5 rounded-pill bg-accent text-on-accent text-xs font-mono font-black">
                {bodyFat}% BF
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface border border-border text-center">
                <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted block">
                  Lean Body Mass
                </span>
                <span className="font-mono text-3xl font-black text-cyan-400">
                  {clinical.leanMassKg} <span className="text-sm">kg</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border text-center">
                <span className="text-[11px] uppercase tracking-wider font-bold text-text-muted block">
                  Fat Mass
                </span>
                <span className="font-mono text-3xl font-black text-rose-500">
                  {clinical.fatMassKg} <span className="text-sm">kg</span>
                </span>
              </div>
            </div>

            {/* WHR & WHtR Health Risk Meters */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-text">Waist-to-Hip Ratio (WHR)</span>
                  <span className="font-mono font-bold text-accent">{clinical.whr}</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium mb-2">
                  Classification: {clinical.whrStatus} (WHO Standard)
                </div>
                <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${Math.min(100, (clinical.whr / 1.1) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-text">Waist-to-Height Ratio (WHtR)</span>
                  <span className="font-mono font-bold text-accent">{clinical.whtr}</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium mb-2">
                  Classification: {clinical.whtrStatus} (&le; 0.50 Optimal)
                </div>
                <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (clinical.whtr / 0.7) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">Ramanujan Elliptical Perimeter:</span>
              <span className="font-bold text-accent">{ramanujanEst} cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
