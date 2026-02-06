import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChallengeContextType {
  timeLeft: number;
  isActive: boolean;
  clickCounts: Record<string, number>;
  eliminationCounts: Record<string, number>;
  madeItCounts: Record<string, number>;
  variantDurations: Record<string, number>;
  variantFirstClickTime: Record<string, number>;
  userSelection: string | null;
  isChallengeEnded: boolean;
  kightRankingVotes: Record<string, number>;
  kightFirstRankingVoteTime: Record<string, number>;
  userKightRanking: number;
  hasVotedKightRanking: boolean;
  majorityVariant: string | null;
  majorityRankingRule: string | null;
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setClickCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setEliminationCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setMadeItCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setVariantDurations: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setVariantFirstClickTime: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setUserSelection: (selection: string | null) => void;
  setIsChallengeEnded: (ended: boolean) => void;
  setKightRankingVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setKightFirstRankingVoteTime: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setUserKightRanking: (ranking: number) => void;
  setHasVotedKightRanking: (voted: boolean) => void;
  startNewChallenge: () => void;
  getVariantDisplayName: (key: string | null) => string;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({
    pley: 0,
    vause: 0,
    kight: 0
  });
  const [eliminationCounts, setEliminationCounts] = useState<Record<string, number>>({
    pley: 0,
    vause: 0,
    kight: 0
  });
  const [madeItCounts, setMadeItCounts] = useState<Record<string, number>>({
    pley: 0,
    vause: 0,
    kight: 0
  });
  const [variantDurations, setVariantDurations] = useState<Record<string, number>>({
    pley: 0,
    vause: 0,
    kight: 0
  });
  const [variantFirstClickTime, setVariantFirstClickTime] = useState<Record<string, number>>({
    pley: 0,
    vause: 0,
    kight: 0
  });
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [isChallengeEnded, setIsChallengeEnded] = useState(false);
  const [kightRankingVotes, setKightRankingVotes] = useState<Record<string, number>>({});
  const [kightFirstRankingVoteTime, setKightFirstRankingVoteTime] = useState<Record<string, number>>({});
  const [userKightRanking, setUserKightRanking] = useState<number>(1);
  const [hasVotedKightRanking, setHasVotedKightRanking] = useState(false);

  const getMajorityVariant = () => {
    const counts = Object.entries(clickCounts);
    const maxCount = Math.max(...counts.map(([, count]) => count));
    if (maxCount === 0) return null;
    
    const leaders = counts.filter(([, count]) => count === maxCount);
    if (leaders.length === 1) return leaders[0][0];
    
    return leaders.reduce((prev, curr) => {
      const prevTime = variantFirstClickTime[prev[0]] || Infinity;
      const currTime = variantFirstClickTime[curr[0]] || Infinity;
      return currTime < prevTime ? curr : prev;
    })[0];
  };

  const majorityVariant = getMajorityVariant();

  const getMajorityRankingRule = () => {
    const counts = Object.entries(kightRankingVotes);
    if (counts.length === 0) return null;
    
    const maxCount = Math.max(...counts.map(([, count]) => count));
    if (maxCount === 0) return null;

    const leaders = counts.filter(([, count]) => count === maxCount);
    if (leaders.length === 1) return leaders[0][0];

    return leaders.reduce((prev, curr) => {
      const prevTime = kightFirstRankingVoteTime[prev[0]] || Infinity;
      const currTime = kightFirstRankingVoteTime[curr[0]] || Infinity;
      return currTime < prevTime ? curr : prev;
    })[0];
  };

  const majorityRankingRule = getMajorityRankingRule();

  const getVariantDisplayName = (key: string | null) => {
    if (!key) return '';
    const names: Record<string, string> = {
      pley: 'Pley',
      vause: 'Vause',
      kight: 'Kight'
    };
    return names[key] || key;
  };

  const startNewChallenge = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsChallengeEnded(false);
    setUserSelection(null);
    setClickCounts({ pley: 0, vause: 0, kight: 0 });
    setEliminationCounts({ pley: 0, vause: 0, kight: 0 });
    setMadeItCounts({ pley: 0, vause: 0, kight: 0 });
    setVariantDurations({ pley: 0, vause: 0, kight: 0 });
    setVariantFirstClickTime({ pley: 0, vause: 0, kight: 0 });
    setKightRankingVotes({});
    setKightFirstRankingVoteTime({});
    setUserKightRanking(1);
    setHasVotedKightRanking(false);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsChallengeEnded(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Dynamic round time based on majority
  useEffect(() => {
    if (isActive && majorityVariant) {
      const targetDuration = variantDurations[majorityVariant];
      if (targetDuration > 0 && timeLeft === 0) {
        setTimeLeft(targetDuration);
      }
    }
  }, [majorityVariant, isActive, variantDurations, timeLeft]);

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        const variants = ['pley', 'vause', 'kight'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        const weights = [5, 10, 20, 50, 100];
        const randomClicks = weights[Math.floor(Math.random() * weights.length)];
        
        // 1. Update click counts
        setClickCounts(prev => ({
          ...prev,
          [randomVariant]: prev[randomVariant] + randomClicks
        }));
        
        // 2. Update first click times
        setVariantFirstClickTime(prevTimes => {
          if (!prevTimes[randomVariant]) return { ...prevTimes, [randomVariant]: Date.now() };
          return prevTimes;
        });

        // 3. Update variant durations
        setVariantDurations(prevDurations => {
          if (!prevDurations[randomVariant]) {
            const possibleDurations = [60, 300, 3600, 7200, 14400, 18000];
            const simulatedDuration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)];
            return { ...prevDurations, [randomVariant]: simulatedDuration };
          }
          return prevDurations;
        });

        // 4. Update elimination counts
        if (Math.random() > 0.7) {
          setEliminationCounts(prev => ({
            ...prev,
            [randomVariant]: prev[randomVariant] + Math.floor(Math.random() * 3) + 1
          }));
        }

        // 5. Update Kight ranking votes if applicable
        if (majorityVariant === 'kight') {
          const randomRankingValue = Math.floor(Math.random() * 20) + 1;
          const ruleKey = `Top ${randomRankingValue}`;
          const randomRankingClicks = Math.floor(Math.random() * 20) + 1;

          setKightRankingVotes(prev => ({
            ...prev,
            [ruleKey]: (prev[ruleKey] || 0) + randomRankingClicks
          }));

          setKightFirstRankingVoteTime(prev => {
            if (!prev[ruleKey]) return { ...prev, [ruleKey]: Date.now() };
            return prev;
          });
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, majorityVariant]);

  return (
    <ChallengeContext.Provider value={{
      timeLeft, isActive, clickCounts, eliminationCounts, madeItCounts,
      variantDurations, variantFirstClickTime, userSelection, isChallengeEnded,
      kightRankingVotes, kightFirstRankingVoteTime, userKightRanking,
      hasVotedKightRanking, majorityVariant, majorityRankingRule,
      setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
      setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
      setUserSelection, setIsChallengeEnded, setKightRankingVotes,
      setKightFirstRankingVoteTime, setUserKightRanking, setHasVotedKightRanking,
      startNewChallenge, getVariantDisplayName
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
