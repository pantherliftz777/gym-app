import React from 'react';

// 1. Text & Number Input with floating label or clear label
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-surface border ${
          error ? 'border-danger focus-visible:outline-danger' : 'border-border focus-visible:outline-accent'
        } text-text text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] placeholder:text-text-muted/50 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
      {helper && !error && <span className="text-xs text-text-muted">{helper}</span>}
    </div>
  );
};

// 2. Custom Slider
export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center text-sm font-semibold">
        <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <span className="font-mono text-accent font-bold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={`w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent ${className}`}
        {...props}
      />
      <div className="flex justify-between text-[10px] font-mono text-text-muted">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

// 3. Segmented Control / Pills
export interface SegmentedPillsProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedPillsProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex p-1 rounded-pill bg-surface border border-border gap-1 overflow-x-auto max-w-full ${className}`}
    >
      {options.map(opt => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-pill transition-all whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              isSelected
                ? 'bg-accent text-on-accent shadow-[0_2px_12px_var(--accent-glow)]'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// 4. Rate of Perceived Exertion (RPE) Selector (1–10)
export interface RPESelectorProps {
  value: number;
  onChange: (val: number) => void;
}

export const RPESelector: React.FC<RPESelectorProps> = ({ value, onChange }) => {
  const getRpeColor = (rpe: number) => {
    if (rpe <= 6) return 'hover:border-emerald-400';
    if (rpe <= 8) return 'hover:border-amber-400';
    return 'hover:border-rose-500';
  };

  const getRpeDescription = (rpe: number) => {
    switch (rpe) {
      case 6: return 'Warmup / 4+ reps in reserve';
      case 7: return 'Moderate / 3 reps in reserve';
      case 8: return 'Heavy / 2 reps in reserve';
      case 8.5: return 'Definite 1 rep in reserve, maybe 2';
      case 9: return 'Maximum effort / 1 rep in reserve';
      case 9.5: return 'No reps left, could add 1-2kg';
      case 10: return 'Absolute failure / Maximum strain';
      default: return 'Light load';
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
          RPE (Exertion 1–10)
        </label>
        <span className="font-mono text-xs text-accent font-bold">
          {value} — {getRpeDescription(value)}
        </span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`min-h-[48px] rounded-xl font-mono text-xs font-bold transition-all border flex items-center justify-center ${
                isSelected
                  ? 'bg-accent text-on-accent border-accent scale-105 shadow-md font-extrabold'
                  : `bg-surface border-border text-text ${getRpeColor(n)} hover:bg-surface-hover`
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 5. Chip Filter
export const ChipFilter: React.FC<{
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}> = ({ label, count, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] px-3.5 py-1.5 rounded-pill text-xs font-semibold border transition-all inline-flex items-center gap-2 whitespace-nowrap ${
        active
          ? 'bg-accent/15 border-accent text-accent font-bold shadow-sm'
          : 'bg-surface border-border text-text-muted hover:border-border-strong hover:text-text'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-accent text-on-accent' : 'bg-surface-card text-text-muted'}`}>
          {count}
        </span>
      )}
    </button>
  );
};
