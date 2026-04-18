import React from 'react';
import { cn } from '../utils';

interface EmptyFeedProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

const EmptyFeed: React.FC<EmptyFeedProps> = ({ 
  title = "It's Quiet Here", 
  subtitle = "No posts have been made yet", 
  icon = "/ice-bear.png",
  actionButton,
  className
}) => {
  return (
    <div className={cn(
      "flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700 min-h-[40vh]",
      className
    )}>
      <div className="relative mb-6 mt-12">
        <img 
          src={icon} 
          alt="Empty" 
          className="w-48 h-auto object-contain mx-auto" 
        />
      </div>
      <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase mb-12">
        {title}
      </h2>
      <p className="text-zinc-400 text-[10px] font-bold tracking-[0.3em] uppercase max-w-[200px] leading-relaxed mx-auto">
        {subtitle}
      </p>
      {actionButton && (
        <div className="mt-8">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyFeed;
