import React, { useState } from 'react';
import { Card } from '../ui/Cards';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const stories = [
    {
      name: 'Marcus Vance',
      role: 'Competitive Powerlifter (U83kg)',
      quote:
        'The Epley e1RM auto-calculation and RPE fatigue warnings completely changed my meet prep. FitFuel prevented 2 major overreaching injuries by suggesting accurate deload targets.',
      stats: 'Squat +22.5kg • Bench +15kg in 16 Weeks',
      avatarBg: 'bg-emerald-500',
      initials: 'MV',
    },
    {
      name: 'Elena Rostova',
      role: 'CrossFit Competitor & Track Athlete',
      quote:
        'Having precision macro rings and live optical turnstile gym check-in in a zero-lag offline PWA is incredible. I log food and sets even in the basement gym where cellular coverage is dead.',
      stats: 'Clean & Jerk PR: 98kg • Body Fat: 14.2%',
      avatarBg: 'bg-cyan-500',
      initials: 'ER',
    },
    {
      name: 'David Chen',
      role: 'Executive & Masters Lifter',
      quote:
        'The on-device form check caught my knee valgus in real-time. Within four weeks of following the coach suggestions and hip hinge exercises, my chronic knee aches vanished completely.',
      stats: 'Deadlift PR: 190kg @ 44yo',
      avatarBg: 'bg-amber-500',
      initials: 'DC',
    },
  ];

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + stories.length) % stories.length);
  };

  const current = stories[activeIndex];

  return (
    <section id="stories" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent/15 border border-accent/30 text-xs font-bold text-accent uppercase tracking-wider mb-4">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Fictional Sample Athletes (12k+ Global Spirits)</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
          Member Transformations
        </h2>
        <p className="mt-4 text-base text-text-muted">
          Real progress measured in raw strength, metabolic vitality, and pristine movement quality.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <Card className="p-8 sm:p-12 relative overflow-hidden border border-border bg-surface-card">
          <Quote className="absolute top-6 right-6 w-20 h-20 text-text-muted/10 pointer-events-none" />

          <div className="flex items-center gap-1 text-amber-400 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <p className="font-display text-lg sm:text-2xl font-bold text-text leading-relaxed mb-8">
            "{current.quote}"
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${current.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-md`}
              >
                {current.initials}
              </div>
              <div>
                <h4 className="font-display font-extrabold text-base text-text">
                  {current.name}
                </h4>
                <p className="text-xs text-text-muted">{current.role}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface border border-border text-xs font-mono text-accent font-bold">
              {current.stats}
            </div>
          </div>
        </Card>

        {/* Carousel controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="p-3 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {stories.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeIndex === idx ? 'w-8 bg-accent' : 'bg-border hover:bg-border-strong'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="p-3 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
