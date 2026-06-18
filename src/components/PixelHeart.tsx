import React from 'react';

interface PixelHeartProps {
  className?: string;
  empty?: boolean;
}

export const PixelHeart = ({ className = "w-4 h-4", empty = false }: PixelHeartProps) => {
  return (
    <img 
      src="/joker.png" 
      alt="Life Status" 
      className={className}
      style={{ 
        opacity: empty ? 0.25 : 1,
        filter: empty ? 'grayscale(100%) opacity(0.3)' : 'none',
        objectFit: 'contain'
      }}
    />
  );
};
