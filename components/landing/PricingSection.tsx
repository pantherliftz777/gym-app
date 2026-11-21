import React from 'react';
import { Card } from '../ui/Cards';
import { Button } from '../ui/Button';
import { Check, Sparkles, Zap, ShieldAlert } from 'lucide-react';

export const PricingSection: React.FC<{ onSelectTier: (tier: string) => void }> = ({
  onSelectTier,
}) => {
  const tiers = [
    {
      name: 'Core Free',
      price: '$0',
      period: 'forever',
      badge: null,
      highlight: false,
      unlocks: 'Essential Mifflin-St Jeor nutrition logging and local workout tracking.',
      features: [
        'Daily Calorie & Macro Ring Calculator',
        'Offline Food & Barcode Logging',
        '120+ Exercise Database with Form Cues',
        'Local Data Export (JSON format)',
      ],
      cta: 'Start Free Today',
      variant: 'secondary' as const,
    },
    {
      name: 'Pro Lifter',
      price: '$9.99',
      period: 'per month',
      badge: 'MOST POPULAR',
      highlight: true,
      unlocks: 'Unrestricted on-device AI Form Checking, e1RM curves, and audio voice cues.',
      features: [
        'Everything in Core Free',
        'On-Device AI Squat Depth & Pose Vision',
        'Automated RPE & Load Recalibration',
        'Hands-Free Web Audio Rest Ring Alerts',
        'Encrypted Multi-Device Cloud Sync',
      ],
      cta: 'Claim Pro Membership',
      variant: 'primary' as const,
    },
    {
      name: 'Coach',
      price: '$29.99',
      period: 'per month',
      badge: 'PLANNED',
      highlight: false,
      unlocks: 'Multi-athlete roster monitoring, video biomechanical review, and split assignment.',
      features: [
        'Manage Up to 25 Athlete Profiles',
        'Remote Form Video Annotations',
        'Custom Macro & Split Template Injector',
        'Direct 1-on-1 Encrypted Messaging',
      ],
      cta: 'Join Coach Waitlist',
      variant: 'ghost' as const,
    },
    {
      name: 'Facility',
      price: '$99+',
      period: 'per month',
      badge: 'ENTERPRISE',
      highlight: false,
      unlocks: 'Hardware turnstile integration, rolling 30s optical QR pass, and live crowd meters.',
      features: [
        'Optical QR Turnstile Hardware API',
        'Live Gym Floor Crowd Density Heatmap',
        'Member Class Reservation Booking',
        'Custom Branded PWA Terminal Mode',
      ],
      cta: 'Contact Facility Sales',
      variant: 'ghost' as const,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3">
          Transparent Tiers
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
          Invest in Your Athletic Longevity
        </h2>
        <p className="mt-4 text-base text-text-muted">
          Predictable pricing with zero hidden upsells. Cancel anytime with instant data portability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-normal border ${
              tier.highlight
                ? 'bg-surface-card border-accent shadow-[0_12px_40px_var(--accent-glow)] scale-105 z-10'
                : 'bg-surface border-border hover:border-border-strong'
            }`}
          >
            {tier.badge && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-pill text-[10px] font-mono font-bold uppercase tracking-wider ${
                  tier.badge === 'MOST POPULAR'
                    ? 'bg-accent text-on-accent shadow-md'
                    : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                }`}
              >
                {tier.badge}
              </span>
            )}

            <div>
              <h3 className="font-display text-xl font-bold text-text mb-2">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-mono text-4xl font-black text-text">
                  {tier.price}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  / {tier.period}
                </span>
              </div>

              {/* What it unlocks */}
              <div className="p-3 rounded-xl bg-surface-card/60 border border-border/60 text-xs text-text-muted mb-6 leading-relaxed">
                <strong className="text-accent block mb-0.5">Unlocks:</strong>
                {tier.unlocks}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs text-text">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={tier.variant}
              onClick={() => onSelectTier(tier.name)}
              className="w-full text-xs"
            >
              {tier.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
