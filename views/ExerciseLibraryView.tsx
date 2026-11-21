import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { ChipFilter } from '@/components/ui/Inputs';
import { Button } from '@/components/ui/Button';
import { EXERCISE_DATABASE, ExerciseItem } from '@/lib/exerciseData';
import {
  Search,
  Dumbbell,
  Clock,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const ExerciseLibraryView: React.FC<{ onAddToWorkout?: (ex: ExerciseItem) => void }> = ({
  onAddToWorkout,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const muscleGroups = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full body'];
  const equipments = ['all', 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = EXERCISE_DATABASE.filter(ex => {
    const matchSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
    const matchEq = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    const matchLvl = selectedLevel === 'all' || ex.level === selectedLevel;
    return matchSearch && matchMuscle && matchEq && matchLvl;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Exercise & Biomechanics Library
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Over 120+ calibrated movements categorized by anatomical vector and equipment requirement.
          </p>
        </div>
        <div className="font-mono text-xs text-text-muted">
          Showing <span className="font-bold text-accent">{filtered.length}</span> movements
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by exercise name, anatomical group, or cue..."
          className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3">
        {/* Muscle Groups */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted shrink-0 mr-1">
            Muscle:
          </span>
          {muscleGroups.map(m => (
            <ChipFilter
              key={m}
              label={m.charAt(0).toUpperCase() + m.slice(1)}
              active={selectedMuscle === m}
              onClick={() => setSelectedMuscle(m)}
            />
          ))}
        </div>

        {/* Equipment & Level Selectors */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Equipment:
            </span>
            <select
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
            >
              {equipments.map(eq => (
                <option key={eq} value={eq}>
                  {eq.charAt(0).toUpperCase() + eq.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Level:
            </span>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
            >
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ex => {
          const isExpanded = expandedId === ex.id;
          return (
            <Card
              key={ex.id}
              className="flex flex-col justify-between hover:border-accent transition-all duration-fast"
            >
              <div>
                {/* SVG Muscle Diagram Accent */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border text-accent">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                      {ex.muscleGroup}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold bg-surface border border-border text-text-muted">
                    {ex.level}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-lg text-text mb-2">
                  {ex.name}
                </h3>

                <div className="flex items-center gap-4 text-xs font-mono text-text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    {ex.defaultSets}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {ex.defaultRest}
                  </span>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in fade-in">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-text mb-1">
                        Form Cues:
                      </h4>
                      <ul className="space-y-1">
                        {ex.instructions.map((inst, i) => (
                          <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                        Pro Tip:
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {ex.tips[0]}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{isExpanded ? 'Hide Cues' : 'Inspect Cues'}</span>
                </button>

                {onAddToWorkout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToWorkout(ex)}
                    className="text-xs"
                  >
                    + Add to Session
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
