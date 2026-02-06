import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { Camera, Search, Info, Sparkles, Users, Skull, Plus, Flame, Clock } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import ChallengeTimer from '../components/ChallengeTimer';

const posts = [
  {
    id: 1,
    username: 'travel_adventures',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+traveler+with+a+mountain+background&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful+sunset+over+a+tropical+beach+with+palm+trees&image_size=square',
    caption: 'Chasing sunsets in paradise! 🌅🌴 #travel #vacation',
    likes: 1240,
    time: '2 hours ago'
  },
  {
    id: 2,
    username: 'foodie_delights',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+person+eating+delicious+food&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up+of+a+gourmet+burger+with+melted+cheese+and+crispy+fries&image_size=square',
    caption: 'The best burger in town! 🍔🔥 #foodie #burger',
    likes: 850,
    time: '5 hours ago'
  },
  {
    id: 3,
    username: 'tech_wizard',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+software+engineer+at+their+desk&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square',
    caption: 'New office setup is finally complete! 💻🚀 #coding #setup',
    likes: 2100,
    time: '10 hours ago'
  }
];

const Home = () => {
  const {
    timeLeft, clickCounts, eliminationCounts, madeItCounts,
    userSelection, isChallengeEnded,
    kightRankingVotes, userKightRanking, hasVotedKightRanking,
    majorityVariant, majorityRankingRule,
    setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
    setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
    setUserSelection, setKightRankingVotes,
    setKightFirstRankingVoteTime, setUserKightRanking, setHasVotedKightRanking,
    startNewChallenge, getVariantDisplayName
  } = useChallenge();

  const [visiblePosts, setVisiblePosts] = useState(posts);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showPills, setShowPills] = useState(true);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [showInfo, setShowPillsInfo] = useState(false);

  // Add custom animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
        100% { transform: translateY(0px); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-5px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleTabClick = (tab: string) => {
    if (timeLeft > 0) {
      if (userSelection) return; // Locked
      
      // Immediate submission for active challenge
      setClickCounts(prev => ({
        ...prev,
        [tab]: prev[tab] + 1
      }));

      if (tab === 'kight' && userKightRanking) {
        const ruleKey = `Top ${userKightRanking}`;
        setKightRankingVotes(prev => ({
          ...prev,
          [ruleKey]: (prev[ruleKey] || 0) + 1
        }));
        setKightFirstRankingVoteTime(prev => {
          if (!prev[ruleKey]) return { ...prev, [ruleKey]: Date.now() };
          return prev;
        });
        setHasVotedKightRanking(true);
      }

      setVariantFirstClickTime(prev => {
        if (!prev[tab]) return { ...prev, [tab]: Date.now() };
        return prev;
      });
      
      setVariantDurations(prev => {
        if (!prev[tab]) return { ...prev, [tab]: timeLeft };
        return prev;
      });

      setUserSelection(tab);
    } else {
      setActiveTab(activeTab === tab ? null : tab);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const adjustTime = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') {
      setHours(Math.max(0, Math.min(23, hours + delta)));
    } else {
      setMinutes(Math.max(0, Math.min(59, minutes + delta)));
    }
  };

  const handleDeletePost = (postId: number) => {
    setVisiblePosts(prev => prev.filter(post => post.id !== postId));
    
    // Track eliminations for the current active mode
    const activeMode = userSelection || majorityVariant;
    if (activeMode && Object.prototype.hasOwnProperty.call(eliminationCounts, activeMode)) {
      setEliminationCounts(prev => ({
        ...prev,
        [activeMode]: prev[activeMode] + 1
      }));
    }
  };

  const handlePassPost = (postId: number) => {
    setVisiblePosts(prev => prev.filter(post => post.id !== postId));
    
    // Track "made it" for the current active mode
    const activeMode = userSelection || majorityVariant;
    if (activeMode && Object.prototype.hasOwnProperty.call(madeItCounts, activeMode)) {
      setMadeItCounts(prev => ({
        ...prev,
        [activeMode]: prev[activeMode] + 1
      }));
    }
  };

  return (
    <div className="flex flex-col relative min-h-screen">
      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={() => setShowPillsInfo(false)}
          />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Info size={18} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-black font-serif text-zinc-900">Pley Rules</h2>
              </div>
              <button 
                onClick={() => setShowPillsInfo(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              {/* Pley */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-full">Pley</span>
                  <div className="flex items-center gap-1.5">
                    <Flame size={12} className="text-orange-600 fill-orange-600" />
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter">— Fate Worse Than Death</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  A feature game mode where users can only vote down, and a single down permanently destroys a player’s account for that round.
                </p>
              </div>

              {/* Vause */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-full">Vause</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  A feature mode where users are judged by up or down votes. An upvote allows the user to pass and retain their profile, followers, and data. A downvote results in the complete deletion of the user’s profile, posts, and followers, forcing the user to start over from scratch.
                </p>
              </div>

              {/* Kight */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-full">Kight</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  A high-stakes game mode where users can only receive downvotes. Before the round begins, players select the ranking rule they want—Top 1, Top 5, Top 10, or Top 20. The final rule is determined by majority vote, with the first player’s choice acting as a temporary default until the majority is established. At the end of the round, any player who fails to make it into the selected top ranking has their profile, followers, and posts reset to zero, while their account remains intact.
                </p>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
              <button 
                onClick={() => setShowPillsInfo(false)}
                className="w-full py-3 bg-zinc-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 flex flex-col">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="w-10" /> {/* Spacer to keep title centered */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif">SocialApp</h1>
          </div>
          <div className="flex items-center gap-4">
            <ChallengeTimer />
            {!isChallengeEnded && (
              <button 
                onClick={() => setShowPills(!showPills)}
                className="flex items-center justify-center w-6 h-6 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-all active:scale-90 shadow-sm"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            )}
            <button className="text-zinc-700">
              <Camera size={24} />
            </button>
            <button 
              className="text-zinc-700 hover:text-purple-600 transition-colors"
              onClick={() => setShowPillsInfo(true)}
            >
              <Info size={24} />
            </button>
            <button className="text-zinc-700">
              <Search size={24} />
            </button>
          </div>
        </div>
        
        {/* Sub-header Navigation */}
        <div className="px-6 pt-0 pb-1 flex items-end justify-between gap-6 relative">
          {showPills && !isChallengeEnded ? (
            <>
              {/* Pley Pill Container */}
               <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px] relative">
                 <div className="h-[48px] flex flex-col items-center justify-end w-full">
                   {/* Variant Label or Majority Badge */}
                   {majorityVariant === 'pley' && timeLeft > 0 ? (
                     <div className="flex flex-col items-center gap-1 w-full">
                       {eliminationCounts.pley > 0 && (
                         <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                           <Skull size={10} className="text-rose-500 fill-rose-500" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{eliminationCounts.pley}</span>
                             Eliminated
                           </span>
                         </div>
                       )}
                       {madeItCounts.pley > 0 && (
                         <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100 shadow-[0_2px_10px_-3px_rgba(22,163,74,0.2)] animate-slide-in w-fit">
                           <Sparkles size={10} className="text-green-500 fill-green-500" />
                           <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{madeItCounts.pley}</span>
                             You Made It
                           </span>
                         </div>
                       )}
                       <div className="flex items-center gap-1 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse w-fit">
                         <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                         <span className="text-[9px] font-black font-serif text-amber-700 uppercase tracking-tight leading-none">Majority</span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-purple-200 shadow-[0_4px_15px_-3px_rgba(147,51,234,0.2)] animate-float">
                       <Sparkles size={12} className="text-purple-500 fill-purple-500" />
                       <span className="text-[10px] font-black font-serif bg-gradient-to-r from-purple-600 via-purple-400 to-zinc-900 bg-clip-text text-transparent tracking-tight leading-none whitespace-nowrap">
                         Choose Your Variant
                       </span>
                     </div>
                   )}
                 </div>
                 
                 <button 
                   onClick={() => handleTabClick('pley')}
                   className={`w-full py-2.5 border-2 rounded-full text-center text-[10px] uppercase tracking-widest font-black transition-all duration-300 relative overflow-hidden ${
                     activeTab === 'pley' 
                       ? 'bg-zinc-900 border-zinc-900 text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] scale-105 translate-y-[-2px]' 
                       : userSelection === 'pley'
                         ? 'bg-purple-50 border-purple-200 text-purple-600'
                         : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:bg-white hover:text-zinc-600 hover:translate-y-[-1px]'
                   } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                 >
                   <span className="relative z-10">Pley</span>
                   {timeLeft > 0 && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0.5">
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[7px] backdrop-blur-sm leading-none">
                         {clickCounts.pley}
                       </span>
                     </div>
                   )}
                 </button>
               </div>

               {/* Vause Pill */}
               <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px] relative">
                 <div className="h-[48px] flex flex-col items-center justify-end w-full">
                   {timeLeft > 0 && (
                     <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 shadow-md group cursor-help mb-1 animate-slide-in">
                       <Users size={10} className="text-zinc-400" />
                       <span className="text-[9px] font-black text-white leading-none">
                         {Object.values(clickCounts).reduce((a, b) => a + b, 0)}
                       </span>
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] p-2 rounded shadow-xl hidden group-hover:block whitespace-nowrap z-[100]">
                         Total Round Participation
                       </div>
                     </div>
                   )}
                   {majorityVariant === 'vause' && timeLeft > 0 ? (
                     <div className="flex flex-col items-center gap-1 w-full">
                       {eliminationCounts.vause > 0 && (
                         <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                           <Skull size={10} className="text-rose-500 fill-rose-500" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{eliminationCounts.vause}</span>
                             Eliminated
                           </span>
                         </div>
                       )}
                       {madeItCounts.vause > 0 && (
                         <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100 shadow-[0_2px_10px_-3px_rgba(22,163,74,0.2)] animate-slide-in w-fit">
                           <Sparkles size={10} className="text-green-500 fill-green-500" />
                           <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{madeItCounts.vause}</span>
                             You Made It
                           </span>
                         </div>
                       )}
                       <div className="flex items-center gap-1 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse w-fit">
                         <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                         <span className="text-[9px] font-black font-serif text-amber-700 uppercase tracking-tight leading-none">Majority</span>
                       </div>
                     </div>
                   ) : null}
                 </div>
                 <button 
                   onClick={() => handleTabClick('vause')}
                   className={`w-full py-2.5 border-2 rounded-full text-center text-[10px] uppercase tracking-widest font-black transition-all duration-300 relative overflow-hidden ${
                     activeTab === 'vause' 
                       ? 'bg-zinc-900 border-zinc-900 text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] scale-105 translate-y-[-2px]' 
                       : userSelection === 'vause'
                         ? 'bg-purple-50 border-purple-200 text-purple-600'
                         : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:bg-white hover:text-zinc-600 hover:translate-y-[-1px]'
                   } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                 >
                   <span className="relative z-10">VAUSE</span>
                   {timeLeft > 0 && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0.5">
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[7px] backdrop-blur-sm leading-none">
                         {clickCounts.vause}
                       </span>
                     </div>
                   )}
                 </button>
               </div>

               {/* Kight Pill */}
               <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px] relative">
                 <div className="h-[48px] flex flex-col items-center justify-end w-full">
                   {majorityVariant === 'kight' && timeLeft > 0 ? (
                     <div className="flex flex-col items-center gap-1 w-full">
                       {eliminationCounts.kight > 0 && (
                         <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                           <Skull size={10} className="text-rose-500 fill-rose-500" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{eliminationCounts.kight}</span>
                             Eliminated
                           </span>
                         </div>
                       )}
                       <div className="flex items-center gap-1 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse w-fit">
                         <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                         <span className="text-[9px] font-black font-serif text-amber-700 uppercase tracking-tight leading-none">Majority</span>
                       </div>
                     </div>
                   ) : null}
                 </div>
                 <button 
                   onClick={() => handleTabClick('kight')}
                   className={`w-full py-2.5 border-2 rounded-full text-center text-[10px] uppercase tracking-widest font-black transition-all duration-300 relative overflow-hidden ${
                     activeTab === 'kight' 
                       ? 'bg-zinc-900 border-zinc-900 text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] scale-105 translate-y-[-2px]' 
                       : userSelection === 'kight'
                         ? 'bg-purple-50 border-purple-200 text-purple-600'
                         : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:bg-white hover:text-zinc-600 hover:translate-y-[-1px]'
                   } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                 >
                   <span className="relative z-10">Kight</span>
                   {timeLeft > 0 && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0.5">
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[7px] backdrop-blur-sm leading-none">
                         {clickCounts.kight}
                       </span>
                     </div>
                   )}
                 </button>
               </div>
            </>
          ) : (
            <div className="flex-1" /> // Spacer when pills are hidden
          )}
        </div>

        {/* Timer and Submit Section */}
        {activeTab && (
          <div className="px-6 pb-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-purple-600" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Set Duration</span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Hours Setter */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustTime('h', -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span className="text-sm font-black text-zinc-900 leading-none">{hours}</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">hrs</span>
                  </div>
                  <button 
                    onClick={() => adjustTime('h', 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>

                <div className="w-[1px] h-6 bg-zinc-200" />

                {/* Minutes Setter */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustTime('m', -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center min-w-[2.5rem]">
                    <span className="text-sm font-black text-zinc-900 leading-none">{minutes}</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">mins</span>
                  </div>
                  <button 
                    onClick={() => adjustTime('m', 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Kight Ranking Rule Selection */}
            {activeTab === 'kight' && (
              <div className="flex flex-col gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-purple-600" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Top Ranking</span>
                  </div>
                  {majorityRankingRule && (
                    <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Majority: {majorityRankingRule}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Top 1</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-zinc-900 leading-none">{userKightRanking}</span>
                      <span className="text-[8px] font-bold text-purple-500 uppercase tracking-widest mt-1">Current Choice</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Top 20</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={userKightRanking}
                    disabled={hasVotedKightRanking && timeLeft > 0}
                    onChange={(e) => setUserKightRanking(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  
                  {/* Community Breakdown (Top 3 rules) */}
                  {Object.keys(kightRankingVotes).length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest px-1">Community Votes</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(kightRankingVotes)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([rule, votes]) => (
                            <div key={rule} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-zinc-200 shadow-sm">
                              <span className="text-[9px] font-black text-zinc-900">{rule}</span>
                              <div className="w-[1px] h-2 bg-zinc-200" />
                              <span className="text-[9px] font-bold text-purple-500">{votes}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-3">
              {userSelection && timeLeft > 0 && (
                <span className="text-[10px] font-bold text-zinc-400 italic">Selection locked until timer ends</span>
              )}
              <button 
                disabled={(!!userSelection && timeLeft > 0) || (hours === 0 && minutes === 0)}
                onClick={() => {
                  const totalSeconds = (hours * 3600) + (minutes * 60);
                  if (totalSeconds > 0) {
                    setTimeLeft(totalSeconds);
                    setIsActive(true);
                    
                    // Increment click count for the active tab
                    if (activeTab) {
                      setClickCounts(prev => ({
                        ...prev,
                        [activeTab]: prev[activeTab] + 1
                      }));

                      // Add Kight ranking vote if applicable
                      if (activeTab === 'kight' && userKightRanking) {
                        const ruleKey = `Top ${userKightRanking}`;
                        setKightRankingVotes(prev => ({
                          ...prev,
                          [ruleKey]: (prev[ruleKey] || 0) + 1
                        }));
                        setKightFirstRankingVoteTime(prev => {
                          if (!prev[ruleKey]) return { ...prev, [ruleKey]: Date.now() };
                          return prev;
                        });
                        setHasVotedKightRanking(true);
                      }

                      setVariantFirstClickTime(prev => {
                        if (!prev[activeTab]) return { ...prev, [activeTab]: Date.now() };
                        return prev;
                      });
                      setVariantDurations(prev => {
                        if (!prev[activeTab]) return { ...prev, [activeTab]: totalSeconds };
                        return prev;
                      });
                      setUserSelection(activeTab);
                    }
                  }
                  setActiveTab(null);
                  setHours(0);
                  setMinutes(0);
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all transform ${
                  (!!userSelection && timeLeft > 0) || (hours === 0 && minutes === 0)
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95'
                }`}
              >
                {userSelection && timeLeft > 0 ? 'Submitted' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post) => (
            <PostCard 
              key={post.id} 
              {...post} 
              gameMode={userSelection || majorityVariant}
              onDelete={() => handleDeletePost(post.id)}
              onPass={() => handlePassPost(post.id)}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-1000">
            <h2 className="text-6xl font-black font-serif text-zinc-900 tracking-tighter">
              The End
            </h2>
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                All profiles have been judged
              </p>
              <div className="h-[1px] w-12 bg-zinc-200" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
