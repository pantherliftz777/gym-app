import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Inputs';
import { HeartPulse, Activity, Flame, Clock, Navigation, Plus } from 'lucide-react';

export const CardioLogView: React.FC = () => {
  const [sessions, setSessions] = useState([
    {
      id: 'c1',
      date: 'Today',
      activity: 'Zone 2 Outdoor Run',
      distanceKm: 6.4,
      durationMin: 38,
      avgBpm: 138,
      maxBpm: 152,
      calories: 460,
      zone: 'Zone 2 (Aerobic Base)',
    },
    {
      id: 'c2',
      date: '3 Days Ago',
      activity: 'Assault Air Bike Tabata',
      distanceKm: 4.2,
      durationMin: 20,
      avgBpm: 168,
      maxBpm: 184,
      calories: 310,
      zone: 'Zone 5 (Anaerobic Peak)',
    },
  ]);

  const [distance, setDistance] = useState(5.0);
  const [duration, setDuration] = useState(30);
  const [avgBpm, setAvgBpm] = useState(140);
  const [activity, setActivity] = useState('Zone 2 Base Run');

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const pace = (duration / distance).toFixed(2);
    const cal = Math.round(duration * 11.5);
    setSessions([
      {
        id: 'c_' + Date.now(),
        date: 'Just now',
        activity,
        distanceKm: distance,
        durationMin: duration,
        avgBpm,
        maxBpm: avgBpm + 14,
        calories: cal,
        zone: avgBpm > 165 ? 'Zone 5 (VO2 Max)' : avgBpm > 145 ? 'Zone 3 (Tempo)' : 'Zone 2 (Base)',
      },
      ...sessions,
    ]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Cardiovascular Conditioning & Heart Rate Zones
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Aerobic capacity tracking, lactate threshold metrics, and calorie burn pricing.
          </p>
        </div>
      </div>

      {/* Heart Rate Zones Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { zone: 'Zone 1', range: '< 120 bpm', desc: 'Active Recovery', color: 'border-cyan-400 text-cyan-400' },
          { zone: 'Zone 2', range: '120-142 bpm', desc: 'Aerobic Base & Fat Oxidation', color: 'border-emerald-400 text-emerald-400' },
          { zone: 'Zone 3', range: '143-158 bpm', desc: 'Tempo & Glycogen', color: 'border-amber-400 text-amber-400' },
          { zone: 'Zone 4', range: '159-172 bpm', desc: 'Lactate Threshold', color: 'border-orange-500 text-orange-500' },
          { zone: 'Zone 5', range: '173+ bpm', desc: 'VO2 Max & Anaerobic', color: 'border-rose-500 text-rose-500' },
        ].map(z => (
          <div key={z.zone} className={`p-3 rounded-xl bg-surface-card border ${z.color}`}>
            <span className="font-mono text-xs font-bold block">{z.zone}</span>
            <span className="font-mono text-sm font-black text-text block my-0.5">{z.range}</span>
            <span className="text-[10px] text-text-muted leading-tight block">{z.desc}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Log Session Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text">
              Log Cardio Workout
            </h3>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Cardio Discipline
                </label>
                <select
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
                >
                  <option value="Zone 2 Base Run">Zone 2 Outdoor Run</option>
                  <option value="Concept2 Rower Intervals">Concept2 Rower Intervals</option>
                  <option value="Assault Air Bike Tabata">Assault Air Bike Tabata</option>
                  <option value="Incline Treadmill March">Incline Treadmill March</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Distance (km)"
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={e => setDistance(Number(e.target.value))}
                />
                <Input
                  label="Duration (min)"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                />
              </div>

              <Input
                label="Average Heart Rate (bpm)"
                type="number"
                value={avgBpm}
                onChange={e => setAvgBpm(Number(e.target.value))}
              />

              <Button type="submit" variant="primary" className="w-full text-xs">
                <Plus className="w-4 h-4 mr-1.5" /> Log Cardio Session
              </Button>
            </form>
          </Card>
        </div>

        {/* Recent Cardio Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-base text-text">
            Recorded Aerobic Logs
          </h3>
          <div className="space-y-3">
            {sessions.map(s => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-surface-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-text">{s.activity}</h4>
                    <span className="px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold bg-surface border border-border text-accent">
                      {s.zone}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted mt-1.5">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-accent" /> {s.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" /> {s.durationMin} min
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> {s.avgBpm} bpm avg
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-rose-500 flex items-center justify-end gap-1">
                    <Flame className="w-4 h-4" /> {s.calories}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase">Active Kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
