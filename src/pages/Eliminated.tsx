import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { ShieldAlert, LogOut, Ghost } from 'lucide-react';

const EliminatedPage = () => {
  const navigate = useNavigate();
  const { logout } = useChallenge();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 px-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-bounce">
        <Ghost size={48} className="text-rose-600" />
      </div>
      
      <div className="space-y-4 max-w-sm">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">
          Oops… you don’t exist here anymore.
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Your profile, your posts, and your interactions have been wiped from the system. You have been eliminated.
        </p>
      </div>

      <div className="mt-12 w-full max-w-[240px] space-y-3">
        <button 
          onClick={handleLogout}
          className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
        >
          <LogOut size={20} />
          <span>Exit System</span>
        </button>
        
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-4">
          Existence Terminated
        </p>
      </div>
    </div>
  );
};

export default EliminatedPage;
