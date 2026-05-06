import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-48 h-48'
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-7xl'
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`${dimensions} relative flex items-center justify-center`}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Stars/Sparkles */}
          <circle cx="46" cy="19" r="2" fill="#E53E3E" /> {/* red */}
          <circle cx="51" cy="18" r="3" fill="#ED8936" /> {/* orange */}
          <circle cx="58" cy="20" r="2" fill="#4299E1" /> {/* blue */}
          <circle cx="43" cy="23" r="2.5" fill="#4299E1" />
          <circle cx="62" cy="24" r="2" fill="#4299E1" />
          <circle cx="38" cy="28" r="2" fill="#48BB78" /> {/* green */}
          <circle cx="59" cy="28" r="2.5" fill="#E53E3E" />
          <circle cx="61" cy="31" r="2" fill="#ED8936" />
          
          {/* Person silhouette Rising */}
          <circle cx="49" cy="29" r="6" fill="#0056b3" />
          <path d="M49 35C45 45 40 45 38 42M49 35C53 45 58 45 60 42" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" />
          <path d="M49 35L49 55" stroke="#0056b3" strokeWidth="8" strokeLinecap="round" />

          {/* Open Book Pages */}
          {/* Left Pages (Orange/Red) */}
          <path d="M50 55C40 50 15 55 10 75C20 85 45 80 50 85" fill="#F07D00" />
          <path d="M50 55C40 52 20 58 15 70C25 80 45 78 50 85" fill="#E53E3E" />
          <path d="M50 55C40 54 25 60 20 65C30 75 45 76 50 85" fill="#FF8C00" />
          
          {/* Right Pages (Blue) */}
          <path d="M50 55C60 50 85 55 90 75C80 85 55 80 50 85" fill="#0077C8" />
          <path d="M50 55C60 52 80 58 85 70C75 80 55 78 50 85" fill="#00A3CC" />
          <path d="M50 55C60 54 75 60 80 65C70 75 55 76 50 85" fill="#00BFFF" />
          
          {/* Center Spine */}
          <path d="M50 55V85" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      {showText && (
        <div className={`${textSizes} font-black tracking-tighter flex items-center`}>
          <span className="text-[#0056b3]">EDU</span>
          <span className="text-[#F07D00] italic">Xcel</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
