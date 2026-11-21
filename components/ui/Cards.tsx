import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-surface-card border border-border rounded-card p-6 transition-all duration-normal ${
        hoverEffect ? 'hover:border-border-strong hover:bg-surface-hover hover:shadow-lg' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassCard: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-surface/75 backdrop-blur-xl border border-border/80 rounded-card p-6 transition-all duration-normal shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${
        hoverEffect ? 'hover:border-accent/40 hover:bg-surface/90' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AngledCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  imageSrc?: string;
}

export const AngledCard: React.FC<AngledCardProps> = ({
  children,
  className = '',
  badge,
  imageSrc,
  ...props
}) => {
  return (
    <div
      className={`group relative bg-surface-card border border-border overflow-hidden angled-card-shape transition-all duration-normal hover:border-accent hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.2)] ${className}`}
      {...props}
    >
      {/* Top right chamfer accent corner pip that scales on hover */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-20">
        <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-accent transition-transform duration-normal group-hover:scale-150 shadow-[0_0_8px_var(--accent-glow)]" />
      </div>

      {imageSrc && (
        <div className="relative w-full h-52 overflow-hidden bg-surface">
          <img
            src={imageSrc}
            alt="Course preview"
            className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105 filter grayscale contrast-125"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/40 to-transparent" />
          {badge && (
            <span className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md border border-border px-3 py-1 rounded-pill text-xs font-bold text-accent">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="p-6 relative z-10">{children}</div>
    </div>
  );
};
