import React, { useState, useEffect } from 'react';
import { api, StateData, MealItem, WorkoutSet, UserProfile } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PartnerMarquee } from '@/components/landing/PartnerMarquee';
import { InspireSection } from '@/components/landing/InspireSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BentoShowcase } from '@/components/landing/BentoShowcase';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Footer } from '@/components/landing/Footer';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// 17 Views
import { TodayView } from '@/views/TodayView';
import { FoodLogView } from '@/views/FoodLogView';
import { ExerciseLibraryView } from '@/views/ExerciseLibraryView';
import { WorkoutTrackerView } from '@/views/WorkoutTrackerView';
import { StartingLoadView } from '@/views/StartingLoadView';
import { AICoachView } from '@/views/AICoachView';
import { FacilityView } from '@/views/FacilityView';
import { ProfileView } from '@/views/ProfileView';
import { PostureView } from '@/views/PostureView';
import { BodyAnalysisView } from '@/views/BodyAnalysisView';
import { CardioLogView } from '@/views/CardioLogView';
import { WearablesView } from '@/views/WearablesView';
import { MealPrepView } from '@/views/MealPrepView';
import { MyFoodsView } from '@/views/MyFoodsView';
import { ChallengesView } from '@/views/ChallengesView';
import { AppearanceView } from '@/views/AppearanceView';
import { AdminConsoleView } from '@/views/AdminConsoleView';

// Modals & Feedback
import { AuthModal } from '@/components/ui/AuthModal';
import { BetaGateModal } from '@/components/ui/BetaGateModal';
import { QRPassModal } from '@/components/ui/QRPassModal';
import { Toast, OfflineBanner } from '@/components/ui/Feedback';

export const App: React.FC = () => {
  // Theme state with localStorage persistence & system preference
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('fitfuel_theme');
      if (stored === 'dark' || stored === 'light') return stored;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch (e) {}
    return 'dark';
  });

  // Active route: 'landing' or dashboard view id ('today', 'food-log', etc.)
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [state, setState] = useState<StateData>(api.getState());
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [betaGate, setBetaGate] = useState<{ open: boolean; title: string; id: string }>({
    open: false,
    title: '',
    id: '',
  });

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' | 'info'; id: number } | null>(null);

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToast(t => (t && t.msg === msg ? null : t));
    }, 4000);
  };

  // Sync theme attribute on document root
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('fitfuel_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Subscribe to API sync dot
  useEffect(() => {
    const unsub = api.onSyncStatus(synced => setIsSynced(synced));
    const handleOnline = () => {
      setIsOnline(true);
      const flushed = api.flushOfflineQueue();
      if (flushed) showToast('Offline data synced successfully', 'success');
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hash-based routing listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === 'landing') {
        setCurrentRoute('landing');
      } else if (hash.startsWith('view-')) {
        setCurrentRoute(hash.replace('view-', ''));
      } else {
        setCurrentRoute(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (viewId: string) => {
    if (viewId === 'landing') {
      window.location.hash = '';
      setCurrentRoute('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `view-${viewId}`;
      setCurrentRoute(viewId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleInstantDemo = async () => {
    await api.loginDemoLifter();
    setState(api.getState());
    showToast('Welcome to FitFuel, Jordan Davis!', 'success');
    navigateTo('today');
  };

  const handleAuthSuccess = (userName: string) => {
    setState(api.getState());
    showToast(`Welcome to FitFuel, ${userName}!`, 'success');
    navigateTo('today');
  };

  const handleLogout = async () => {
    await api.logout();
    showToast('Signed out of session', 'info');
    navigateTo('landing');
  };

  // State mutators with auto-save
  const handleAddWater = (ml: number) => {
    api.addWater(ml);
    setState({ ...api.getState() });
    showToast(`Logged +${ml}ml hydration!`, 'info');
  };

  const handleAddMealItem = (slotKey: any, item: Omit<MealItem, 'id'>) => {
    api.addMealItem(slotKey, item);
    setState({ ...api.getState() });
    showToast(`Logged "${item.name}" to ${slotKey}!`, 'success');
  };

  const handleRemoveMealItem = (slotKey: any, itemId: string) => {
    api.removeMealItem(slotKey, itemId);
    setState({ ...api.getState() });
    showToast('Removed meal item', 'info');
  };

  const handleLogSet = (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => {
    const res = api.logWorkoutSet(exerciseId, set);
    setState({ ...api.getState() });
    return res;
  };

  const handleToggleSetComplete = (exerciseId: string, setId: string) => {
    const res = api.toggleSetComplete(exerciseId, setId);
    setState({ ...api.getState() });
    return res;
  };

  const handleFinishWorkout = () => {
    api.finishWorkout();
    setState({ ...api.getState() });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    api.updateProfile(updates);
    setState({ ...api.getState() });
  };

  const handleResetAllData = () => {
    api.resetAllData();
    setState(api.getState());
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-on-accent transition-colors duration-normal">
      {/* Offline Alert Banner */}
      <OfflineBanner isOffline={!isOnline} />

      {/* Route Switcher */}
      {currentRoute === 'landing' ? (
        <div className="flex flex-col min-h-screen">
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenAuth={() => setIsAuthOpen(true)}
            onInstantDemo={handleInstantDemo}
            onNavigateDashboard={() => navigateTo('today')}
          />
          <main className="flex-1">
            <HeroSection
              theme={theme}
              onStart={() => setIsAuthOpen(true)}
              onWatchDemo={handleInstantDemo}
            />
            <PartnerMarquee />
            <InspireSection />
            <FeaturesSection onExplore={() => navigateTo('exercise-library')} />
            <BentoShowcase onOpenView={navigateTo} />
            <CoursesSection onEnroll={title => showToast(`Enrolled in curriculum: ${title}`, 'success')} />
            <PricingSection onSelectTier={tier => setIsAuthOpen(true)} />
            <TestimonialsSection />
          </main>
          <Footer
            onStart={() => setIsAuthOpen(true)}
            onInstantDemo={handleInstantDemo}
          />
        </div>
      ) : (
        /* Member Dashboard SPA */
        <DashboardShell
          currentView={currentRoute}
          onSelectView={navigateTo}
          userName={state.profile.name}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          isSynced={isSynced}
          isOnline={isOnline}
        >
          {currentRoute === 'today' && (
            <TodayView
              state={state}
              onAddWater={handleAddWater}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'food-log' && (
            <FoodLogView
              state={state}
              onAddMealItem={handleAddMealItem}
              onRemoveMealItem={handleRemoveMealItem}
            />
          )}

          {currentRoute === 'exercise-library' && (
            <ExerciseLibraryView
              onAddToWorkout={ex => {
                showToast(`Added ${ex.name} to active session.`, 'success');
                navigateTo('tracking');
              }}
            />
          )}

          {currentRoute === 'tracking' && (
            <WorkoutTrackerView
              state={state}
              onLogSet={handleLogSet}
              onToggleSetComplete={handleToggleSetComplete}
              onFinishWorkout={handleFinishWorkout}
              showToast={showToast}
            />
          )}

          {currentRoute === 'starting-load' && (
            <StartingLoadView
              onApplyToWorkout={(lift, weight) => {
                showToast(`Applied ${weight}kg ${lift} to workout planner.`, 'success');
                navigateTo('tracking');
              }}
            />
          )}

          {currentRoute === 'ai-coach' && <AICoachView />}

          {currentRoute === 'facility' && (
            <FacilityView onOpenQRModal={() => setIsQRModalOpen(true)} />
          )}

          {currentRoute === 'profile' && (
            <ProfileView
              state={state}
              onUpdateProfile={handleUpdateProfile}
              onResetAllData={handleResetAllData}
              showToast={showToast}
            />
          )}

          {currentRoute === 'posture' && <PostureView />}

          {currentRoute === 'body-analysis' && <BodyAnalysisView />}

          {currentRoute === 'cardio-log' && <CardioLogView />}

          {currentRoute === 'wearables' && <WearablesView showToast={showToast} />}

          {currentRoute === 'meal-prep' && <MealPrepView />}

          {currentRoute === 'my-foods' && <MyFoodsView showToast={showToast} />}

          {currentRoute === 'challenges' && <ChallengesView />}

          {currentRoute === 'appearance' && (
            <AppearanceView
              theme={theme}
              onToggleTheme={toggleTheme}
              showToast={showToast}
            />
          )}

          {currentRoute === 'admin' && <AdminConsoleView />}
        </DashboardShell>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <QRPassModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        memberName={state.profile.name}
        memberTier="Pro Lifter VIP"
      />

      <BetaGateModal
        isOpen={betaGate.open}
        featureTitle={betaGate.title}
        featureId={betaGate.id}
        onClose={() => setBetaGate({ open: false, title: '', id: '' })}
        onUnlocked={() => {
          showToast(`Beta access unlocked for ${betaGate.title}`, 'success');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
