import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { supabase } from '../lib/supabase';

const EliminatedPage = () => {
  const navigate = useNavigate();
  const { logout, setIsEliminated, setUserLivesForUser, userProfile } = useChallenge();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRevive = async () => {
    setIsEliminated(false);
    const userId = localStorage.getItem('supabaseUserId');
    if (userId) {
      localStorage.removeItem(`isEliminated_${userId}`);
      localStorage.setItem(`isEliminated_${userId}`, 'false');
      try {
        await supabase.from('profiles').update({ lives: 3 }).eq('id', userId);
      } catch (e) {
        console.error('Failed to update DB lives:', e);
      }
    }
    if (userProfile?.username) {
      localStorage.removeItem(`user_eliminated_${userProfile.username}`);
      setUserLivesForUser(userProfile.username, 3);
    }
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 px-6 py-10 text-center animate-in fade-in duration-700">
      <img
        src="/droppy.png"
        alt="Eliminated"
        className="w-56 h-56 object-contain mb-6"
        style={{ imageRendering: '-webkit-optimize-contrast' }}
      />

      <div className="space-y-3 max-w-sm">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">
          Oops… you don’t exist here anymore.
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
          Your lives reached 0 in a challenge round. You can revive your account or view settings.
        </p>
      </div>

      <div className="mt-8 space-y-3 w-full max-w-xs">
        <button
          onClick={handleRevive}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
        >
          Revive Account (Restore 3 Lives)
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
        >
          Go to Settings & Preferences
        </button>

        <button
          onClick={handleLogout}
          className="transition-all active:scale-95 hover:opacity-90 pt-2 block mx-auto"
        >
          <img
            src="/back-to-login.png"
            alt="Exit System"
            className="h-12 w-auto object-contain drop-shadow-md mx-auto"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </button>

        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-1">
          RipIt Banana Nano
        </p>
      </div>
    </div>
  );
};

export default EliminatedPage;
