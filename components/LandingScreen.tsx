import React from 'react';
import { OnMyListLogo } from './common/OnMyListLogo';

interface LandingScreenProps {
  onProceed: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onProceed }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-center items-center p-4 font-sans text-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex flex-col items-center">
        <OnMyListLogo className="w-72 h-72 sm:w-80 sm:h-80 mb-8" aria-label="On My List AI Logo" />
        <button
          onClick={onProceed}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-violet-500 text-white font-semibold rounded-full shadow-lg hover:from-orange-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform hover:scale-105"
        >
          Get Started
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;