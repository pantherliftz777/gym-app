import React from 'react';

// 1. Macro Ring with Animated Stroke & Dynamic Colors
export interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  isCalorieMaster?: boolean;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  label,
  current,
  target,
  unit = 'g',
  size = 120,
  strokeWidth = 10,
  color,
  isCalorieMaster = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(1.5, Math.max(0, current / (target || 1)));
  const strokeDashoffset = circumference - Math.min(1, percentage) * circumference;

  // Calorie ring dynamic color shift rule:
  // Lime -> Amber within 100 kcal of target -> Coral/Red when over
  let resolvedColor = color || 'var(--accent)';
  if (isCalorieMaster) {
    const diff = target - current;
    if (current > target) {
      resolvedColor = 'var(--danger)'; // Coral / Red when over
    } else if (diff <= 100 && diff >= 0) {
      resolvedColor = 'var(--warn)'; // Amber within 100 kcal
    } else {
      resolvedColor = 'var(--accent)'; // Signature Lime / Emerald
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center relative select-none"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-label={`${label}: ${current} of ${target} ${unit}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center"
        >
          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Animated active stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-slow ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="font-mono text-lg font-extrabold tracking-tight text-text leading-none">
            {current.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-0.5">
            / {target.toLocaleString()} {unit}
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold tracking-wide text-text uppercase">
        {label}
      </span>
    </div>
  );
};

// 2. Hydration Wave with Animated Water Fill
export interface HydrationWaveProps {
  currentMl: number;
  goalMl: number;
  onQuickAdd: (ml: number) => void;
}

export const HydrationWave: React.FC<HydrationWaveProps> = ({
  currentMl,
  goalMl,
  onQuickAdd,
}) => {
  const pct = Math.min(100, Math.round((currentMl / (goalMl || 1)) * 100));

  return (
    <div className="bg-surface-card border border-border rounded-card p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 z-10">
        <div>
          <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Hydration
          </span>
          <h4 className="text-xl font-mono font-bold text-text mt-0.5">
            {currentMl.toLocaleString()} <span className="text-sm font-normal text-text-muted">/ {goalMl.toLocaleString()} ml</span>
          </h4>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-black text-cyan-400">{pct}%</span>
          <span className="block text-[11px] text-text-muted font-medium">Daily Goal</span>
        </div>
      </div>

      {/* Tank representation */}
      <div className="relative h-20 w-full bg-surface rounded-xl overflow-hidden border border-border/80 my-2 z-10">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600/60 to-cyan-400/40 transition-all duration-slow ease-out"
          style={{ height: `${pct}%` }}
        >
          {/* Animated top water ripple wave */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-cyan-300/60 blur-[1px] animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-text/80 pointer-events-none">
          {pct >= 100 ? 'Goal Reached!' : `${goalMl - currentMl} ml remaining`}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex items-center gap-2 mt-2 z-10">
        {[250, 500, 750].map(amount => (
          <button
            key={amount}
            onClick={() => onQuickAdd(amount)}
            className="flex-1 py-2 px-1 text-xs font-mono font-bold bg-surface border border-border rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-colors"
          >
            +{amount}ml
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. Toast Component
export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  let borderClass = 'border-accent text-accent';
  if (type === 'warning') borderClass = 'border-warn text-warn';
  if (type === 'error') borderClass = 'border-danger text-danger';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-pill bg-surface/95 backdrop-blur-md border ${borderClass} shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all animate-in fade-in slide-in-from-bottom-3 duration-fast`}
    >
      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
      <span className="font-display font-medium text-sm text-text">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-text-muted hover:text-text transition-colors"
          aria-label="Dismiss toast"
        >
          ×
        </button>
      )}
    </div>
  );
};

// 4. Status Pill (LIVE, BETA, COMING SOON)
export const StatusPill: React.FC<{ status: 'LIVE' | 'BETA' | 'COMING SOON'; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  let color = 'bg-accent/15 text-accent border-accent/30';
  if (status === 'BETA') {
    color = 'bg-amber-400/15 text-amber-400 border-amber-400/30';
  } else if (status === 'COMING SOON') {
    color = 'bg-indigo-400/15 text-indigo-400 border-indigo-400/30';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider uppercase rounded-pill border ${px} ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

// 5. Stat Pill
export const StatPill: React.FC<{
  label: string;
  value: string | number;
  highlight?: boolean;
}> = ({ label, value, highlight = false }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border text-xs ${
        highlight
          ? 'bg-accent/10 border-accent/40 text-accent font-bold'
          : 'bg-surface border-border text-text-muted font-medium'
      }`}
    >
      <span className="text-[11px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className="font-mono text-text font-bold">{value}</span>
    </div>
  );
};

// 6. Skeleton Loader
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'w-full h-6' }) => {
  return (
    <div
      className={`bg-surface animate-pulse rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

// 7. Offline Banner
export const OfflineBanner: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
  if (!isOffline) return null;
  return (
    <div
      role="alert"
      className="bg-warn/20 border-b border-warn/40 text-warn px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md"
    >
      <span className="w-2 h-2 rounded-full bg-warn animate-pulse" />
      Operating Offline — Your sets and meals are saved locally and will sync when reconnected.
    </div>
  );
};
