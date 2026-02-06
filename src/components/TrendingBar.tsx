import React from 'react';
import { Flame, X } from 'lucide-react';

const TrendingBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-100">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
        <span className="text-purple-600 font-medium text-sm">Trending</span>
      </div>
      <X className="w-3 h-3 text-zinc-300" />
    </div>
  );
};

export default TrendingBar;
