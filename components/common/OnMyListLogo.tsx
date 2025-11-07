import React from 'react';

export const OnMyListLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        .list-font { font-family: 'Pacifico', cursive; }
      `}
    </style>

    <defs>
        <linearGradient id="onMyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="96" fill="#FDF6EC" stroke="black" strokeWidth="4" />
    
    <text 
      x="100" 
      y="70" 
      fontFamily="Arial, sans-serif" 
      fontSize="30" 
      fontWeight="bold" 
      fill="url(#onMyGradient)"
      style={{ fontStyle: 'italic' }}
      textAnchor="middle"
    >
      On my
    </text>
    
    <text 
      x="100" 
      y="120" 
      className="list-font"
      fontSize="55" 
      fontWeight="normal"
      fill="#059669"
      textAnchor="middle"
    >
      List
    </text>

    <text 
      x="100" 
      y="145" 
      fontFamily="Arial, sans-serif" 
      fontSize="16" 
      fill="#374151"
      textAnchor="middle"
    >
      Savvy AI
    </text>
  </svg>
);