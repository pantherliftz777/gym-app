import React from 'react';
import { Card } from '@/components/ui/Cards';
import { Trophy, Award, Medal, Flame, Sparkles } from 'lucide-react';

export const ChallengesView: React.FC = () => {
  const currentWorkouts = 16;
  const targetWorkouts = 20;
  const pct = Math.round((currentWorkouts / targetWorkouts) * 100);

  const leaderboard = [
    { rank: 1, name: 'Marcus Vance', score: '38,400 kg Total Volume', badge: 'Gold Champion', medal: '🥇' },
    { rank: 2, name: 'Jordan Davis (You)', score: '34,850 kg Total Volume', badge: 'Silver Contender', medal: '🥈' },
    { rank: 3, name: 'Elena Rostova', score: '31,200 kg Total Volume', badge: 'Bronze Lifter', medal: '🥉' },
  ];

  const badges = [
    { title: 'Iron Pioneer', desc: 'Logged 10 consecutive training sessions with zero missed sets.', unlocked: true },
    { title: 'Century Club', desc: 'Exceeded 100 kg on Barbell Bench Press with valid pause.', unlocked: true },
    { title: 'Consistency King', desc: 'Hit daily calorie target within ±50 kcal for 14 straight days.', unlocked: false },
    { title: 'Sub-Parallel Master', desc: 'Achieved 50 consecutive AI-verified deep squats.', unlocked: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Athletic Challenges & Global Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Compete in volume tournaments, unlock verified trophies, and maintain streak momentum.
          </p>
        </div>
      </div>

      {/* 20-Workout Challenge Progress Bar */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-surface-card via-surface to-surface-card border-accent/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              November Overload Gauntlet
            </span>
            <h2 className="font-display font-extrabold text-2xl text-text mt-1">
              Complete 20 Intense Training Blocks
            </h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-3xl font-black text-accent">{pct}%</span>
            <span className="block text-xs text-text-muted font-mono">{currentWorkouts} of {targetWorkouts} Workouts</span>
          </div>
        </div>

        <div className="w-full bg-surface-card h-4 rounded-full overflow-hidden border border-border p-0.5">
          <div
            className="bg-accent h-full rounded-full transition-all duration-slow shadow-[0_0_12px_var(--accent-glow)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-3">
          4 more completed workouts unlocks the exclusive <strong>"Gauntlet Conqueror"</strong> badge and 1 month free Pro Lifter access.
        </p>
      </Card>

      {/* Podium & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-display font-extrabold text-lg text-text flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Global Volume Podium
          </h3>

          <div className="space-y-3">
            {leaderboard.map(u => (
              <div
                key={u.rank}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  u.name.includes('(You)')
                    ? 'bg-accent/10 border-accent text-text'
                    : 'bg-surface-card border-border text-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{u.medal}</span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-text">{u.name}</h4>
                    <span className="text-xs text-text-muted font-mono">{u.score}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-pill bg-surface text-xs font-mono font-bold border border-border text-accent">
                  {u.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-display font-extrabold text-lg text-text flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Earned Accolades & Trophies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((b, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  b.unlocked
                    ? 'bg-surface-card border-accent/30'
                    : 'bg-surface border-border opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-bold text-sm text-text">{b.title}</h4>
                    {b.unlocked ? (
                      <span className="text-accent text-xs font-mono font-bold">UNLOCKED</span>
                    ) : (
                      <span className="text-text-muted text-xs font-mono font-bold">LOCKED</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
