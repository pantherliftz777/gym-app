import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, QrCode, Shield, RefreshCw } from 'lucide-react';

export interface QRPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName?: string;
  memberTier?: string;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({
  isOpen,
  onClose,
  memberName = 'Jordan Davis',
  memberTier = 'Pro Lifter VIP',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [tokenSeed, setTokenSeed] = useState('FF-TURNSTILE-99824');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setTokenSeed('FF-TURNSTILE-' + Math.floor(10000 + Math.random() * 90000));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (secondsLeft / 30) * circumference;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-surface border border-accent/40 rounded-2xl p-6 text-center shadow-[0_20px_50px_rgba(206,255,26,0.15)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-1 text-accent">
          <Shield className="w-5 h-5" />
          <span className="font-display font-extrabold text-sm tracking-wide">
            FITFUEL OPTICAL PASS
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Contactless Turnstile & Facility Gate Access
        </p>

        {/* Dynamic QR Code Canvas Simulation */}
        <div className="relative my-5 p-4 bg-white rounded-2xl mx-auto w-64 h-64 flex flex-col items-center justify-center shadow-inner">
          {/* Simulated 2D Data Matrix QR Grid */}
          <div className="w-48 h-48 bg-black p-2 rounded-lg grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }).map((_, i) => {
              const active = (i * 7 + secondsLeft * 3) % 4 !== 0;
              return (
                <div
                  key={i}
                  className={`rounded-sm transition-colors duration-fast ${
                    active ? 'bg-white' : 'bg-black'
                  }`}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-black flex items-center justify-center">
              <QrCode className="w-7 h-7 text-black" />
            </div>
          </div>
        </div>

        {/* Rotating in Xs with Circular Countdown */}
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="var(--border)"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="var(--accent)"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - secondsLeft / 30)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-accent">
              {secondsLeft}s
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-text">Rotating in {secondsLeft}s</div>
            <div className="text-[10px] text-text-muted">Keep screen bright against scanner</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-surface-card border border-border text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">Member</span>
            <span className="font-bold text-text">{memberName}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-text-muted">Pass Tier</span>
            <span className="font-mono text-accent font-bold">{memberTier}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-text-muted">Auth Hash</span>
            <span className="font-mono text-[10px] text-text-muted">{tokenSeed}</span>
          </div>
        </div>

        <Button variant="primary" onClick={onClose} className="w-full mt-4">
          Done
        </Button>
      </div>
    </div>
  );
};
