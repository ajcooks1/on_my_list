import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import WelcomeScreen from './components/WelcomeScreen';
import LandingScreen from './components/LandingScreen';
import { AppTab } from './types';

const App: React.FC = () => {
  const [hasSeenLanding, setHasSeenLanding] = useState(!!localStorage.getItem('hasSeenLanding'));
  const [languageSelected, setLanguageSelected] = useState(!!localStorage.getItem('userLanguage'));
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Deals);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboardingComplete') === 'true';
    setHasOnboarded(completed);

    const plan = localStorage.getItem('activeSubscriptionPlan');
    if (plan) {
        setIsSubscribed(true);
        setActivePlan(plan);
    }
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProceedFromLanding = () => {
    localStorage.setItem('hasSeenLanding', 'true');
    setHasSeenLanding(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setHasOnboarded(true);
  };
  
  const handleSubscribe = (planName: string) => {
    localStorage.setItem('activeSubscriptionPlan', planName);
    setIsSubscribed(true);
    setActivePlan(planName);
    setActiveTab(AppTab.Health);
  };

  const handleLogout = () => {
    // Clear all local storage to reset the app state
    localStorage.clear();
    
    // Reset React state to initial values
    setHasSeenLanding(false);
    setLanguageSelected(false);
    setHasOnboarded(false);
    setIsSubscribed(false);
    setActivePlan(null);
    setActiveTab(AppTab.Deals); // Reset to default tab
  };

  if (!hasSeenLanding) {
    return <LandingScreen onProceed={handleProceedFromLanding} />;
  }

  if (!languageSelected) {
    return <WelcomeScreen onLanguageSelect={() => setLanguageSelected(true)} />;
  }

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const mainAppStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div style={mainAppStyle}>
      <div className="flex h-screen font-sans">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setIsSidebarOpen(prev => !prev)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100/70 dark:bg-gray-900/70 backdrop-blur-xl relative">
            <Dashboard
              activeTab={activeTab}
              isSubscribed={isSubscribed}
              setActiveTab={setActiveTab}
              activePlan={activePlan}
              onSubscribe={handleSubscribe}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;