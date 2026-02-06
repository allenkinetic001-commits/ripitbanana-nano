import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { useChallenge } from '../contexts/ChallengeContext';
import { Skull, Plus } from 'lucide-react';

const Layout = () => {
  const { isChallengeEnded, majorityVariant, getVariantDisplayName, startNewChallenge } = useChallenge();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <main className="flex-1 pb-16">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm flex flex-col">
          {isChallengeEnded ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-rose-100/50">
                <Skull size={48} className="text-rose-600 fill-rose-600" />
              </div>
              <h2 className="text-4xl font-black font-serif text-zinc-900 mb-2 tracking-tighter uppercase italic">The End</h2>
              <p className="text-zinc-500 text-sm font-medium mb-8 max-w-[280px] leading-relaxed">
                The round has finished. All data for this challenge has been processed.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Majority Variant</span>
                  <span className="text-lg font-black text-zinc-900 uppercase tracking-tight">{getVariantDisplayName(majorityVariant) || 'None'}</span>
                </div>
                <button 
                  onClick={startNewChallenge}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Start New Challenge</span>
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Layout;
