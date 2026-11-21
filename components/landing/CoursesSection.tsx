import React from 'react';
import { AngledCard } from '../ui/Cards';
import { Button } from '../ui/Button';
import { Clock, BookOpen, Star, ArrowRight } from 'lucide-react';

export const CoursesSection: React.FC<{ onEnroll: (courseTitle: string) => void }> = ({
  onEnroll,
}) => {
  const courses = [
    {
      title: 'Barbell Basics',
      tagline: 'Foundation Compound Lifts',
      badge: 'STRENGTH FOUNDATION',
      image: '/images/course_barbell.jpg',
      weeks: '6 Weeks',
      modules: '24 Modules',
      rating: '4.98',
      desc: 'Master the mechanics of the squat, bench press, deadlift, and overhead press with bar-path trajectory physics and brace cues.',
    },
    {
      title: 'Kettlebell Masterclass',
      tagline: 'Ballistic Power & Hip Hinge',
      badge: 'BALLISTIC POWER',
      image: '/images/course_kettlebell.jpg',
      weeks: '4 Weeks',
      modules: '16 Modules',
      rating: '4.95',
      desc: 'Build explosive triple extension, rotational grip endurance, and unbreakable core stability through the Turkish get-up and hardstyle snatch.',
    },
    {
      title: 'Cardio Power Boost',
      tagline: 'Lactate Threshold & Sprint Conditioning',
      badge: 'METABOLIC CONDITIONING',
      image: '/images/course_cardio.jpg',
      weeks: '8 Weeks',
      modules: '32 Modules',
      rating: '4.99',
      desc: 'Optimize your anaerobic threshold with precision heart rate zone periodization, assault bike intervals, and row splits.',
    },
  ];

  return (
    <section id="courses" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3">
            Elite Curriculum
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
            Train Smarter, <br />
            <span className="text-accent">Unleash Your Potential.</span>
          </h2>
        </div>
        <p className="max-w-md text-sm text-text-muted leading-relaxed">
          Structured video curricula filmed with biomechanists and world-record lifters. Each course integrates directly with your in-app tracker.
        </p>
      </div>

      {/* 3 AngledCard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => (
          <AngledCard
            key={idx}
            badge={course.badge}
            imageSrc={course.image}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 text-xs text-text-muted mb-3 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {course.weeks}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  {course.modules}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold ml-auto">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {course.rating}
                </span>
              </div>

              <h3 className="font-display text-2xl font-extrabold text-text mb-1">
                {course.title}
              </h3>
              <p className="text-xs font-bold text-accent uppercase tracking-wider mb-3">
                {course.tagline}
              </p>
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                {course.desc}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => onEnroll(course.title)}
              className="w-full justify-between group-hover:border-accent group-hover:text-accent"
            >
              <span>Inspect Curriculum</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </AngledCard>
        ))}
      </div>
    </section>
  );
};
