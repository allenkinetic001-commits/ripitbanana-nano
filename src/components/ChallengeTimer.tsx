import React from 'react';
import { Clock } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';

const ChallengeTimer = () => {
  const { timeLeft, isChallengeEnded, majorityVariant, t } = useChallenge();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (timeLeft === 0 && !isChallengeEnded) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Majority Timer Display */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-[0_0_15px_-5px_rgba(147,51,234,0.4)] ${isChallengeEnded ? 'bg-zinc-100 border-zinc-200' : 'bg-purple-50 border-purple-200 animate-pulse'}`}>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <img src="/duration-alarm.png" alt="" className="h-6 w-auto object-contain" />
            <span className={`text-xs font-mono font-black ${isChallengeEnded ? 'text-zinc-500' : 'text-purple-700'}`}>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeTimer;
