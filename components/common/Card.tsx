import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;