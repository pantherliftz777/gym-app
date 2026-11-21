import React from 'react';
import { Card } from '@/components/ui/Cards';
import { MacroRing, HydrationWave, StatPill } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { StateData, MealItem } from '@/lib/api';
import {
  Flame,
  Dumbbell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface TodayViewProps {
  state: StateData;
  onAddWater: (ml: number) => void;
  onNavigate: (viewId: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  state,
  onAddWater,
  onNavigate,
}) => {
  const { profile, foodLog, waterIntakeMl, waterGoalMl, activeWorkout } = state;

  // Calculate consumed macros from foodLog
  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;

  Object.values(foodLog).forEach(slot => {
    slot.items.forEach((item: MealItem) => {
      consumedCalories += item.calories;
      consumedProtein += item.protein;
      consumedCarbs += item.carbs;
      consumedFat += item.fat;
    });
  });

  const calRemaining = profile.targetCalories - consumedCalories;
  const daysOfWeek = [
    { day: 'M', completed: true, pr: false },
    { day: 'T', completed: true, pr: true },
    { day: 'W', completed: true, pr: false },
    { day: 'T', completed: true, pr: false },
    { day: 'F', completed: true, pr: true },
    { day: 'S', completed: false, today: true },
    { day: 'S', completed: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header with Subhead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Your athletic performance dashboard is ready. Overload progression on track.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatPill label="Target Split" value={profile.split.split(' ')[0]} highlight />
          <StatPill label="Weight" value={`${profile.weightKg} kg`} />
        </div>
      </div>

      {/* 4 Macro Rings (Calories large with color-shift, Protein, Carbs, Fat) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-text">
              Precision Energy & Macro Balance
            </h2>
            <p className="text-xs text-text-muted">
              Dynamically calibrated to your {profile.targetCalories} kcal hypertrophy ceiling
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('food-log')}
            className="text-xs"
          >
            Log Meal &gt;
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {/* Calorie Ring Large (Master) */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
            <MacroRing
              label="Calories"
              current={consumedCalories}
              target={profile.targetCalories}
              unit="kcal"
              size={150}
              strokeWidth={14}
              isCalorieMaster
            />
            <div className="mt-3 text-center">
              <span className={`font-mono text-xs font-bold ${calRemaining < 0 ? 'text-danger' : 'text-text-muted'}`}>
                {calRemaining >= 0 ? `${calRemaining} kcal remaining` : `${Math.abs(calRemaining)} kcal over target`}
              </span>
            </div>
          </div>

          {/* Protein Ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
            <MacroRing
              label="Protein"
              current={consumedProtein}
              target={profile.macros.protein}
              unit="g"
              size={120}
              strokeWidth={10}
              color="var(--protein)"
            />
            <span className="mt-2 text-[11px] font-mono text-text-muted">
              {Math.max(0, profile.macros.protein - consumedProtein)}g left
            </span>
          </div>

          {/* Carbs Ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
            <MacroRing
              label="Carbs"
              current={consumedCarbs}
              target={profile.macros.carbs}
              unit="g"
              size={120}
              strokeWidth={10}
              color="var(--carbs)"
            />
            <span className="mt-2 text-[11px] font-mono text-text-muted">
              {Math.max(0, profile.macros.carbs - consumedCarbs)}g left
            </span>
          </div>

          {/* Fat Ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border">
            <MacroRing
              label="Fat"
              current={consumedFat}
              target={profile.macros.fat}
              unit="g"
              size={120}
              strokeWidth={10}
              color="var(--fat)"
            />
            <span className="mt-2 text-[11px] font-mono text-text-muted">
              {Math.max(0, profile.macros.fat - consumedFat)}g left
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Workout of the Day, Hydration Wave, Streak Heat Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Workout Card */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" />
                Scheduled Training
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-mono font-bold">
                ACTIVE SESSION
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-2">
              {activeWorkout ? activeWorkout.title : 'Push Hypertrophy A'}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Compound pressing focus: Barbell Bench Press, Incline DB Press, Cable Lateral Raises.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs py-1.5 border-b border-border">
                <span className="text-text-muted">Estimated Duration</span>
                <span className="font-mono text-text font-bold">55 Mins</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-border">
                <span className="text-text-muted">Working Sets</span>
                <span className="font-mono text-text font-bold">11 Sets</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-border">
                <span className="text-text-muted">RPE Ceiling</span>
                <span className="font-mono text-accent font-bold">RPE 9.5</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => onNavigate('tracking')}
            className="w-full text-xs"
          >
            <span>Resume Workout Tracker</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>

        {/* Hydration Wave Widget */}
        <HydrationWave
          currentMl={waterIntakeMl}
          goalMl={waterGoalMl}
          onQuickAdd={onAddWater}
        />

        {/* Weekly Streak Heat Calendar & Calorie Gauge */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" />
                Weekly Consistency
              </span>
              <span className="font-mono text-xs font-bold text-accent">
                5 Day Streak 🔥
              </span>
            </div>

            {/* Heat strip */}
            <div className="grid grid-cols-7 gap-2 my-4">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-text-muted">{d.day}</span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold border transition-transform ${
                      d.completed
                        ? 'bg-accent/20 border-accent text-accent shadow-sm'
                        : d.today
                        ? 'bg-surface border-accent animate-pulse text-text'
                        : 'bg-surface border-border text-text-muted/40'
                    }`}
                  >
                    {d.completed ? '✓' : d.today ? '•' : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Calorie Gauge breakdown */}
            <div className="mt-6 p-3 rounded-xl bg-surface border border-border">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">Basal + Active Burn</span>
                <span className="font-mono font-bold text-text">2,850 kcal</span>
              </div>
              <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-slow"
                  style={{ width: `${Math.min(100, (consumedCalories / profile.targetCalories) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Overload active
            </span>
            <button
              onClick={() => onNavigate('challenges')}
              className="text-accent hover:underline font-bold"
            >
              View Challenges &gt;
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
