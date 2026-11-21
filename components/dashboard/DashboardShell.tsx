import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sun,
  Moon,
  Home,
  Utensils,
  Dumbbell,
  HeartPulse,
  ChefHat,
  BookOpen,
  Calculator,
  Bot,
  Camera,
  Activity,
  Watch,
  QrCode,
  Trophy,
  User,
  Package,
  Palette,
  Lock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wifi,
  WifiOff,
  Menu,
} from 'lucide-react';
import { StatusPill } from '../ui/Feedback';
import { Button } from '../ui/Button';

export interface DashboardShellProps {
  currentView: string;
  onSelectView: (view: string) => void;
  userName: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  isSynced: boolean;
  isOnline: boolean;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  currentView,
  onSelectView,
  userName,
  theme,
  onToggleTheme,
  onLogout,
  isSynced,
  isOnline,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const navGroups = [
    {
      group: 'Daily',
      items: [
        { id: 'today', label: 'Command Center', icon: <Home className="w-4 h-4" /> },
        { id: 'food-log', label: 'Food Log', icon: <Utensils className="w-4 h-4" /> },
        { id: 'tracking', label: 'Workout Tracker', icon: <Dumbbell className="w-4 h-4" /> },
        { id: 'cardio-log', label: 'Cardio Log', icon: <HeartPulse className="w-4 h-4" /> },
        { id: 'meal-prep', label: 'Meal Prep', icon: <ChefHat className="w-4 h-4" />, badge: 'PARTIAL' },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { id: 'exercise-library', label: 'Exercise Library', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'starting-load', label: 'Load Calculator', icon: <Calculator className="w-4 h-4" /> },
        { id: 'ai-coach', label: 'AI Coach', icon: <Bot className="w-4 h-4" /> },
        { id: 'posture', label: 'Form Check', icon: <Camera className="w-4 h-4" />, badge: 'BETA' },
        { id: 'body-analysis', label: 'Body Analysis', icon: <Activity className="w-4 h-4" />, badge: 'BETA' },
        { id: 'wearables', label: 'Wearables', icon: <Watch className="w-4 h-4" />, badge: 'PARTIAL' },
      ],
    },
    {
      group: 'Facility',
      items: [
        { id: 'facility', label: 'Facility & QR Pass', icon: <QrCode className="w-4 h-4" /> },
        { id: 'challenges', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
      ],
    },
    {
      group: 'Account',
      items: [
        { id: 'profile', label: 'Profile & Targets', icon: <User className="w-4 h-4" /> },
        { id: 'my-foods', label: 'My Foods', icon: <Package className="w-4 h-4" /> },
        { id: 'appearance', label: 'Appearance Studio', icon: <Palette className="w-4 h-4" /> },
        { id: 'admin', label: 'Admin Console', icon: <Lock className="w-4 h-4" /> },
      ],
    },
  ];

  // Primary mobile navigation items
  const mobileNavItems = [
    { id: 'today', label: 'Today', icon: <Home className="w-5 h-5" /> },
    { id: 'food-log', label: 'Food', icon: <Utensils className="w-5 h-5" /> },
    { id: 'tracking', label: 'Workout', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'ai-coach', label: 'Coach', icon: <Bot className="w-5 h-5" /> },
    { id: 'facility', label: 'Pass', icon: <QrCode className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar (Collapsible compact / expanded) */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-surface/90 backdrop-blur-xl transition-all duration-normal relative z-30 sticky top-0 h-screen overflow-y-auto ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-border">
          {!collapsed ? (
            <a
              href="#"
              className="flex items-center gap-1 font-display text-xl font-extrabold tracking-tight text-text"
            >
              <span>Fit</span>
              <span className="text-accent">
                <Zap className="w-4 h-4 fill-accent" />
              </span>
              <span>uel</span>
              <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-mono font-bold">
                PRO
              </span>
            </a>
          ) : (
            <div className="mx-auto text-accent">
              <Zap className="w-6 h-6 fill-accent" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface-hover"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 px-3 py-4 space-y-6">
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-mono font-bold tracking-wider uppercase text-text-muted/70 mb-1.5">
                  {grp.group}
                </div>
              )}
              {grp.items.map(item => {
                const isSelected = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-fast text-left ${
                      isSelected
                        ? 'bg-accent text-on-accent font-bold shadow-md'
                        : 'text-text-muted hover:text-text hover:bg-surface-card'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-surface/50 border border-current">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-border">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-surface-card flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-accent text-on-accent font-bold flex items-center justify-center shrink-0 text-xs">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-text truncate">{userName}</div>
                  <div className="text-[10px] text-text-muted truncate">Jordan Davis (VIP)</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              title="Log out"
              className="w-full py-2 flex items-center justify-center text-text-muted hover:text-danger"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full pb-20 md:pb-6 overflow-x-hidden">
        {/* Top Bar with dynamic greeting, sync dot, theme toggle */}
        <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur-md border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg border border-border text-text"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base text-text">
                {getGreeting()}, {userName.split(' ')[0]} 👋
              </h2>
              <p className="text-[11px] text-text-muted hidden sm:block">
                Athletic Performance Command System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Status Dot with 500ms auto-save feedback */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface border border-border text-[11px] font-mono"
              title={isSynced ? 'State saved' : 'Syncing changes...'}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isSynced ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="text-text-muted hidden sm:inline">
                {isSynced ? 'Synced' : 'Saving...'}
              </span>
            </div>

            {/* Offline Status indicator */}
            <div className="hidden sm:flex items-center text-xs text-text-muted" title={isOnline ? 'Online' : 'Offline'}>
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-border bg-surface text-text hover:text-accent hover:border-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Avatar Pill */}
            <div className="w-8 h-8 rounded-full bg-accent text-on-accent font-mono font-bold text-xs flex items-center justify-center shadow-sm">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>

        {/* View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Drawer (all 17 views accessible on mobile) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-surface h-full border-r border-border p-5 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="font-display font-extrabold text-xl text-text flex items-center gap-1">
                  FitFuel <Zap className="w-4 h-4 fill-accent text-accent" />
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-text-muted hover:text-text"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {navGroups.map((grp, gIdx) => (
                  <div key={gIdx}>
                    <div className="text-[10px] font-mono font-bold uppercase text-text-muted mb-2">
                      {grp.group}
                    </div>
                    <div className="space-y-1">
                      {grp.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectView(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                            currentView === item.id
                              ? 'bg-accent text-on-accent font-bold'
                              : 'text-text-muted hover:text-text hover:bg-surface-card'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full mt-6 text-xs text-danger"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-xl border-t border-border px-2 py-1.5 flex items-center justify-around"
      >
        {mobileNavItems.map(item => {
          const isSelected = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isSelected
                  ? 'text-accent font-bold scale-105'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
