import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Zap, Sun, Moon, Menu, X, Shield } from 'lucide-react';

export interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onInstantDemo: () => void;
  onNavigateDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenAuth,
  onInstantDemo,
  onNavigateDashboard,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Platform', href: '#platform' },
    { label: 'Programs', href: '#programs' },
    { label: 'Courses', href: '#courses' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Stories', href: '#stories' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-normal ${
        scrolled
          ? 'bg-surface/85 backdrop-blur-xl border-b border-border shadow-sm py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark in Syne 800 with lightning bolt glyph */}
        <a
          href="#"
          className="flex items-center gap-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tighter text-text select-none group"
        >
          <span>Fit</span>
          <span className="relative inline-flex items-center text-accent">
            <Zap className="w-5 h-5 -mx-0.5 fill-accent group-hover:scale-125 transition-transform" />
          </span>
          <span>uel</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-muted">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => handleLinkClick(e, link.href)}
              className="hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2.5 rounded-pill border border-border text-text hover:text-accent hover:border-accent bg-surface/50 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Demo Lifter signature pulse button */}
          <Button
            variant="demo-lifter"
            size="sm"
            onClick={onInstantDemo}
            className="hidden md:inline-flex text-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Demo Lifter
          </Button>

          {/* Contact Us */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const footer = document.querySelector('#contact');
              footer?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden lg:inline-flex text-xs"
          >
            Contact Us
          </Button>

          {/* Get Started */}
          <Button variant="primary" size="sm" onClick={onOpenAuth} className="text-xs">
            Get Started
          </Button>
        </div>

        {/* Mobile controls & hamburger button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full border border-border text-text"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button
            variant="demo-lifter"
            size="sm"
            onClick={onInstantDemo}
            className="px-3 py-1.5 text-[11px]"
          >
            Demo
          </Button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 text-text hover:text-accent rounded-lg border border-border bg-surface"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (under 768px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[65px] bg-surface/98 backdrop-blur-2xl border-b border-border p-6 shadow-2xl animate-in slide-in-from-top-4 duration-fast">
          <nav className="flex flex-col gap-4 text-base font-semibold text-text">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => handleLinkClick(e, link.href)}
                className="py-2 border-b border-border/40 hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-3">
              <Button
                variant="demo-lifter"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onInstantDemo();
                }}
              >
                <Zap className="w-4 h-4 fill-current mr-2" />
                Launch Demo Lifter (Jordan Davis)
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
