import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input, RPESelector } from '@/components/ui/Inputs';
import { StateData, WorkoutSession, WorkoutExercise, WorkoutSet } from '@/lib/api';
import { calculateEpley1RM } from '@/lib/algo';
import {
  Dumbbell,
  Timer,
  Trophy,
  Check,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Share2,
  X,
  Volume2,
} from 'lucide-react';

export interface WorkoutTrackerViewProps {
  state: StateData;
  onLogSet: (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => { set: WorkoutSet; prBroken?: { exercise: string; weight: number } };
  onToggleSetComplete: (exerciseId: string, setId: string) => { completed: boolean; prBroken?: { exercise: string; weight: number } };
  onFinishWorkout: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const WorkoutTrackerView: React.FC<WorkoutTrackerViewProps> = ({
  state,
  onLogSet,
  onToggleSetComplete,
  onFinishWorkout,
  showToast,
}) => {
  const { activeWorkout, profile } = state;
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [activeRestPreset, setActiveRestPreset] = useState<number>(90);
  const [prCelebration, setPrCelebration] = useState<{ exercise: string; weight: number; e1rm: number } | null>(null);

  // New set draft states
  const [selectedExId, setSelectedExId] = useState<string>(activeWorkout?.exercises[0]?.id || '');
  const [newWeight, setNewWeight] = useState<number>(100);
  const [newReps, setNewReps] = useState<number>(8);
  const [newRpe, setNewRpe] = useState<number>(8);
  const [newType, setNewType] = useState<WorkoutSet['type']>('normal');

  // Rest Timer countdown
  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds(prev => {
        if (prev !== null && prev <= 1) {
          // Play subtle Web Audio chime
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 chime
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          } catch (e) {}

          showToast('Rest interval complete! Time to attack the next set.', 'info');
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restSeconds, showToast]);

  const triggerPRConfetti = (exercise: string, weight: number) => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CEFF1A', '#2DD4BF', '#FFFFFF', '#F5B93B'],
      });
    } catch (e) {}

    const calculated1RM = calculateEpley1RM(weight, 5);
    setPrCelebration({ exercise, weight, e1rm: calculated1RM });
    showToast(`Personal Record Broken! New 1RM: ${weight} kg on ${exercise}.`, 'success');
  };

  const handleToggleSet = (exId: string, setId: string) => {
    const res = onToggleSetComplete(exId, setId);
    if (res.completed) {
      // Start auto rest timer
      setRestSeconds(activeRestPreset);
      if (res.prBroken) {
        triggerPRConfetti(res.prBroken.exercise, res.prBroken.weight);
      }
    }
  };

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExId) return;
    const res = onLogSet(selectedExId, {
      setNumber: 1, // Will be appended
      type: newType,
      weight: newWeight,
      reps: newReps,
      rpe: newRpe,
      completed: true,
    });

    setRestSeconds(activeRestPreset);
    if (res.prBroken) {
      triggerPRConfetti(res.prBroken.exercise, res.prBroken.weight);
    }
  };

  if (!activeWorkout) {
    return (
      <Card className="p-12 text-center">
        <Dumbbell className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="font-display font-extrabold text-2xl text-text mb-2">
          No Active Workout Session
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Start a new Push/Pull/Legs training block or select a template from the curriculum.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Initialize Push Hypertrophy A
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* PR Celebration Banner if active */}
      {prCelebration && (
        <div className="p-5 rounded-2xl bg-accent text-on-accent border border-accent-soft shadow-[0_10px_30px_var(--accent-glow)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-black/10">
              <Trophy className="w-8 h-8 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                NEW ALL-TIME RECORD ACHIEVED!
              </span>
              <h3 className="font-display font-black text-xl leading-tight">
                {prCelebration.weight} kg on {prCelebration.exercise}
              </h3>
              <p className="text-xs opacity-90">
                Calculated Epley e1RM: {prCelebration.e1rm} kg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast('PR Story card copied to clipboard!', 'success')}
              className="bg-black/10 text-on-accent border-black/20 text-xs"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share PR Story
            </Button>
            <button
              onClick={() => setPrCelebration(null)}
              className="p-1.5 text-on-accent hover:opacity-75"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono font-bold text-accent uppercase">
              LIVE WORKOUT LOG
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            {activeWorkout.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Finish Workout CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onFinishWorkout();
              showToast('Workout successfully saved to training history!', 'success');
            }}
            className="text-xs"
          >
            Finish Workout Session
          </Button>
        </div>
      </div>

      {/* Auto Rest Timer Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-surface border border-border text-accent">
            <Timer className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Auto Rest Timer
            </span>
            <div className="font-mono text-2xl font-black text-text">
              {restSeconds !== null ? `${restSeconds}s Remaining` : 'Rest Inactive'}
            </div>
          </div>
        </div>

        {/* Presets 60s / 90s / 120s / 180s */}
        <div className="flex items-center gap-2">
          {[60, 90, 120, 180].map(s => (
            <button
              key={s}
              onClick={() => {
                setActiveRestPreset(s);
                setRestSeconds(s);
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                activeRestPreset === s && restSeconds !== null
                  ? 'bg-accent text-on-accent border-accent'
                  : 'bg-surface border-border text-text hover:border-accent'
              }`}
            >
              {s}s
            </button>
          ))}
          {restSeconds !== null && (
            <button
              onClick={() => setRestSeconds(null)}
              className="p-1.5 rounded-lg border border-border text-text-muted hover:text-danger"
              title="Stop timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Exercises & Set Tables */}
      <div className="space-y-6">
        {activeWorkout.exercises.map(ex => (
          <div
            key={ex.id}
            className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
              <div>
                <h3 className="font-display font-extrabold text-lg text-text">
                  {ex.name}
                </h3>
                <span className="text-xs text-text-muted font-mono">
                  {ex.muscle} • Target: {ex.targetSets} sets × {ex.targetReps} reps
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono">
                  Current PR:{' '}
                  <strong className="text-accent">
                    {profile.prs[ex.name] ? `${profile.prs[ex.name]} kg` : 'None'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Set Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-text-muted border-b border-border/60 pb-2">
                    <th className="py-2 px-3">Set</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Load (kg)</th>
                    <th className="py-2 px-3">Reps</th>
                    <th className="py-2 px-3">RPE</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ex.sets.map((set, idx) => (
                    <tr
                      key={set.id}
                      className={`hover:bg-surface/50 transition-colors ${
                        set.completed ? 'opacity-90' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            set.type === 'warmup'
                              ? 'bg-amber-400/20 text-amber-400'
                              : set.type === 'failure'
                              ? 'bg-rose-500/20 text-rose-500'
                              : 'bg-surface border border-border text-text'
                          }`}
                        >
                          {set.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-text">{set.weight} kg</td>
                      <td className="py-3 px-3 text-text">{set.reps}</td>
                      <td className="py-3 px-3 text-accent font-bold">RPE {set.rpe}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleSet(ex.id, set.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all ${
                            set.completed
                              ? 'bg-accent text-on-accent border-accent'
                              : 'bg-surface border-border text-text-muted hover:border-accent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Log Next Set Panel */}
      <Card className="p-6">
        <h3 className="font-display font-extrabold text-base text-text mb-4">
          Log Additional Set to Session
        </h3>
        <form onSubmit={handleAddSet} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                Exercise
              </label>
              <select
                value={selectedExId}
                onChange={e => setSelectedExId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
              >
                {activeWorkout.exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Weight (kg)"
                type="number"
                step="0.5"
                value={newWeight}
                onChange={e => setNewWeight(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Input
                label="Reps Completed"
                type="number"
                value={newReps}
                onChange={e => setNewReps(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                Set Category
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
              >
                <option value="normal">Working Set</option>
                <option value="warmup">Warmup</option>
                <option value="drop">Drop Set</option>
                <option value="failure">Failure Set (PR Attempt)</option>
              </select>
            </div>
          </div>

          <RPESelector value={newRpe} onChange={setNewRpe} />

          <Button type="submit" variant="primary" className="w-full text-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            Complete & Log Set (Starts Auto Rest Timer)
          </Button>
        </form>
      </Card>
    </div>
  );
};
