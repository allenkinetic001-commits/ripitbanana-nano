import React, { useState, useMemo, useEffect } from 'react';
import { Skull, Trophy, Sparkles, MessageCircle, Bookmark, MoreHorizontal, ArrowBigUp, ArrowBigDown, Zap, Filter, Clock, History, ChevronLeft, ChevronRight, Trash2, Send, Search as SearchIcon, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn, formatDate } from '../lib/utils';
import { ProfileHeartsToggle } from '../components/ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';
import EmptyFeed from '../components/Empty';
import { supabase } from '../lib/supabase';

const VariantPill = ({ variant }: { variant: string | null | undefined }) => {
  if (!variant) return null;
  return (
    <span className={cn(
      "ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
      variant === 'survival' ? "bg-green-100 text-green-700" : 
      variant === 'termination' ? "bg-rose-100 text-rose-700" : 
      "bg-purple-100 text-purple-700"
    )}>
      {variant}
    </span>
  );
};

const SurvivorRow = React.memo(({ survivor, isSurvivor, toggleFollow, followedUsers, navigate, handleVote, selectedRoundId, isHistoryView, isChallengeEnded }: any) => {
  const [showHearts, setShowHearts] = useState(false);
  const { handlers: heartsHandlers } = useLongPress(() => setShowHearts(!showHearts), 400);

  return (
    <div className="mx-4 mb-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-2xl transition-all">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4" {...heartsHandlers}>
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate(`/user/${survivor.username}`)}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              <img src={survivor.avatar} alt={survivor.username} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <img 
                src="/pley-badge.png" 
                alt="Status" 
                className="w-8 h-8 object-contain drop-shadow-md" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-zinc-900 italic tracking-tight">@{survivor.username}</span>
              <ProfileHeartsToggle isVisible={showHearts} heartClassName="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                {survivor.roundDate ? `${survivor.roundDate} at ${survivor.roundTime}` : survivor.time}
              </span>
              {survivor.roundDurationLabel && (
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  <img src="/duration-alarm.png" alt="" className="h-3 w-auto object-contain" />
                  <span className="text-[8px] text-purple-600 font-black uppercase tracking-tighter">
                    {survivor.roundDurationLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => toggleFollow(survivor.username)}
          className="transition-all active:scale-90 hover:scale-110"
        >
          <img 
            src={followedUsers.includes(survivor.username) ? "/btn-following.png" : "/btn-follow.png"} 
            alt="Follow Action" 
            className="h-8 w-auto object-contain" 
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </button>
      </div>

      {/* Main Visual */}
      <div className="aspect-[4/5] bg-zinc-50 overflow-hidden relative group mx-2 rounded-[1.8rem]">
        <img src={survivor.image} alt="Survival Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Status Badge Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
              <img src="/duration-alarm.png" alt="" className="h-4 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900">
                {isHistoryView ? "Legacy Record" : "Live Survivor"}
              </span>
           </div>
        </div>

        <div className="absolute bottom-4 right-4 z-50">
          {isHistoryView && survivor.madeIt === false ? (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl shadow-xl border-2 backdrop-blur-md bg-rose-500/90 text-white border-rose-400">
              Terminated
            </span>
          ) : (
            <img 
              src="/survived_btn.png" 
              alt="Survived" 
              className="h-8 w-auto object-contain drop-shadow-md hover:scale-110 transition-transform active:scale-95 cursor-pointer" 
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          )}
        </div>
      </div>

      {/* Actions & Insights */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/50">
              <button 
                onClick={() => handleVote(survivor.id, selectedRoundId, 'up')}
                className={cn("p-1.5 rounded-full transition-all", survivor.userVote === 'up' ? "bg-white shadow-sm scale-110" : "opacity-40 hover:opacity-100")}
              >
                <ArrowBigUp size={20} fill={survivor.userVote === 'up' ? "#22c55e" : "black"} stroke="none" />
              </button>
              <button 
                onClick={() => handleVote(survivor.id, selectedRoundId, 'down')}
                className={cn("p-1.5 rounded-full transition-all", survivor.userVote === 'down' ? "bg-white shadow-sm scale-110" : "opacity-40 hover:opacity-100")}
              >
                <ArrowBigDown size={20} fill={survivor.userVote === 'down' ? "#ef4444" : "black"} stroke="none" />
              </button>
            </div>

            <button 
              onClick={() => navigate(`/post/${survivor.id}`)}
              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-10 w-10 rounded-full transition-all active:scale-90"
            >
              <MessageCircle size={18} className="text-zinc-600" />
            </button>
            
            <button 
              onClick={() => navigate(`/chat/${survivor.username}`)}
              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-10 w-10 rounded-full transition-all active:scale-90"
            >
              <img src="/nav-chat-v3.png" alt="Message" className="h-6 w-6 object-contain" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[7px] font-black text-zinc-300 uppercase tracking-widest leading-none">Vibe Check</p>
              <p className="text-[10px] font-black text-zinc-900 mt-0.5">ELITE STATUS</p>
            </div>
            <img 
              src="/elite_status_icon.png" 
              alt="Elite" 
              className="w-10 h-10 object-contain drop-shadow-sm" 
            />
          </div>
        </div>

        {/* Caption */}
        <div className="bg-zinc-50/50 rounded-[1.5rem] p-3 border border-zinc-100/50">
          <p className="text-[12px] leading-relaxed">
            <span className="font-black italic text-zinc-900 mr-2 hover:text-purple-600 cursor-pointer">@{survivor.username}</span>
            <span className="text-zinc-600">{survivor.caption}</span>
          </p>
        </div>
      </div>
    </div>
  );
});

const RoundCard = ({ round, onClick }: { round: any, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="mx-6 mb-6 relative group cursor-pointer transition-all active:scale-[0.98]"
    >
      {/* Decorative Stacks */}
      <div className="absolute inset-0 bg-zinc-200/40 rounded-[2.5rem] translate-y-3 scale-[0.96] blur-[2px] -z-20" />
      <div className="absolute inset-0 bg-zinc-100/60 rounded-[2.5rem] translate-y-1.5 scale-[0.98] -z-10" />
      
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 p-6 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">


        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Clock size={12} className="text-zinc-400" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{round.date} at {round.time}</span>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter leading-none">
                {round.variant} Selection Round
              </h3>
              
              <div className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg flex items-center gap-2 w-fit">
                <img 
                  src="/trophy-icon.png" 
                  alt="" 
                  className="h-4 w-auto object-contain brightness-0 invert" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
                {round.survivors.length} SURVIVORS
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full uppercase tracking-wider border border-zinc-200/50">
                 Duration: {round.durationLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mt-2 w-full">
            <div className="flex -space-x-4">
              {round.survivors.slice(0, 6).map((s: any, i: number) => (
                <div key={s.id} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-xl transform transition-transform group-hover:scale-110 group-hover:-translate-y-1" style={{ zIndex: 10 - i }}>
                  <img src={s.avatar} alt={s.username} className="w-full h-full object-cover" />
                </div>
              ))}
              {round.survivors.length > 6 && (
                <div className="w-14 h-14 rounded-full border-4 border-white bg-zinc-50 flex items-center justify-center shadow-xl relative z-0">
                   <span className="text-[10px] font-black text-zinc-400">+{round.survivors.length - 6}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-zinc-200 px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:bg-zinc-50 active:scale-95 cursor-pointer group/btn">
              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.3em]">View Round Results</span>
              <ChevronRight size={14} className="text-zinc-300 group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { 
    isChallengeEnded, survivors, eliminated, survivorHistory, roundHistory, isActive, 
    startNewChallenge, clearAllHistory, updateHistoryVote, getVariantDisplayName,
    toggleFollow, followedUsers, isLegend, setShowPills, activeTab, setActiveTab, isSurvivor, t,
    setRoundHistory, isAuthenticated, historyLoading
  } = useChallenge();
  const [selectedDuration, setSelectedDuration] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'hall_of_fame' | 'round_logs'>('round_logs');
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set historyLoading to false is now handled by context status

  // Use context data directly since it is now optimistically updated
  const mergedRounds = roundHistory;

  // Auto-navigate to home when the 10-second results display ends
  const previousIsChallengeEnded = React.useRef(isChallengeEnded);
  useEffect(() => {
    if (previousIsChallengeEnded.current && !isChallengeEnded) {
      navigate('/');
    }
    previousIsChallengeEnded.current = isChallengeEnded;
  }, [isChallengeEnded, navigate]);

  const handleJoinNextTask = () => {
    startNewChallenge();
    setActiveTab('pley');
    setShowPills(false);
    navigate('/');
  };


  const currentVariant = useMemo(() => {
    // Try to get variant from current survivors or context
    if (survivors.length > 0 && survivors[0].variant) return survivors[0].variant;
    return null;
  }, [survivors]);

  const totalElimination = isChallengeEnded && survivors.length === 0 && eliminated.length > 0;

  // Find selected round data
  const selectedRound = useMemo(() => {
    return mergedRounds.find((r: any) => r.id === selectedRoundId);
  }, [mergedRounds, selectedRoundId]);

  const handleVote = (survivorId: number, roundId: string | null, vote: 'up' | 'down') => {
    // If clicking the same vote again, remove it (toggle)
    const currentList = roundId ? selectedRound?.survivors : survivorHistory;
    const currentSurvivor = currentList?.find(s => s.id === survivorId);
    const newVote = currentSurvivor?.userVote === vote ? null : vote;
    updateHistoryVote(survivorId, roundId, newVote);
  };
  
  // Get unique round durations from history for filtering
  const availableDurations = useMemo(() => {
    const durations = new Set<string>();
    mergedRounds.forEach((r: any) => {
      if (r.durationLabel) durations.add(r.durationLabel);
    });
    return Array.from(durations).sort((a, b) => {
      if (a.includes('min') && b.includes('hr')) return -1;
      if (a.includes('hr') && b.includes('min')) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [mergedRounds]);

  // Build Hall of Fame from mergedRounds — show ALL winning content
  const localSurvivorHistory = useMemo(() => {
    const result: any[] = [];
    const seenUsernames = new Set<string>();

    mergedRounds.forEach((round: any) => {
      (round.survivors || []).forEach((s: any) => {
        if (s.username) {
          if (viewMode === 'hall_of_fame') {
            if (!seenUsernames.has(s.username)) {
              result.push({ 
                ...s, 
                madeIt: true,
                roundId: round.id,
                roundDate: round.date,
                roundTime: round.time
              });
              seenUsernames.add(s.username);
            }
          } else {
            result.push({ 
              ...s, 
              madeIt: true,
              roundId: round.id,
              roundDate: round.date,
              roundTime: round.time
            });
          }
        }
      });
    });
    // Sort by most recent rounds first
    return result.sort((a, b) => {
      const dateA = new Date(`${a.roundDate} ${a.roundTime}`).getTime();
      const dateB = new Date(`${b.roundDate} ${b.roundTime}`).getTime();
      return dateB - dateA;
    });
  }, [mergedRounds, viewMode]);

  const allAvailableSurvivors = useMemo(() => {
    return isChallengeEnded ? survivors : localSurvivorHistory;
  }, [isChallengeEnded, survivors, localSurvivorHistory]);

  const displaySurvivors = useMemo(() => {
    const base = selectedDuration === 'all' 
      ? allAvailableSurvivors 
      : allAvailableSurvivors.filter(s => s.roundDurationLabel === selectedDuration);
    
    const filtered = searchQuery 
      ? base.filter(s => s.username.toLowerCase().includes(searchQuery.toLowerCase()))
      : base;

    // Only show winners/survivors, remove terminated players
    return filtered.filter(s => s.madeIt !== false);
  }, [allAvailableSurvivors, selectedDuration, searchQuery]);

  const displayLogs = useMemo(() => {
    const base = selectedDuration === 'all' ? mergedRounds : mergedRounds.filter((r: any) => r.durationLabel === selectedDuration);
    
    const filtered = searchQuery
      ? base.filter((r: any) => 
          (r.survivors || []).some((s: any) => s.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (r.eliminated || []).some((e: any) => e.username?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : base;

    return filtered.filter((r: any) => (r.survivors?.length || 0) > 0 || (r.eliminated?.length || 0) > 0);
  }, [mergedRounds, selectedDuration, searchQuery]);

  const isHistoryView = !isChallengeEnded;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-4 py-6 bg-white flex items-center border-b border-zinc-100 justify-between shadow-sm">
        <img 
          src="/globe_head.png" 
          alt="Globe Head" 
          className="h-14 w-auto object-contain flex-shrink-0" 
        />
        <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic flex-1 flex justify-center">
          {viewMode === 'hall_of_fame' ? (
            <img 
              src="/hall_of_fame_title.png" 
              alt="Hall of Fame" 
              className="h-8 w-auto object-contain" 
            />
          ) : (
            <img 
              src="/round_history_title.png" 
              alt="Round History" 
              className="h-8 w-auto object-contain" 
            />
          )}
        </h1>
        {/* Spacer to keep title perfectly centered */}
        <div className="w-10"></div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <SearchIcon size={18} />
          </div>
          <input 
            type="text"
            placeholder="Search citizens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 border-none rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold outline-none ring-0 focus:ring-2 focus:ring-zinc-200 transition-all placeholder:text-zinc-400 placeholder:font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="px-6 py-6">
        <div className="bg-zinc-100 p-1.5 rounded-[2rem] flex items-center shadow-inner">
          <button 
            onClick={() => setViewMode('hall_of_fame')}
            className={cn(
              "flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center",
              viewMode === 'hall_of_fame' ? "bg-white text-zinc-900 shadow-md scale-[1.02]" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <img 
              src="/variant-public-text.png" 
              alt="Public" 
              className={cn("h-4 w-auto object-contain transition-opacity", viewMode === 'hall_of_fame' ? "opacity-100" : "opacity-40")} 
            />
          </button>
          <button 
            onClick={() => setViewMode('round_logs')}
            className={cn(
              "flex-1 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center",
              viewMode === 'round_logs' ? "bg-white text-zinc-900 shadow-md scale-[1.02]" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <img 
              src="/round-history.png" 
              alt="History" 
              className={cn("h-4 w-auto object-contain transition-opacity", viewMode === 'round_logs' ? "opacity-100" : "opacity-40")} 
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1">
        {selectedRoundId ? (
          /* ── Selected Round Detail View ── */
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-6 mb-6 flex items-center justify-between">
              <button 
                onClick={() => setSelectedRoundId(null)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-100 shadow-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Back to History</span>
              </button>
              {selectedRound && (
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedRound.date}</p>
                  <p className="text-[10px] font-black text-zinc-900 uppercase italic">Results</p>
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Survivors Section */}
              {selectedRound?.survivors && selectedRound.survivors.length > 0 && (
                <div className="space-y-4">
                  <div className="px-6 flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-zinc-200" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Survivors ({selectedRound.survivors.length})</span>
                    <div className="h-[1px] flex-1 bg-zinc-200" />
                  </div>
                  {selectedRound.survivors.map((survivor: any) => (
                    <SurvivorRow 
                      key={`survivor-${survivor.id}`} 
                      survivor={{ ...survivor, madeIt: true }} 
                      isSurvivor={isSurvivor}
                      toggleFollow={toggleFollow}
                      followedUsers={followedUsers}
                      navigate={navigate}
                      handleVote={handleVote}
                      selectedRoundId={selectedRoundId}
                      isHistoryView={true}
                      isChallengeEnded={false}
                    />
                  ))}
                </div>
              )}

              {/* Eliminated Section */}
              {selectedRound?.eliminated && selectedRound.eliminated.length > 0 && (
                <div className="space-y-4">
                  <div className="px-6 flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-rose-200" />
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Terminated ({selectedRound.eliminated.length})</span>
                    <div className="h-[1px] flex-1 bg-rose-200" />
                  </div>
                  {selectedRound.eliminated.map((eliminatedUser: any) => (
                    <SurvivorRow 
                      key={`eliminated-${eliminatedUser.id}`} 
                      survivor={{ ...eliminatedUser, madeIt: false }} 
                      isSurvivor={isSurvivor}
                      toggleFollow={toggleFollow}
                      followedUsers={followedUsers}
                      navigate={navigate}
                      handleVote={handleVote}
                      selectedRoundId={selectedRoundId}
                      isHistoryView={true}
                      isChallengeEnded={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'hall_of_fame' ? (
          /* ── All Time Hall of Fame ── */
          displaySurvivors.length > 0 ? (
            <div className="space-y-4">
              {displaySurvivors.map((survivor: any) => (
                <SurvivorRow 
                  key={survivor.id} 
                  survivor={survivor} 
                  isSurvivor={isSurvivor}
                  toggleFollow={toggleFollow}
                  followedUsers={followedUsers}
                  navigate={navigate}
                  handleVote={handleVote}
                  selectedRoundId={selectedRoundId}
                  isHistoryView={isHistoryView}
                  isChallengeEnded={isChallengeEnded}
                />
              ))}
            </div>
          ) : totalElimination ? (
            /* (already handled by totalElimination below) */
            null
          ) : (
            /* (already handled by empty state below) */
            null
          )
        ) : (
          /* ── Round History (Stacks) ── */
          displayLogs.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              {displayLogs.map((round: any) => (
                <RoundCard 
                  key={round.id} 
                  round={round} 
                  onClick={() => setSelectedRoundId(round.id)} 
                />
              ))}
            </div>
          ) : null
        )}

        {/* Global Empty/Special States (when not in detail view) */}
        {!selectedRoundId && (
          <>
            {totalElimination ? (
              /* ── TOTAL TERMINATION STATE ── */
              <div className="flex flex-col items-center justify-center p-8 pt-12 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center gap-8 bg-rose-50 p-12 rounded-[3rem] border border-rose-100 shadow-sm relative overflow-hidden group w-full max-w-sm">
                  <div className="relative">
                    <Skull size={64} className="text-rose-500 drop-shadow-2xl hover:scale-110 transition-transform duration-700" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-rose-900/5 rounded-full blur-md" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-black text-rose-600 tracking-tighter uppercase leading-tight italic">
                      {t('search_total_termination')}
                    </h2>
                    <div className="h-[2px] w-20 bg-rose-500 mt-4 mb-4" />
                    <p className="text-rose-400 text-[9px] font-black tracking-[0.4em] uppercase">
                      No Survivors This Round
                    </p>
                  </div>
                </div>
              </div>
            ) : (displaySurvivors.length === 0 && viewMode === 'hall_of_fame') || (displayLogs.length === 0 && viewMode === 'round_logs') ? (
              <div className="flex flex-col items-center justify-center p-8 pt-12 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center gap-8 bg-white/50 p-12 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden group w-full max-w-sm">
                  <div className="relative">
                    <img 
                      src="/ice-bear.png" 
                      alt="Empty" 
                      className="h-56 w-auto object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-zinc-900/5 rounded-full blur-md" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-tight italic">
                      It's Quiet Here
                    </h2>
                    <div className="h-[2px] w-20 bg-zinc-900 mt-4 mb-4" />
                    <p className="text-zinc-400 text-[9px] font-black tracking-[0.4em] uppercase">
                      {t('search_waiting')}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
