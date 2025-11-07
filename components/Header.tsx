import React from 'react';
import { SavvyShopperLogo, MenuIcon } from './common/icons';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const userName = localStorage.getItem('userName');
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm z-20">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-3">
           <button 
            onClick={onMenuClick} 
            className="p-1 rounded-full text-gray-500 hover:text-primary-600 focus:outline-none -ml-2 mr-2"
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <SavvyShopperLogo className="h-8 w-8 text-primary-600 hidden sm:block" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            On My List AI
          </h1>
        </div>
        <div className="flex items-center gap-4">
            {userName && (
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium">
                    Welcome, {userName}!
                </span>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;