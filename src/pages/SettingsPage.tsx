import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';


const EliminatedPage = () => {
  const navigate = useNavigate();
  const { logout } = useChallenge();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 px-6 text-center animate-in fade-in duration-700">
      <img 
        src="/droppy.png" 
        alt="Eliminated" 
        className="w-64 h-64 object-contain mb-8" 
        style={{ imageRendering: '-webkit-optimize-contrast' }} 
      />
      
      <div className="space-y-4 max-w-sm">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">
          Oops. you don't exist here anymore.
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Your profile, your posts, and your interactions have been wiped from the system. You have been eliminated.
        </p>
      </div>

      <div className="mt-12 space-y-3">
        <button 
          onClick={handleLogout}
          className="transition-all active:scale-95 hover:opacity-90"
        >
          <img 
            src="/back-to-login.png" 
            alt="Exit System" 
            className="h-14 w-auto object-contain drop-shadow-md" 
            style={{ imageRendering: '-webkit-optimize-contrast' }} 
          />
        </button>
        
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-4">
          Existence Terminated
        </p>
      </div>
    </div>
  );
};

export default EliminatedPage;
