import React from 'react';
import { Home, ThumbsUp, MessageCircle, Dog, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-8 py-3 flex items-center justify-between pb-8 z-40 rounded-t-[20px] shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <div className="p-2 rounded-xl">
        <Home className="w-[26px] h-[26px] text-black fill-black" />
      </div>
      <div className="p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
        <ThumbsUp className="w-[26px] h-[26px] text-black stroke-[1.8]" />
      </div>
      <div className="p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer relative">
        <MessageCircle className="w-[26px] h-[26px] text-black stroke-[1.8]" />
        <div className="absolute top-2.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
        <Dog className="w-[26px] h-[26px] text-black stroke-[1.8]" />
      </div>
      <div className="p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
        <div className="w-[26px] h-[26px] rounded-full border-[1.8px] border-zinc-300 flex items-center justify-center">
           <User className="w-4 h-4 text-zinc-300 fill-zinc-300" />
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
