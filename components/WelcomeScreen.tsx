import React from 'react';
import { useLocalization } from '../context/localization';

interface WelcomeScreenProps {
  onLanguageSelect: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLanguageSelect }) => {
  const { setLanguage, t } = useLocalization();

  const handleSelect = (lang: 'en' | 'es' | 'fr' | 'de') => {
    setLanguage(lang);
    onLanguageSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-[#FDF6EC] p-4 font-sans text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('selectLanguage')}</h1>
      <p className="text-gray-600 mb-6">Please select your language to get started.</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button onClick={() => handleSelect('en')} className="p-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">{t('english')}</button>
        <button onClick={() => handleSelect('es')} className="p-4 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition-colors">{t('spanish')}</button>
        <button onClick={() => handleSelect('fr')} className="p-4 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition-colors">{t('french')}</button>
        <button onClick={() => handleSelect('de')} className="p-4 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300 transition-colors">{t('german')}</button>
      </div>
    </div>
  );
};

export default WelcomeScreen;