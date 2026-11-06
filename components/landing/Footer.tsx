import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Zap, ShieldCheck, Github, Twitter, Instagram, ArrowRight, Check } from 'lucide-react';

export interface FooterProps {
  onStart: () => void;
  onInstantDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onStart, onInstantDemo }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer id="contact" className="border-t border-border bg-surface-card pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Final CTA Band */}
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-surface to-surface-card border border-accent/30 overflow-hidden mb-20 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-accent mb-3">
              Ready to Upgrade Your Body?
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text tracking-tight mb-4">
              Step Into The Arena of Precision Athleticism.
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-8">
              Join thousands of dedicated lifters using scientific progressive overload, on-device AI form auditing, and offline-first nutrition tracking.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg" onClick={onStart}>
                <span>Claim Your Membership</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="demo-lifter" size="lg" onClick={onInstantDemo}>
                <Zap className="w-4 h-4 fill-current mr-2" />
                Launch Demo Lifter (No Password)
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-border">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-1 font-display text-2xl font-extrabold text-text mb-4">
              <span>Fit</span>
              <span className="text-accent">
                <Zap className="w-5 h-5 fill-accent" />
              </span>
              <span>uel</span>
            </a>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm mb-6">
              "Sculpt Your Body, Elevate Your Spirit."
              <br />
              FitFuel is an athletic-intelligence fitness web application delivering precision nutrition, strength tracking, on-device AI form checking, and facility turnstile access. Offline-first PWA, privacy-first.
            </p>
            <div className="flex items-center gap-3 text-text-muted">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-border hover:border-accent hover:text-accent bg-surface"
                aria-label="FitFuel Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-border hover:border-accent hover:text-accent bg-surface"
                aria-label="FitFuel Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full border border-border hover:border-accent hover:text-accent bg-surface"
                aria-label="FitFuel GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text mb-4">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs text-text-muted">
              <li><a href="#platform" className="hover:text-accent transition-colors">Command Center</a></li>
              <li><a href="#platform" className="hover:text-accent transition-colors">Mifflin-St Jeor TDEE</a></li>
              <li><a href="#platform" className="hover:text-accent transition-colors">Epley e1RM Calculator</a></li>
              <li><a href="#platform" className="hover:text-accent transition-colors">AI Form Pose Check</a></li>
              <li><a href="#platform" className="hover:text-accent transition-colors">3D Body Composition</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text mb-4">
              Facility & Access
            </h4>
            <ul className="space-y-2.5 text-xs text-text-muted">
              <li><a href="#platform" className="hover:text-accent transition-colors">Optical Turnstile QR</a></li>
              <li><a href="#platform" className="hover:text-accent transition-colors">Live Crowd Floor Heatmap</a></li>
              <li><a href="#courses" className="hover:text-accent transition-colors">Barbell Basics Course</a></li>
              <li><a href="#courses" className="hover:text-accent transition-colors">Kettlebell Masterclass</a></li>
              <li><a href="#pricing" className="hover:text-accent transition-colors">Enterprise Gym API</a></li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text mb-4">
              Athletic Journal
            </h4>
            <p className="text-xs text-text-muted mb-3">
              Weekly scientific periodization articles and cutting-edge exercise physiology notes.
            </p>
            {subscribed ? (
              <div className="p-3 bg-accent/15 border border-accent/40 rounded-xl text-xs text-accent font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="athlete@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text placeholder:text-text-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  required
                />
                <Button variant="primary" type="submit" size="sm" className="w-full text-xs">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Accessibility Statement & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>WCAG 2.1 AA Compliant • High-contrast dark & light modes</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span>© {new Date().getFullYear()} FitFuel. All rights reserved.</span>
            <a href="#" className="hover:text-text transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text transition-colors">HIPAA/Biometric Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
