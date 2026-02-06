import React from 'react';
import { Cat, Triangle, Search } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
      <div className="flex items-center gap-1">
        <div className="w-9 h-9 flex items-center justify-center -ml-1">
          <img 
            src="https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=illustrated+cartoon+fairy+head+icon+green+hair+pink+skin+sticker+style+simple&image_size=square" 
            alt="Fairy Icon" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-[22px] font-black text-black tracking-tighter">Fairy</span>
        <div className="ml-1 w-7 h-7 transform rotate-12">
          <img 
            src="https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=illustrated+milk+carton+drink+box+with+straw+sticker+style+simple+black+outline&image_size=square" 
            alt="Milk" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-black">
        <div className="w-6 h-6 border-[2.5px] border-black rounded-full" />
        <Cat className="w-7 h-7 stroke-[2] fill-black" />
        <Triangle className="w-6 h-6 stroke-[2] fill-zinc-400 text-zinc-400 rotate-180" />
        <Search className="w-6 h-6 stroke-[2.5]" />
      </div>
    </div>
  );
};

export default TopBar;
