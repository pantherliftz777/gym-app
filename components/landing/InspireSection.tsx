import React from 'react';
import {
  Apple,
  TrendingUp,
  Users2,
  Award,
  Crown,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const InspireSection: React.FC = () => {
  const checklist = [
    {
      title: 'Nutrition Guidance',
      desc: 'Precision caloric targets and macro splits derived via scientific Mifflin-St Jeor formulas.',
      icon: <Apple className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Progress Tracking',
      desc: 'Real-time 1RM progression curve, set logs with RPE, and automated rest interval alerts.',
      icon: <TrendingUp className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Community Support',
      desc: 'Connect with a global tribe of verified lifters and participate in live challenges.',
      icon: <Users2 className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Expert Trainers',
      desc: 'Direct periodization protocols built alongside master strength and conditioning coaches.',
      icon: <Award className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Premium Membership',
      desc: 'Unlimited on-device computer vision posture audits and localized encrypted biometrics.',
      icon: <Crown className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Next-Level Fitness Spaces',
      desc: 'Instant optical turnstile QR access across partnered elite high-performance facilities.',
      icon: <Building2 className="w-5 h-5 text-accent" />,
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Image Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-card p-2 shadow-2xl">
            <div className="relative h-[440px] sm:h-[520px] rounded-xl overflow-hidden bg-surface">
              <img
                src="/images/athlete_inspire.png"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = '/images/inspire_card.png';
                }}
                alt="FitFuel Athlete Training"
                className="w-full h-full object-cover object-center filter grayscale contrast-125 hover:scale-105 transition-transform duration-slow"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Overlay Stat Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-surface/90 backdrop-blur-md border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      Verified Biofeedback
                    </span>
                    <h4 className="font-display font-extrabold text-base text-text">
                      High-Precision Symmetry
                    </h4>
                  </div>
                  <span className="font-mono text-xl font-black text-accent">98.4%</span>
                </div>
              </div>
            </div>
          </div>
          {/* Subtle neon corner accent */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right Column: Editorial Copy & 6 Checklist Items */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/10 border border-accent/30 text-xs font-bold text-accent uppercase tracking-wider mb-4">
            Our Purpose
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight leading-tight mb-4">
            Inspired to Inspire <br />
            <span className="text-accent">Your Best Self.</span>
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed mb-8">
            We're your partner in achieving a healthier, stronger, and more confident you. Eliminate guesswork through athletic intelligence and rigorous biomechanical science.
          </p>

          {/* 6 Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {checklist.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-surface-card transition-colors duration-fast border border-transparent hover:border-border"
              >
                <div className="p-2 rounded-lg bg-surface border border-border shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-text mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
