import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Input } from './Inputs';
import { api } from '@/lib/api';
import { Zap, X, ShieldCheck } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userName: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus first input or modal
      setTimeout(() => {
        const input = modalRef.current?.querySelector('input');
        input?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (tab === 'register' && !name.trim()) errs.name = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Please provide a valid email address.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (tab === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user.name);
      } else {
        const res = await api.register(name, email);
        onSuccess(res.user.name);
      }
      handleClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginDemoLifter();
      onSuccess(res.user.name);
      handleClose();
    } catch (err: any) {
      setErrors({ form: 'Demo bypass error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-fast"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-surface border border-border/80 rounded-2xl p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.4)] transition-all"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight text-text">
            FitFuel <Zap className="w-5 h-5 text-accent fill-accent" />
          </div>
          <h2 id="auth-modal-title" className="text-sm font-body text-text-muted mt-1">
            Athletic Performance Gateway
          </h2>
        </div>

        {/* Instant Demo Lifter Bypass Button */}
        <div className="mb-6 p-1 bg-accent/10 border border-accent/30 rounded-2xl">
          <Button
            type="button"
            variant="demo-lifter"
            onClick={handleInstantDemo}
            isLoading={isLoading}
            className="w-full py-3.5 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Instant Demo Lifter (Jordan Davis)</span>
          </Button>
          <p className="text-[11px] text-center text-text-muted mt-1.5 pb-1">
            Bypass password — Instant access to the 17 performance views
          </p>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
            Or Sign In Manually
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-card rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-accent text-on-accent shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Member Login
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-accent text-on-accent shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            New Athlete Register
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-medium">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Jordan Davis"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="athlete@fitfuel.vip"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          {tab === 'register' && (
            <Input
              label="Contact / Mobile (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            {tab === 'login' ? 'Sign In to FitFuel' : 'Create Performance Account'}
          </Button>
        </form>

        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Offline-first PWA • Encrypted edge sync</span>
        </div>
      </div>
    </div>
  );
};
