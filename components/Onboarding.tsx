import React, { useState, useEffect } from 'react';
import Spinner from './common/Spinner';
import { useLocalization } from '../context/localization';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { t } = useLocalization();

  const [dietaryNeeds, setDietaryNeeds] = useState<Record<string, string>>({});
  const [peopleForDiet, setPeopleForDiet] = useState<string[]>([]);

  useEffect(() => {
    if (step === 4) {
        const name = localStorage.getItem('userName') || 'You';
        const familyData = localStorage.getItem('familyMembers');
        const family = familyData ? familyData.split(',').map(m => m.trim()).filter(Boolean) : [];
        const allPeople = [name, ...family];
        setPeopleForDiet(allPeople);

        const initialNeeds: Record<string, string> = {};
        allPeople.forEach(p => {
            initialNeeds[p] = '';
        });
        setDietaryNeeds(initialNeeds);
    }
  }, [step]);


  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };

  const handleLocationSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
    setIsLocating(false);
    handleNextStep();
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    setLocationError(t('locationError', { message: error.message }));
    setIsLocating(false);
  };

  const requestLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
  };

  const handleManualLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const zip = formData.get('zip') as string;
    if (zip && zip.trim()) {
        localStorage.setItem('userLocation', JSON.stringify({ zip: zip.trim() }));
        handleNextStep();
    } else {
        setLocationError(t('zipError'));
    }
  };

  const handleProfileInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const family = formData.get('family') as string;

    if (name !== null) localStorage.setItem('userName', name);
    if (family !== null) localStorage.setItem('familyMembers', family);

    handleNextStep();
  };

  const handleDietarySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('familyDietaryRestrictions', JSON.stringify(dietaryNeeds));
    localStorage.removeItem('dietaryRestrictions'); // Clean up old key
    handleNextStep();
  };


  const finishOnboarding = () => {
    onComplete();
  };

  const renderStep = () => {
    const BackButton = () => (
        <button type="button" onClick={handleBackStep} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
    );

    switch (step) {
      case 1:
        return (
          <div>
            <div className="flex items-center mb-2">
                <div className="w-8"></div>
                <h2 className="flex-grow text-2xl font-bold text-gray-900 dark:text-white text-center">{t('findLocalDeals')}</h2>
                <div className="w-8"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('locationPermission')}</p>
            {isLocating ? <div className='mb-4'><Spinner /></div> : (
              <button onClick={requestLocation} disabled={isLocating} className="w-full p-4 mb-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:bg-primary-300">
                {t('useMyLocation')}
              </button>
            )}
            <p className="text-center my-2 text-sm text-gray-500">{t('or')}</p>
            <form onSubmit={handleManualLocationSubmit}>
              <input name="zip" type="text" placeholder={t('enterZip')} className="w-full p-3 mb-4 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button type="submit" className="w-full p-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('continue')}</button>
            </form>
            {locationError && <p className="mt-4 text-sm text-red-500 text-center">{locationError}</p>}
          </div>
        );
      case 2:
        return (
            <form onSubmit={handleProfileInfoSubmit}>
                <div className="flex items-center mb-2">
                    <div className="w-8"><BackButton /></div>
                    <h2 className="flex-grow text-2xl font-bold text-gray-900 dark:text-white text-center">{t('personalize')}</h2>
                    <div className="w-8"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('getStarted')}</p>
                <div className="space-y-4 text-left">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('yourName')}</label>
                        <input id="name" name="name" type="text" defaultValue={localStorage.getItem('userName') || ''} placeholder={t('namePlaceholder')} required className="w-full p-3 mt-1 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>
                 <button type="submit" className="w-full mt-6 p-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">{t('continue')}</button>
            </form>
        );
      case 3:
         return (
            <form onSubmit={handleProfileInfoSubmit}>
                <div className="flex items-center mb-2">
                    <div className="w-8"><BackButton /></div>
                    <h2 className="flex-grow text-2xl font-bold text-gray-900 dark:text-white text-center">{t('familyMembers')}</h2>
                    <div className="w-8"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('familyHelp')}</p>
                 <div className="space-y-4 text-left">
                    <div>
                        <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whoIsInHousehold')}</label>
                        <input id="family" name="family" type="text" defaultValue={localStorage.getItem('familyMembers') || ''} placeholder={t('familyPlaceholder')} className="w-full p-3 mt-1 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('commaSeparated')}</p>
                    </div>
                </div>
                 <button type="submit" className="w-full mt-6 p-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">{t('continue')}</button>
            </form>
        );
    case 4:
        return (
            <form onSubmit={handleDietarySubmit}>
                 <div className="flex items-center mb-2">
                    <div className="w-8"><BackButton /></div>
                    <h2 className="flex-grow text-2xl font-bold text-gray-900 dark:text-white text-center">{t('dietaryNeeds')}</h2>
                    <div className="w-8"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('dietaryHelp')}</p>
                <div className="space-y-4 text-left max-h-60 overflow-y-auto pr-2">
                    {peopleForDiet.map((person) => (
                        <div key={person}>
                            <label htmlFor={`diet-${person}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('dietaryNeedsFor', { name: person })}
                            </label>
                            <input 
                                id={`diet-${person}`}
                                name={`diet-${person}`}
                                type="text"
                                value={dietaryNeeds[person] || ''}
                                onChange={(e) => setDietaryNeeds(prev => ({ ...prev, [person]: e.target.value }))}
                                placeholder={t('dietaryPlaceholder')} 
                                className="w-full p-3 mt-1 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    ))}
                </div>
                <button type="submit" className="w-full mt-6 p-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">{t('continue')}</button>
            </form>
        );
      case 5:
        return (
          <div>
            <div className="flex items-center mb-2">
                <div className="w-8"><BackButton /></div>
                <h2 className="flex-grow text-2xl font-bold text-gray-900 dark:text-white text-center">{t('allSet')}</h2>
                <div className="w-8"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('readyToSave')}</p>
            <button onClick={finishOnboarding} className="w-full p-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              {t('startSaving')}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 transition-all duration-300">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;