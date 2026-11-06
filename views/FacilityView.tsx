import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import {
  QrCode,
  ShieldCheck,
  Flame,
  Users,
  MapPin,
  Calendar,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

export const FacilityView: React.FC<{ onOpenQRModal: () => void }> = ({ onOpenQRModal }) => {
  const [qrSeconds, setQrSeconds] = useState(30);
  const [bookedClasses, setBookedClasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setQrSeconds(s => (s > 1 ? s - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const classes = [
    {
      id: 'c1',
      title: 'Barbell Olympic Power & Snatch Clinic',
      time: 'Today • 05:30 PM (60 min)',
      instructor: 'Coach Alexei Vance',
      spotsLeft: 3,
      intensity: 5,
      room: 'Olympic Platform Zone A',
    },
    {
      id: 'c2',
      title: 'HIIT Conditioning & Assault Bike Sprints',
      time: 'Tomorrow • 07:00 AM (45 min)',
      instructor: 'Coach Sarah Miller',
      spotsLeft: 8,
      intensity: 4,
      room: 'Turf Performance Arena',
    },
    {
      id: 'c3',
      title: 'Active Mobility & Fascial Release',
      time: 'Tomorrow • 06:15 PM (50 min)',
      instructor: 'Dr. Liam Sterling',
      spotsLeft: 12,
      intensity: 2,
      room: 'Recovery Zen Studio',
    },
  ];

  const zones = [
    { name: 'Olympic Platforms & Heavy Free Weights', density: 84, color: 'text-rose-500', barBg: 'bg-rose-500' },
    { name: 'Cardio Deck (Woodway & Concept2 Rowers)', density: 35, color: 'text-emerald-400', barBg: 'bg-emerald-400' },
    { name: 'Turf Functional Sprint Track & Prowlers', density: 52, color: 'text-amber-400', barBg: 'bg-amber-400' },
    { name: 'Recovery Suite (Cold Plunge & Infrared Sauna)', density: 60, color: 'text-cyan-400', barBg: 'bg-cyan-400' },
  ];

  const handleToggleBooking = (classId: string) => {
    setBookedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              FACILITY ACCESS ACTIVE
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            Facility Turnstile & Live Gym Operations
          </h1>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenQRModal} className="text-xs">
          <QrCode className="w-4 h-4 mr-2" />
          Full Screen Optical Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 30-Second Rolling QR Turnstile Pass */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-accent/40 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-accent mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-display font-extrabold text-sm tracking-wide">
                DYNAMIC OPTICAL PASS
              </span>
            </div>
            <p className="text-xs text-text-muted mb-6">
              Present against turnstile optical glass scanner upon arrival.
            </p>

            {/* Simulated QR Viewport */}
            <div className="relative mx-auto w-56 h-56 bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner cursor-pointer" onClick={onOpenQRModal}>
              <div className="w-44 h-44 bg-black p-2 rounded-lg grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm transition-colors duration-fast ${
                      (i * 9 + qrSeconds * 4) % 3 !== 0 ? 'bg-white' : 'bg-black'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white rounded-lg shadow-lg border border-black flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-black" />
                </div>
              </div>
            </div>

            {/* Circular Countdown Ring */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="var(--border)" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - qrSeconds / 30)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute font-mono text-[11px] font-bold text-accent">
                  {qrSeconds}s
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-text block">Rotating in {qrSeconds}s</span>
                <span className="text-[10px] text-text-muted">Keep screen bright against optical scanner</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs font-mono">
              <span className="text-text-muted">Access Level:</span>
              <span className="text-accent font-bold">Pro Lifter 24/7 VIP</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Crowd Meter with Zone Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-display font-extrabold text-base text-text">
                  Live Gym Floor Traffic & Zone Density
                </h3>
              </div>
              <span className="font-mono text-xs text-text-muted">Updated 2m ago</span>
            </div>

            <div className="space-y-4">
              {zones.map((zone, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-text">{zone.name}</span>
                    <span className={`font-mono font-bold ${zone.color}`}>{zone.density}% Density</span>
                  </div>
                  <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-slow ${zone.barBg}`}
                      style={{ width: `${zone.density}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Class Booking List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="font-display font-extrabold text-base text-text">
                  Reserve Elite Coaching Sessions
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {classes.map(c => {
                const isBooked = bookedClasses[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border-strong transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-text">
                          {c.title}
                        </h4>
                        <div className="flex text-amber-400" title={`Intensity: ${c.intensity}/5 flames`}>
                          {Array.from({ length: c.intensity }).map((_, i) => (
                            <Flame key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-accent" /> {c.time}
                        </span>
                        <span>•</span>
                        <span>{c.instructor}</span>
                        <span>•</span>
                        <span className="text-accent font-bold">{c.spotsLeft} spots left</span>
                      </div>
                    </div>

                    <Button
                      variant={isBooked ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleBooking(c.id)}
                      className="text-xs whitespace-nowrap"
                    >
                      {isBooked ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-accent" />
                          Spot Confirmed
                        </>
                      ) : (
                        'Reserve Spot'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
