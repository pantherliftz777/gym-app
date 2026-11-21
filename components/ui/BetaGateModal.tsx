import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Inputs';
import { api } from '@/lib/api';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';

export interface BetaGateModalProps {
  isOpen: boolean;
  featureTitle: string;
  featureId: string;
  onClose: () => void;
  onUnlocked: () => void;
}

export const BetaGateModal: React.FC<BetaGateModalProps> = ({
  isOpen,
  featureTitle,
  featureId,
  onClose,
  onUnlocked,
}) => {
  const [device, setDevice] = useState('iOS (LiDAR / TrueDepth)');
  const [reason, setReason] = useState('Competitive lifter needing real-time biomechanics audit.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await api.applyBetaAccess(featureId, device, reason);
    setIsSubmitting(false);
    setApplied(true);
    setTimeout(() => {
      onUnlocked();
      onClose();
    }, 1200);
  };

  const handleSandboxPreview = () => {
    onUnlocked();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-surface border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
            BETA ACCESS REQUIRED
          </span>
        </div>

        <h3 className="font-display text-2xl font-extrabold text-text mb-2">
          {featureTitle}
        </h3>
        <p className="text-sm text-text-muted mb-6">
          This feature uses cutting-edge on-device neural vision and localized biomechanical compute. Request early sandbox access below.
        </p>

        {applied ? (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h4 className="font-display font-bold text-emerald-400 text-base">
              Beta Access Granted!
            </h4>
            <p className="text-xs text-text-muted mt-1">
              Unlocking sensor harness and launching interactive preview...
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Target Capture Hardware
              </label>
              <select
                value={device}
                onChange={e => setDevice(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-surface-card border border-border text-text text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <option value="iOS (LiDAR / TrueDepth)">Apple iPhone 14/15/16 Pro (LiDAR)</option>
                <option value="Android Flagship (Chrome)">Android Flagship Camera (Chrome 120+)</option>
                <option value="Desktop Webcam (1080p 60fps)">Desktop HD Webcam (60 FPS)</option>
                <option value="Synthetic Simulator">Synthetic Browser Pose Emulator</option>
              </select>
            </div>

            <Input
              label="Intended Use Case"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Squat depth audit and knee valgus check"
              required
            />

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply for Beta Access
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSandboxPreview}
                className="w-full text-xs"
              >
                Preview in Sandbox Mode (Instant)
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
