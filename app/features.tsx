import React, { useState } from 'react';
import { GYM_FEATURES, FeatureDefinition, FeatureStatus } from '../shared/featureStatus';
import { FeaturePreviewModal } from '../components/ui/feature-preview-modal';

type FilterTab = 'all' | 'workouts-ai' | 'nutrition' | 'gym-turnstile' | 'wearables';

export const FeaturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'gym'>('dark');

  const featuresList = Object.values(GYM_FEATURES);

  // Dynamic category filter covering all merged production and beta features
  const filteredFeatures = featuresList.filter((f) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'workouts-ai') {
      return f.category === 'workout' || f.category === 'community';
    }
    if (activeTab === 'nutrition') {
      return f.category === 'nutrition';
    }
    if (activeTab === 'gym-turnstile') {
      return f.category === 'membership';
    }
    if (activeTab === 'wearables') {
      return f.category === 'hardware';
    }
    return true;
  });

  const openPreview = (id: string) => {
    setSelectedFeatureId(id);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Beta
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Coming Soon
          </span>
        );
    }
  };

  const getFeatureIcon = (id: string) => {
    switch (id) {
      case 'workoutTracking': return '🏋️‍♂️';
      case 'exerciseLibrary': return '📖';
      case 'startingLoad': return '🔢';
      case 'gymChallenges': return '🏆';
      case 'foodLogging': return '🍽️';
      case 'macroCalculator': return '🥗';
      case 'customFoods': return '🍎';
      case 'aiCoach': return '🤖';
      case 'progressTracking': return '📈';
      case 'bodyAnalysis': return '📐';
      case 'gpsActivity': return '🗺️';
      case 'memberPlans': return '💳';
      case 'attendanceTracking': return '📅';
      case 'qrEntry': return '📱';
      case 'classBooking': return '🗓️';
      case 'adminPortal': return '🛡️';
      case 'formCorrectionAi': return '👁️';
      case 'trainerChat': return '💬';
      case 'wearableSync': return '⌚';
      case 'mealPlanAi': return '🍲';
      case 'bodyScan3D': return '🧬';
      case 'gymCrowdMeter': return '📊';
      default: return '⚡';
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'gym' : 'dark');
  };

  return (
    <div className={`min-h-screen ${theme === 'gym' ? 'bg-[#0f172a] text-[#f8fafc]' : 'bg-[#121214] text-[#e4e4e7]'} flex flex-col font-sans transition-colors duration-300 pb-20 md:pb-8`}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center font-black text-zinc-950 text-lg shadow-md group-hover:scale-105 transition-transform">
                F
              </span>
              <span className="font-extrabold text-xl tracking-tight text-white">
                FitFuel <span className="text-emerald-400 font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">STATUS ENGINE</span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition"
            >
              {theme === 'dark' ? '⚡ High-Energy Theme' : '🌙 Midnight Dark'}
            </button>
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition shadow-sm"
            >
              Open Web App
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Transparent Architecture • Zero Vaporware
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Honest UI Capability &amp; Feature Status Engine
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          Every capability is mapped to its operational reality. Test upcoming features directly in our interactive sandbox simulators before their production release.
        </p>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4 text-center">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {featuresList.filter(f => f.status === 'available').length}
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">Live in Production</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {featuresList.filter(f => f.status === 'beta').length}
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">Public Beta</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
              {featuresList.filter(f => f.status === 'coming-soon').length}
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400 font-medium">Live Sandboxes</div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto w-full pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800/80">
          {[
            { id: 'all' as FilterTab, label: 'All Capabilities', count: featuresList.length },
            { id: 'workouts-ai' as FilterTab, label: 'Workouts & AI', count: featuresList.filter(f => f.category === 'workout' || f.category === 'community').length },
            { id: 'nutrition' as FilterTab, label: 'Nutrition', count: featuresList.filter(f => f.category === 'nutrition').length },
            { id: 'gym-turnstile' as FilterTab, label: 'Gym & Turnstile', count: featuresList.filter(f => f.category === 'membership').length },
            { id: 'wearables' as FilterTab, label: 'Wearables', count: featuresList.filter(f => f.category === 'hardware').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-zinc-950/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Features Showcase Grid */}
      <main className="px-4 sm:px-6 max-w-7xl mx-auto w-full py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFeatures.map((feat) => {
            const isAvailable = feat.status === 'available';
            const isBeta = feat.status === 'beta';
            const isComingSoon = feat.status === 'coming-soon';

            return (
              <div
                key={feat.id}
                onClick={() => openPreview(feat.id)}
                className="group relative bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                      {getFeatureIcon(feat.id)}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(feat.status)}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                        {feat.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {feat.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-400/90 mt-0.5">{feat.tagline}</p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {feat.description}
                  </p>

                  {feat.technicalReason && (
                    <div className="text-[11px] p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 flex items-start gap-1.5">
                      <span className="text-amber-400">ℹ</span>
                      <span className="line-clamp-2">{feat.technicalReason}</span>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  {isAvailable && (
                    <a
                      href={feat.actionRoute || '/'}
                      className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-98 transition shadow"
                    >
                      Open in App →
                    </a>
                  )}

                  {isBeta && (
                    <div className="w-full flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(feat.id);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
                      >
                        Inspect Model
                      </button>
                      <a
                        href={feat.actionRoute || '/'}
                        className="flex-1 text-center py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-98 transition"
                      >
                        Try Beta →
                      </a>
                    </div>
                  )}

                  {isComingSoon && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(feat.id);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-zinc-950 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Try Interactive Sandbox</span>
                      <span className="text-zinc-950 font-mono">⚡</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transparent Roadmap Section */}
        <section className="mt-16 pt-10 border-t border-zinc-800/80 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400">
              Honest Engineering Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Release Milestones &amp; Deployment Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Our phased deployment schedule. No simulated dates—we ship when code passes strict production telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Phase 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Phase 1</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  SHIPPED
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Core Tracking &amp; Turnstile Access</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Workout tracker, macro calculator, QR entry passes, and class booking system.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Offline SQLite &amp; Cloud Sync</div>
                <div className="flex items-center gap-2">✓ TOTP Dynamic Passcode Generator</div>
                <div className="flex items-center gap-2">✓ Mifflin-St Jeor TDEE Engine</div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Phase 2</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  PUBLIC BETA
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">AI Biomechanics &amp; Coach Messaging</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Pose estimation camera tracking and direct coach communication channels.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Squat &amp; Deadlift Bar Path AI</div>
                <div className="flex items-center gap-2">✓ 1-on-1 End-to-End Chat</div>
                <div className="flex items-center gap-2 text-amber-400">⚡ Bench press angle calibration</div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-sky-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-sky-500" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400">Phase 3</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                  Q2-Q3 2026
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Wearables &amp; Spatial Sensors</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Apple Watch BLE broadcast, gym crowd telemetry, 3D NeRF mesh, and AI meal planners.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">⏳ Apple HealthKit verification</div>
                <div className="flex items-center gap-2">⏳ Gym Turnstile optical sensors</div>
                <div className="flex items-center gap-2">⏳ WebGPU LiDAR Avatar pipeline</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation (Persistent <768px, >=48px touch targets) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 flex items-stretch justify-around px-2 py-1"
      >
        <a
          href="/"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-400 text-[11px] font-semibold touch-manipulation"
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </a>
        <a
          href="/#workouts"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-400 text-[11px] font-semibold touch-manipulation"
        >
          <span className="text-lg">🏋️</span>
          <span>Workouts</span>
        </a>
        <a
          href="/#classes"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-400 text-[11px] font-semibold touch-manipulation"
        >
          <span className="text-lg">📅</span>
          <span>Book Class</span>
        </a>
        <a
          href="/#pass"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center text-zinc-400 hover:text-emerald-400 text-[11px] font-semibold touch-manipulation"
        >
          <span className="text-lg">📱</span>
          <span>QR Pass</span>
        </a>
        <a
          href="/features"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center text-emerald-400 text-[11px] font-bold touch-manipulation"
        >
          <span className="text-lg">⚡</span>
          <span>More</span>
        </a>
      </nav>

      {/* Feature Preview Modal */}
      <FeaturePreviewModal
        featureId={selectedFeatureId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunch={(route) => {
          window.location.href = route;
        }}
      />
    </div>
  );
};

export default FeaturesPage;
