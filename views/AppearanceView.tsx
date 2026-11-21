import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Palette, Check, Sparkles } from 'lucide-react';

export interface AppearanceViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AppearanceView: React.FC<AppearanceViewProps> = ({
  theme,
  onToggleTheme,
  showToast,
}) => {
  const [selectedAccent, setSelectedAccent] = useState('lime');

  const accents = [
    { id: 'lime', name: 'Signature Neon Lime', hex: '#CEFF1A', text: '#060709' },
    { id: 'emerald', name: 'Porcelain Emerald', hex: '#10B981', text: '#060709' },
    { id: 'cyan', name: 'Cyber Cyan 400', hex: '#06B6D4', text: '#060709' },
    { id: 'crimson', name: 'Crimson Surge', hex: '#F43F5E', text: '#FFFFFF' },
  ];

  const handleSelectAccent = (accentId: string) => {
    setSelectedAccent(accentId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accentId);
    }
    showToast(`Accent palette updated to ${accentId.toUpperCase()}.`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Appearance Studio & Color Calibration
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Customize chromatic contrast, high-energy neon hues, and editorial porcelain surfaces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Theme & Accent Selectors */}
        <div className="lg:col-span-7 space-y-6">
          {/* Base Theme Switcher */}
          <Card className="p-6">
            <h3 className="font-display font-extrabold text-base text-text mb-4">
              Base Color Canvas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => theme === 'light' && onToggleTheme()}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  theme === 'dark'
                    ? 'bg-[#060709] border-accent text-white shadow-lg'
                    : 'bg-[#14171F] border-border text-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-5 h-5 text-amber-300" />
                  {theme === 'dark' && <Check className="w-4 h-4 text-accent" />}
                </div>
                <div className="font-display font-bold text-sm text-white">Cinematic Dark</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  #060709 pitch obsidian with volumetric mouse tracking bloom.
                </p>
              </button>

              <button
                type="button"
                onClick={() => theme === 'dark' && onToggleTheme()}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  theme === 'light'
                    ? 'bg-[#F6F5F0] border-accent text-[#0B1410] shadow-lg'
                    : 'bg-white border-border text-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sun className="w-5 h-5 text-emerald-600" />
                  {theme === 'light' && <Check className="w-4 h-4 text-accent" />}
                </div>
                <div className="font-display font-bold text-sm text-[#0B1410]">Warm Porcelain Light</div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  #F6F5F0 editorial porcelain with morning sunbeam gradients.
                </p>
              </button>
            </div>
          </Card>

          {/* Accent Color Swatches */}
          <Card className="p-6">
            <h3 className="font-display font-extrabold text-base text-text mb-4">
              Signature Accent Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {accents.map(acc => {
                const isSelected = selectedAccent === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccent(acc.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-transform ${
                      isSelected
                        ? 'border-accent scale-105 shadow-md'
                        : 'border-border hover:border-border-strong'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm"
                      style={{ backgroundColor: acc.hex, color: acc.text }}
                    >
                      {isSelected && <Check className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold text-text text-center">
                      {acc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Live Component Preview */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-2">
              Real-Time Token Preview
            </span>
            <h4 className="font-display font-extrabold text-lg text-text mb-3">
              Athletic Overload Interface
            </h4>
            <p className="text-xs text-text-muted mb-6">
              Buttons, rings, and telemetry badges adapt instantly to your selected visual tokens.
            </p>

            <div className="space-y-3">
              <Button variant="primary" className="w-full text-xs">
                Primary Glow Button
              </Button>
              <Button variant="demo-lifter" className="w-full text-xs">
                Pulsing Demo Pill
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
