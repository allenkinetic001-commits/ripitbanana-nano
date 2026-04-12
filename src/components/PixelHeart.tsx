import React from 'react';

interface PixelHeartProps {
  className?: string;
  empty?: boolean;
}

export const PixelHeart = ({ className = "w-4 h-4", empty = false }: PixelHeartProps) => {
  return (
    <img 
      src="/pixel-heart.png" 
      alt="Heart" 
      className={`${className} object-contain`}
      style={{ 
        imageRendering: 'pixelated',
        filter: empty ? 'grayscale(1) opacity(0.3)' : 'none'
      }} 
    />
  );
};
