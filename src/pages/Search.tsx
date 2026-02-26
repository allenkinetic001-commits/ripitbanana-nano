import React, { useState, useMemo } from 'react';
import { Skull, Trophy, Sparkles, MessageCircle, Bookmark, MoreHorizontal, ArrowBigUp, ArrowBigDown, Zap, Filter, Clock, History, ChevronLeft, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChallengeTimer from '../components/ChallengeTimer';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn, formatDate } from '../lib/utils';

const VariantPill = ({ variant }: { variant: string | null }) => {
  if (!variant) return null;
  const colors: Record<string, string> = {
    vause: "bg-purple-50 text-purple-600 border-purple-100",
    pley: "bg-blue-50 text-blue-600 border-blue-100",
    kight: "bg-amber-50 text-amber-600 border-amber-100",
  };
  const colorClass = colors[variant] || "bg-zinc-50 text-zinc-600 border-zinc-100";
  
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight border mx-1",
      colorClass
    )}>
      {variant}
    </span>
  );
};

const Search = () => {
  const navigate = useNavigate();
  const { 
    isChallengeEnded, survivors, survivorHistory, roundHistory, isActive, 
    startNewChallenge, clearAllHistory, updateHistoryVote, getVariantDisplayName,
    toggleFollow, followedUsers, isLegend, t
  } = useChallenge();
  const [selectedDuration, setSelectedDuration] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'hall_of_fame' | 'round_logs'>('round_logs');
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  const handleJoinNextTask = () => {
    startNewChallenge();
    // The Home component will handle the default 'kight' state on mount
    navigate('/');
  };

  const currentVariant = useMemo(() => {
    // Try to get variant from current survivors or context
    if (survivors.length > 0 && survivors[0].variant) return survivors[0].variant;
    return null;
  }, [survivors]);

  const totalElimination = isChallengeEnded && survivors.length === 0;

  // Find selected round data
  const selectedRound = useMemo(() => {
    return roundHistory.find(r => r.id === selectedRoundId);
  }, [roundHistory, selectedRoundId]);

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
    survivorHistory.forEach(s => {
      if (s.roundDurationLabel) durations.add(s.roundDurationLabel);
    });
    // Also check roundHistory for labels that might not have survivors
    roundHistory.forEach(r => {
      if (r.durationLabel) durations.add(r.durationLabel);
    });
    return Array.from(durations).sort((a, b) => {
      // Basic sort: min before hr
      if (a.includes('min') && b.includes('hr')) return -1;
      if (a.includes('hr') && b.includes('min')) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [survivorHistory, roundHistory]);

  // Combine current survivors with history for the "All-Time" view
  // If challenge just ended, we show current results at the top
  const allAvailableSurvivors = useMemo(() => {
    return isChallengeEnded ? survivors : survivorHistory;
  }, [isChallengeEnded, survivors, survivorHistory]);

  const displaySurvivors = useMemo(() => {
    if (selectedDuration === 'all') return allAvailableSurvivors;
    return allAvailableSurvivors.filter(s => s.roundDurationLabel === selectedDuration);
  }, [allAvailableSurvivors, selectedDuration]);

  const displayLogs = useMemo(() => {
    if (selectedDuration === 'all') return roundHistory;
    return roundHistory.filter(r => r.durationLabel === selectedDuration);
  }, [roundHistory, selectedDuration]);

  const isHistoryView = !isChallengeEnded;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-white">
      {/* Header */}
      <div className="p-4 sticky top-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3">
          {selectedRoundId && (
            <button 
              onClick={() => setSelectedRoundId(null)}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} className="text-zinc-900" />
            </button>
          )}
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">
              {selectedRoundId ? t('search_header_details') : isChallengeEnded ? t('search_header_results') : viewMode === 'hall_of_fame' ? t('search_header_hall') : t('search_header_history')}
            </h2>
            {!isChallengeEnded && !selectedRoundId && (
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                {viewMode === 'hall_of_fame' ? t('search_top_survivors') : t('search_recent_outcomes')}
              </span>
            )}
            {selectedRoundId && selectedRound && (
              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">
                {selectedRound.durationLabel} Round • {selectedRound.date}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isActive && (
            <button
              onClick={() => {
                if (window.confirm('Clear all round history and Hall of Fame? This cannot be undone.')) {
                  clearAllHistory();
                }
              }}
              className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full"
              title={t('search_clear_history')}
            >
              <Trash2 size={18} />
            </button>
          )}
          {isActive ? <ChallengeTimer /> : (
            <button 
              onClick={handleJoinNextTask}
              className="group relative px-4 py-1.5 overflow-hidden rounded-lg bg-zinc-900 transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative flex items-center gap-2">
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{t('search_start_round')}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Result/History View */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar */}
        {availableDurations.length > 0 && !isChallengeEnded && !selectedRoundId && (
          <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-3 overflow-x-auto no-scrollbar sticky top-[57px] z-20">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
              <Filter size={12} />
              {t('search_filter_type')}
            </div>
            <button
              onClick={() => setSelectedDuration('all')}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedDuration === 'all' 
                  ? "bg-zinc-900 text-white shadow-sm" 
                  : "bg-white text-zinc-400 hover:text-zinc-600 border border-zinc-200"
              )}
            >
              {t('search_all_winners')}
            </button>
            {availableDurations.map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5",
                  selectedDuration === duration 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "bg-white text-zinc-400 hover:text-zinc-600 border border-zinc-200"
                )}
              >
                <Clock size={10} />
                {duration} Round
              </button>
            ))}
          </div>
        )}

        {isChallengeEnded && totalElimination && (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6 py-12">
              <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_-5px_rgba(225,29,72,0.5)] animate-pulse">
                <Skull size={48} className="text-rose-600 fill-rose-600" />
              </div>
              <div className="space-y-2">
                  <h2 className="text-5xl font-black text-rose-600 tracking-tighter uppercase leading-none">
                    {currentVariant === 'vause' ? 'TOTAL V-TERMINATION' : currentVariant === 'pley' ? 'TOTAL P-TERMINATION' : currentVariant === 'kight' ? t('search_no_winners') : t('search_total_termination')}
                  </h2>
                  <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase">
                    No profiles {currentVariant === 'vause' ? 'made it' : currentVariant === 'pley' ? 'pley' : currentVariant === 'kight' ? 'won the top ranking' : 'survived'} this round
                  </p>
                </div>
              <button 
                onClick={handleJoinNextTask}
                className="mt-8 px-8 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 transition-transform"
              >
                {t('search_try_again')}
              </button>
            </div>
          </div>
        )}

        {(displaySurvivors.length > 0 || displayLogs.length > 0) ? (
          <div className="flex flex-col">
            <div className={cn(
              "p-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between sticky z-10 backdrop-blur-sm",
              isHistoryView && availableDurations.length > 0 && !selectedRoundId ? "top-[105px]" : "top-[57px]"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
                  <Trophy size={20} className="text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-zinc-900 tracking-tight uppercase leading-none">
                    {selectedRoundId 
                      ? (selectedRound?.variant === 'vause' ? 'people that made it' : selectedRound?.variant === 'pley' ? 'people that pleyed' : selectedRound?.variant === 'kight' ? `Winner of ${selectedRound.rankingRule}` : 'people that survived') 
                      : isChallengeEnded ? (survivors[0]?.variant === 'kight' ? `Winner of ${survivors[0].rankingRule}` : 'people that survived') : viewMode === 'hall_of_fame' ? 'Hall of Fame' : 'Round History'}
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 flex items-center">
                    {selectedRoundId && selectedRound ? (
                      <>
                        {selectedRound.survivorCount} {selectedRound.survivorCount === 1 ? 'Person' : 'People'}
                        <span className="ml-1">
                          {selectedRound.variant === 'vause' ? 'Made It' : selectedRound.variant === 'pley' ? 'Pleyed' : selectedRound.variant === 'kight' ? 'Winners' : 'Saved'}
                        </span>
                        <VariantPill variant={selectedRound.variant} />
                      </>
                    ) : isChallengeEnded ? (
                      survivors[0]?.variant === 'kight' ? `Verified Winners` : (survivors.length === 1 ? 'The Ultimate Survivor' : `${survivors.length} Profiles Remaining`)
                    ) : viewMode === 'hall_of_fame' ? (
                      `${displaySurvivors.length} Total Winners Displayed`
                    ) : (
                      `${displayLogs.length} Rounds Recorded`
                    )}
                  </p>
                </div>
              </div>
              {isChallengeEnded && (
                <button 
                  onClick={handleJoinNextTask}
                  className="group relative px-6 py-2.5 overflow-hidden rounded-xl bg-zinc-900 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                >
                  <div className="absolute inset-0 w-3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-2">
                    <Zap size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{t('search_join_next')}</span>
                  </div>
                </button>
              )}
            </div>

            {viewMode === 'hall_of_fame' || isChallengeEnded || selectedRoundId ? (
              <div className="flex-1 space-y-8 py-6">
                {(selectedRoundId ? selectedRound?.survivors : displaySurvivors)?.map((survivor, idx) => (
                  <div key={`${survivor.id}-${idx}`} className="bg-white border-y border-zinc-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img src={survivor.avatar} alt={survivor.username} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
                            isLegend(survivor.username) ? "bg-amber-500" : "bg-green-500"
                          )}>
                            {isLegend(survivor.username) ? <Trophy size={8} className="text-white fill-white" /> : <Sparkles size={8} className="text-white fill-white" />}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-zinc-900 italic">@{survivor.username}</span>
                            {isLegend(survivor.username) && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded flex items-center gap-0.5">
                                <Trophy size={8} className="fill-amber-600" />
                                Legend
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{survivor.time}</span>
                            {survivor.roundDurationLabel && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-zinc-200" />
                                <span className="text-[10px] text-purple-600 font-black uppercase tracking-tighter flex items-center gap-1">
                                  <Clock size={10} />
                                  {survivor.roundDurationLabel}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => toggleFollow(survivor.username)}
                          className={cn(
                            "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm",
                            followedUsers.includes(survivor.username)
                              ? "bg-zinc-100 text-zinc-400 border border-zinc-200"
                              : "bg-zinc-900 text-white hover:bg-zinc-800"
                          )}
                        >
                          {followedUsers.includes(survivor.username) ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-square bg-zinc-50 overflow-hidden relative group">
                      <img src={survivor.image} alt="Post content" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                        {(isHistoryView || isChallengeEnded) && <Clock size={10} className="text-amber-600" />}
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                          {isHistoryView 
                            ? (survivor.variant === 'vause' ? 'MADE IT' : survivor.variant === 'pley' ? 'PLEYED' : survivor.variant === 'kight' ? `WINNER OF ${survivor.rankingRule}` : `${survivor.roundDurationLabel || 'LEGEND'}`) 
                            : (survivor.variant === 'kight' ? `WINNER OF ${survivor.rankingRule}` : 'SURVIVOR')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 bg-zinc-100 rounded-xl px-2 py-1">
                            {survivor.variant !== 'pley' && (
                              <button 
                                onClick={() => handleVote(survivor.id, selectedRoundId, 'up')}
                                className={cn(
                                  "p-1 transition-colors",
                                  survivor.userVote === 'up' ? "text-green-600" : "text-zinc-500 hover:text-green-600"
                                )}
                              >
                                <ArrowBigUp size={24} strokeWidth={survivor.userVote === 'up' ? 3 : 2} fill={survivor.userVote === 'up' ? "currentColor" : "none"} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleVote(survivor.id, selectedRoundId, 'down')}
                              className={cn(
                                "p-1 transition-colors",
                                survivor.userVote === 'down' ? "text-red-600" : "text-zinc-500 hover:text-red-600"
                              )}
                            >
                              <ArrowBigDown size={24} strokeWidth={survivor.userVote === 'down' ? 3 : 2} fill={survivor.userVote === 'down' ? "currentColor" : "none"} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => navigate(`/post/${survivor.id}`)}
                              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-9 w-9 rounded-full transition-colors"
                            >
                              <MessageCircle size={20} className="text-zinc-700" />
                            </button>
                            <button 
                              onClick={() => navigate(`/chat/${survivor.username}`)}
                              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-9 w-9 rounded-full transition-colors"
                              title="Message survivor"
                            >
                              <Send size={16} className="text-zinc-700 -rotate-45" />
                            </button>
                            {(survivor.survivalTime || !isHistoryView) && (
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter leading-none">
                                  {survivor.variant === 'vause' ? 'MADE IT AT' : survivor.variant === 'pley' ? 'PLEYED AT' : survivor.variant === 'kight' ? 'WON AT' : 'SURVIVED AT'}
                                </span>
                                <span className="text-[10px] font-black text-zinc-900 mt-0.5">
                                  {survivor.survivalTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  {(survivor.variant === 'vause' || survivor.variant === 'pley' || survivor.variant === 'kight') && (
                                    <span className="text-[8px] text-zinc-400 ml-1 italic font-bold">
                                      ({survivor.roundDurationLabel} Task)
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-100">
                            <span className="text-[7px] font-black text-zinc-300 uppercase tracking-tighter leading-none">Date</span>
                          <span className="text-[9px] font-bold text-zinc-500">
                            {survivor.survivalDate || formatDate(new Date())}
                          </span>
                          </div>
                          <button className="text-zinc-700 hover:text-zinc-400 transition-colors">
                            <Bookmark size={24} />
                          </button>
                        </div>
                      </div>

                      {/* Caption & Comments */}
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-black mr-2 text-zinc-900">@{survivor.username}</span>
                          <span className="text-zinc-700">{survivor.caption}</span>
                        </p>
                        
                        {survivor.comments.length > 0 && (
                          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle size={12} className="text-zinc-400" />
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Comments</span>
                            </div>
                            {survivor.comments.slice(0, 2).map((comment) => (
                              <div key={comment.id} className="flex items-start space-x-2">
                                <div className="w-5 h-5 bg-zinc-200 rounded-full flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-zinc-900">@{comment.username}</span>
                                  <p className="text-[11px] text-zinc-500 leading-tight">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Sparkles size={10} className="text-purple-600" />
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                              {isHistoryView 
                                ? "This legend has secured a spot in the Hall of Fame." 
                                : (survivor.variant === 'kight' ? `Congratulations to the winner! This profile has officially secured a spot in the ${survivor.rankingRule}.` : "Congratulations to the survivor! This profile has officially passed the universal selection protocol.")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 p-6 space-y-4">
                {displayLogs.map((log) => (
                  <button 
                    key={log.id} 
                    onClick={() => setSelectedRoundId(log.id)}
                    className="w-full text-left bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          log.outcome === 'SURVIVAL' ? "bg-green-100" : "bg-rose-100"
                        )}>
                          {log.outcome === 'SURVIVAL' ? <Trophy size={18} className="text-green-600" /> : <Skull size={18} className="text-rose-600" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight mb-0.5">
                            {log.date} • {log.time}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider opacity-70",
                            log.outcome === 'SURVIVAL' ? "text-green-600" : "text-rose-600"
                          )}>
                            {log.outcome === 'SURVIVAL' 
                              ? `${getVariantDisplayName(log.variant)} Success` 
                              : `${getVariantDisplayName(log.variant)} Termination`}
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock size={10} className="text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-900 uppercase">{log.durationLabel} Round</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Outcome</span>
                        <div className="flex items-center mt-0.5">
                          <span className="text-sm font-black text-zinc-900">
                            {log.survivorCount} {log.survivorCount === 1 ? 'Person' : 'People'} {log.variant === 'vause' ? 'Made It' : log.variant === 'pley' ? 'Pleyed' : log.variant === 'kight' ? `won ${log.rankingRule}` : 'Survived'}
                          </span>
                          <VariantPill variant={log.variant} />
                        </div>
                      </div>
                      {log.survivors.length > 0 && (
                        <div className="flex -space-x-2">
                          {log.survivors.slice(0, 3).map((s, i) => (
                            <img key={i} src={s.avatar} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" alt="Survivor" />
                          ))}
                          {log.survivors.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-600">
                              +{log.survivors.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          !isChallengeEnded && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-purple-100 rounded-full animate-ping opacity-20" />
                <div className="relative w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-100">
                  <Sparkles size={32} className="text-purple-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase mb-2">
                {isActive ? t('search_waiting') : t('search_no_active')}
              </h2>
              <p className="text-zinc-400 text-[10px] font-bold tracking-[0.3em] uppercase max-w-[200px] leading-relaxed">
                {isActive 
                  ? t('search_waiting_desc')
                  : t('search_start_desc')}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
