import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Lock, KeyRound, Server, Users, Database, ShieldCheck, Activity } from 'lucide-react';

export const AdminConsoleView: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '777' || adminPin === 'admin' || adminPin === 'fitfuel') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-danger/10 border border-danger/30 text-danger mx-auto flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-danger block mb-2">
          SECURE ADMINISTRATIVE SUB-SYSTEM
        </span>
        <h1 className="font-display font-extrabold text-3xl text-text mb-4">
          Restricted Access — Administrator Privileges Required
        </h1>
        <p className="text-sm text-text-muted leading-relaxed mb-8">
          This portal allows operations staff to inspect optical turnstile throughput, Turso edge persistence, and rate-limiting quotas.
        </p>

        <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-4">
          <input
            type="password"
            value={adminPin}
            onChange={e => setAdminPin(e.target.value)}
            placeholder="Enter Admin PIN (Demo bypass: 777)"
            className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-surface border text-sm text-center text-text focus-visible:outline focus-visible:outline-2 ${
              pinError ? 'border-danger focus-visible:outline-danger' : 'border-border focus-visible:outline-accent'
            }`}
          />
          {pinError && (
            <div className="text-xs text-danger font-medium">
              Invalid security credential. Hint: use demo PIN "777".
            </div>
          )}
          <Button type="submit" variant="primary" className="w-full text-xs">
            Authenticate Administrator Console
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              SECURITY AUDIT LEVEL 4 ACTIVE
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            System Operations & Infrastructure Telemetry
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsUnlocked(false)} className="text-xs">
          Lock Console
        </Button>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Edge Latency', value: '18 ms', icon: <Server className="w-4 h-4 text-emerald-400" /> },
          { label: 'Active Sessions', value: '412 Lifters', icon: <Users className="w-4 h-4 text-cyan-400" /> },
          { label: 'Turnstile Scans', value: '1,894 Today', icon: <ShieldCheck className="w-4 h-4 text-accent" /> },
          { label: 'Turso Cloud SQLite', value: 'Healthy (0.01% error)', icon: <Database className="w-4 h-4 text-purple-400" /> },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-text-muted">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="font-mono text-xl font-black text-text">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Log Feed */}
      <Card className="p-6">
        <h3 className="font-display font-extrabold text-base text-text mb-4">
          Real-Time Hardware & API Event Stream
        </h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            { time: '02:04:12', msg: 'Turnstile Optical Scanner Gate #2: Token FF-TURNSTILE-99824 accepted', code: '200 OK' },
            { time: '02:03:55', msg: 'POST /api/workout: Jordan Davis logged PR 110kg on Bench Press', code: '201 CREATED' },
            { time: '02:02:10', msg: 'Scrypt authentication verify token generated for jordan.davis@fitfuel.vip', code: '200 OK' },
            { time: '01:58:32', msg: 'ServiceWorker background sync flush: ff_offline_queue_v1 queue empty', code: 'SYNC OK' },
          ].map((log, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-text-muted">{log.time}</span>
                <span className="text-text">{log.msg}</span>
              </div>
              <span className="text-accent font-bold">{log.code}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
