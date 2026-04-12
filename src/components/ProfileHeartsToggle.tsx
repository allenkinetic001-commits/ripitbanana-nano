import React from 'react';
import { PixelHeart } from './PixelHeart';
import { cn } from '../utils';

interface ProfileHeartsToggleProps {
  isVisible: boolean;
  lives?: number;
  heartClassName?: string;
  className?: string;
}

export const ProfileHeartsToggle = ({ 
  isVisible, 
  lives = 3, 
  heartClassName = "w-7 h-7", 
  className 
}: ProfileHeartsToggleProps) => {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <div className={cn("transition-opacity duration-75", isVisible ? "opacity-100" : "opacity-0")}>
        <PixelHeart empty={lives < 1} className={heartClassName} />
      </div>
      <div className={cn("transition-opacity duration-75", isVisible ? "opacity-100" : "opacity-0")}>
        <PixelHeart empty={lives < 2} className={heartClassName} />
      </div>
      <div className={cn("transition-opacity duration-75", isVisible ? "opacity-100" : "opacity-0")}>
        <PixelHeart empty={lives < 3} className={heartClassName} />
      </div>
    </div>
  );
};
