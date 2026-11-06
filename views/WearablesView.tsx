import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import {
  Watch,
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

export const WearablesView: React.FC<{ showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void }> = ({
  showToast,
}) => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('Whoop 4.0');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [joinedPos, setJoinedPos] = useState<number | null>(null);

  const devices = [
    {
      name: 'Apple HealthKit & Apple Watch Ultra',
      status: 'COMING SOON',
      desc: 'Seamless background sync of active calories, resting heart rate, and VO2 max estimation.',
      metrics: 'RHR • Active Energy • HRV SDNN',
      icon: <Watch className="w-6 h-6 text-cyan-400" />,
    },
    {
      name: 'Whoop 4.0 & Peak Strain Engine',
      status: 'COMING SOON',
      desc: 'Direct integration with Whoop recovery scores to dynamically adjust prescribed daily RPE volume.',
      metrics: 'Day Strain • Recovery % • Sleep Need',
      icon: <Activity className="w-6 h-6 text-rose-500" />,
    },
    {
      name: 'Garmin Connect (Forerunner & Fenix)',
      status: 'COMING SOON',
      desc: 'High-frequency GPS pace telemetry, training readiness, and lactate threshold sync.',
      metrics: 'Pace • Training Load • Body Battery',
      icon: <Watch className="w-6 h-6 text-emerald-400" />,
    },
    {
      name: 'Oura Ring Gen 3 / Horizon',
      status: 'COMING SOON',
      desc: 'Nightly HRV baseline auditing and skin temperature trends for deload warnings.',
      metrics: 'Sleep Score • Readiness • Body Temp',
      icon: <Activity className="w-6 h-6 text-amber-400" />,
    },
  ];

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.joinHardwareWaitlist(waitlistEmail, selectedDevice);
    setJoinedPos(res.position);
    showToast(`You have joined the hardware waitlist at position #${res.position}!`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill status="COMING SOON" />
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
              HARDWARE SYNC HARNESS
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            Connected Wearables & Biosensors
          </h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsWaitlistModalOpen(true)}
          className="text-xs"
        >
          Join Hardware Waitlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((d, i) => (
          <Card key={i} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-surface border border-border">
                  {d.icon}
                </div>
                <StatusPill status="COMING SOON" />
              </div>

              <h3 className="font-display font-extrabold text-lg text-text mb-2">
                {d.name}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                {d.desc}
              </p>

              <div className="p-3 rounded-xl bg-surface border border-border text-xs font-mono text-accent">
                {d.metrics}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDevice(d.name);
                setIsWaitlistModalOpen(true);
              }}
              className="w-full mt-6 text-xs"
            >
              Request Early SDK Access &gt;
            </Button>
          </Card>
        ))}
      </div>

      {/* Waitlist Modal */}
      {isWaitlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface border border-indigo-400/40 rounded-2xl p-6 text-center shadow-2xl">
            <button
              onClick={() => {
                setIsWaitlistModalOpen(false);
                setJoinedPos(null);
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <Watch className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="font-display font-extrabold text-xl text-text mb-2">
              Hardware Waitlist & Early SDK
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Be the first to sync your biosensors when Apple HealthKit & Whoop API channels launch.
            </p>

            {joinedPos !== null ? (
              <div className="p-5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <h4 className="font-display font-bold text-text text-base">
                  Spot Reserved at #{joinedPos}
                </h4>
                <p className="text-xs text-text-muted mt-1">
                  We will notify you as soon as testing rolls out for {selectedDevice}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-4 text-left">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Select Target Device
                  </label>
                  <select
                    value={selectedDevice}
                    onChange={e => setSelectedDevice(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface-card border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
                  >
                    <option value="Whoop 4.0">Whoop 4.0</option>
                    <option value="Apple Watch Ultra">Apple Watch Ultra / HealthKit</option>
                    <option value="Garmin Fenix">Garmin Fenix / Forerunner</option>
                    <option value="Oura Ring Gen 3">Oura Ring Gen 3</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Athlete Notification Email
                  </label>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    placeholder="jordan.davis@fitfuel.vip"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-surface-card border border-border text-xs text-text focus-visible:outline focus-visible:outline-accent"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full text-xs mt-2">
                  Confirm Reservation Spot
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
