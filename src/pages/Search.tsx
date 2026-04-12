import React, { useState, useMemo } from 'react';
import { Skull, Trophy, Sparkles, MessageCircle, Bookmark, MoreHorizontal, ArrowBigUp, ArrowBigDown, Zap, Filter, Clock, History, ChevronLeft, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn, formatDate } from '../lib/utils';
import { ProfileHeartsToggle } from '../components/ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';

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

const SurvivorRow = ({ survivor, isSurvivor, toggleFollow, followedUsers, navigate, handleVote, selectedRoundId, isHistoryView, isChallengeEnded }: any) => {
  const [showHearts, setShowHearts] = useState(false);
  const { handlers: heartsHandlers } = useLongPress(() => setShowHearts(!showHearts), 400);

  return (
    <div className="bg-white border-y border-zinc-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between p-3" {...heartsHandlers}>
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/user/${survivor.username}`)}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-zinc-100 overflow-hidden shadow-sm">
              <img src={survivor.avatar} alt={survivor.username} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -right-3 flex items-center justify-center">
              <img 
                src="/pley-badge.png" 
                alt="Survivor" 
                className="w-12 h-12 object-contain" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-zinc-900 italic transition-colors">@{survivor.username}</span>
              <ProfileHeartsToggle isVisible={showHearts} heartClassName="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">{survivor.time}</span>
              {survivor.roundDurationLabel && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-200" />
                  <span className="text-[10px] text-purple-600 font-black uppercase tracking-tighter flex items-center gap-1">
                    <img src="/duration-alarm.png" alt="" className="h-5 w-auto object-contain mr-0.5 relative -top-[0.5px]" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                    {survivor.roundDurationLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isSurvivor(survivor.username) && (
            <button 
              onClick={() => toggleFollow(survivor.username)}
              className="transition-all active:scale-95 hover:scale-105"
            >
              {followedUsers.includes(survivor.username) ? (
                <img 
                  src="/btn-following.png" 
                  alt="Following" 
                  className="h-7 w-auto object-contain" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <img 
                  src="/btn-follow.png" 
                  alt="Follow" 
                  className="h-7 w-auto object-contain" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-zinc-50 overflow-hidden relative group">
        <img src={survivor.image} alt="Post content" className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
          {(isHistoryView || isChallengeEnded) && <img src="/duration-alarm.png" alt="" className="h-5 w-auto object-contain mr-0.5 relative -top-[0.5px]" style={{ imageRendering: '-webkit-optimize-contrast' }} />}
          <span className={cn(
            "ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
            isHistoryView 
              ? (survivor.madeIt === false 
                  ? "bg-rose-100 text-rose-600 border border-rose-200" 
                  : (survivor.variant === 'pley' ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-green-100 text-green-600 border border-green-200"))
              : "bg-purple-100 text-purple-600 border border-purple-200"
          )}>
            {isHistoryView 
              ? (survivor.madeIt === false 
                  ? 'TERMINATED' 
                  : (survivor.variant === 'pley' ? 'PLEYED' : 'SURVIVED')) 
              : 'SURVIVOR'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-zinc-100 rounded-full px-2 py-1">
              {survivor.variant !== 'pley' && (
                <button 
                  onClick={() => handleVote(survivor.id, selectedRoundId, 'up')}
                  className={cn(
                    "p-1 transition-all duration-300",
                    survivor.userVote === 'up' && "hover:scale-110"
                  )}
                >
                  <ArrowBigUp 
                    size={24} 
                    fill="white" 
                    stroke={survivor.userVote === 'up' ? "none" : "black"}
                    strokeWidth={survivor.userVote === 'up' ? 0 : 2}
                  />
                </button>
              )}
              <button 
                onClick={() => handleVote(survivor.id, selectedRoundId, 'down')}
                className={cn(
                  "p-1 transition-all duration-300",
                  survivor.userVote === 'down' && "hover:scale-110"
                )}
              >
                <ArrowBigDown 
                  size={24} 
                  fill="white" 
                  stroke={survivor.userVote === 'down' ? "none" : "black"}
                  strokeWidth={survivor.userVote === 'down' ? 0 : 2}
                />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/post/${survivor.id}`)}
                className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors group"
              >
                <MessageCircle size={20} stroke="black" />
              </button>
              <button 
                onClick={() => navigate(`/chat/${survivor.username}`)}
                className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors"
                title="Message"
              >
                <img src="/nav-chat-v3.png" alt="Message" className="h-7 w-7 object-contain" />
              </button>

              {(survivor.survivalTime || !isHistoryView) && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter leading-none">
                    {survivor.variant === 'pley' ? 'PLEYED AT' : 'SURVIVED AT'}
                  </span>
                  <span className="text-[10px] font-black text-zinc-900 mt-0.5">
                    {survivor.survivalTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {survivor.variant === 'pley' && (
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
            <div className="flex items-center gap-1 mb-1">
              <span className="font-black italic text-zinc-900 hover:text-rose-600 transition-colors cursor-pointer">@{survivor.username}</span>
            </div>
            <span className="text-zinc-700 block">{survivor.caption}</span>
          </p>
          
          {survivor.comments.length > 0 && (
            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={12} className="text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Comments</span>
              </div>
              {survivor.comments.slice(0, 2).map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-zinc-200 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black text-zinc-900 hover:text-rose-600 transition-colors cursor-pointer">@{comment.username}</span>
                    </div>
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
                  : "Congratulations to the survivor! This profile has officially passed the universal selection protocol."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const navigate = useNavigate();
  const { 
    isChallengeEnded, survivors, survivorHistory, roundHistory, isActive, 
    startNewChallenge, clearAllHistory, updateHistoryVote, getVariantDisplayName,
    toggleFollow, followedUsers, isLegend, setShowPills, setActiveTab, isSurvivor, t
  } = useChallenge();
  const [selectedDuration, setSelectedDuration] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'hall_of_fame' | 'round_logs'>('round_logs');
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

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
    const base = selectedDuration === 'all' 
      ? allAvailableSurvivors 
      : allAvailableSurvivors.filter(s => s.roundDurationLabel === selectedDuration);
    // Only show winners/survivors, remove terminated players
    return base.filter(s => s.madeIt !== false);
  }, [allAvailableSurvivors, selectedDuration]);

  const displayLogs = useMemo(() => {
    if (selectedDuration === 'all') return roundHistory;
    return roundHistory.filter(r => r.durationLabel === selectedDuration);
  }, [roundHistory, selectedDuration]);

  const isHistoryView = !isChallengeEnded;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-white">
      {/* Header */}
      {!isChallengeEnded && (
      <div className="pl-2 pr-4 py-4 bg-white z-30 flex items-center border-b border-zinc-100">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedRoundId && (
              <button 
                onClick={() => setSelectedRoundId(null)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <ChevronLeft size={32} className="text-zinc-900" />
              </button>
            )}
            
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-3 border-none">
                {selectedRoundId ? (
                  <span className="ml-2">{t('search_header_details')}</span>
                ) : viewMode === 'hall_of_fame' ? (
                  <div className="flex items-center gap-3 -ml-1">
                    <img 
                      src="/guacamole-trophy.png" 
                      alt="" 
                      className="h-20 w-auto object-contain" 
                      style={{ imageRendering: '-webkit-optimize-contrast' }} 
                    />
                    <span>{t('search_header_hall')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-16 ml-1">
                    <img 
                      src="/round-outro-icon.png" 
                      alt="" 
                      className="h-16 w-auto object-contain" 
                      style={{ imageRendering: '-webkit-optimize-contrast' }} 
                    />
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
                      {t('search_recent_outcomes')}
                    </span>
                  </div>
                )}
              </h2>
              {selectedRoundId && selectedRound && (
                <span className="text-sm font-bold text-purple-600 uppercase tracking-widest mt-1 ml-2">
                  {selectedRound.durationLabel} Round • {selectedRound.date}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isActive && (
              <>
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
                {!totalElimination && (
                  <button 
                    onClick={handleJoinNextTask}
                    className="transition-all hover:scale-105 active:scale-95 flex items-center justify-center ml-2"
                  >
                    <img 
                      src="/btn-get-started-v2.png" 
                      alt={t('search_start_round')} 
                      className="h-[40px] w-auto object-contain" 
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Result/History View */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar removed as requested */}

        {isChallengeEnded && totalElimination && (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6 py-12">
              <div className="flex items-center justify-center mx-auto text-rose-600">
                <img src="/elimination-protocol.png" alt="Total P-Termination" className="w-96 h-96 object-contain" />
              </div>
              <div className="space-y-2">
                  <h2 className="text-5xl font-black text-rose-600 tracking-tighter uppercase leading-none">
                    TOTAL P-TERMINATION
                  </h2>
                  <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase">
                    No profiles pleyed this round
                  </p>
                </div>
              </div>
          </div>
        )}

        {(displaySurvivors.length > 0 || displayLogs.length > 0) ? (
          <div className="flex flex-col">
            {!(isChallengeEnded && totalElimination) && (
            <div className={cn(
              "p-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between z-10",
            )}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <img src="/round-trophy.png" alt="" className="w-24 h-24 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-zinc-900 tracking-tight uppercase leading-none flex items-center gap-2">
                    {selectedRoundId 
                      ? (selectedRound?.variant === 'pley' ? 'people that made it' : 'people that survived')
                      : isChallengeEnded ? 'people that survived' : viewMode === 'hall_of_fame' ? 'Hall of Fame' : (
                        <>
                          <img src="/round-history-icon.png" alt="" className="w-12 h-12 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                          Round History
                        </>
                      )}
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 flex items-center">
                    {selectedRoundId && selectedRound ? (
                      <>
                        {selectedRound.survivorCount} {selectedRound.survivorCount === 1 ? 'Person' : 'People'}
                        <span className="ml-1">
                          {selectedRound.variant === 'pley' ? 'Pleyed' : 'Saved'}
                        </span>
                        <VariantPill variant={selectedRound.variant} />
                      </>
                    ) : isChallengeEnded ? (
                      (survivors.length === 1 ? 'The Ultimate Survivor' : `${survivors.length} Profiles Remaining`)
                    ) : viewMode === 'hall_of_fame' ? (
                      `${displaySurvivors.length} Total Winners Displayed`
                    ) : (
                      `${displayLogs.length} Rounds Recorded`
                    )}
                  </p>
                </div>
              </div>
              {/* Join next task button moved to bottom of list */}
            </div>
            )}

            {viewMode === 'hall_of_fame' || isChallengeEnded || selectedRoundId ? (
              <div className="flex-1 space-y-8 py-6">
                {(selectedRoundId ? selectedRound?.survivors?.filter(s => s.madeIt !== false) : displaySurvivors)?.map((survivor, idx) => (
                  <SurvivorRow 
                    key={`${survivor.id}-${idx}`}
                    survivor={survivor}
                    isSurvivor={isSurvivor}
                    toggleFollow={toggleFollow}
                    followedUsers={followedUsers}
                    navigate={navigate}
                  />
                ))}
                
                {isChallengeEnded && !selectedRoundId && (
                  <div className="flex justify-center -mt-4 pt-0 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <button 
                      onClick={handleJoinNextTask}
                      className="hover:scale-105 active:scale-95 transition-transform"
                    >
                      <img src="/btn-join-next-task.png" alt={t('search_join_next')} className="h-12 w-auto object-contain drop-shadow-md" />
                    </button>
                  </div>
                )}
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
                          log.outcome === 'SURVIVAL' ? "bg-green-100" : "bg-zinc-100"
                        )}>
                          {log.outcome === 'SURVIVAL' ? (
                            <img 
                              src="/guacamole-trophy.png" 
                              alt="Survival" 
                              className="h-[24px] w-auto object-contain" 
                              style={{ imageRendering: '-webkit-optimize-contrast' }}
                            />
                          ) : (
                            <img 
                              src="/elimination-protocol.png" 
                              className="h-[36px] w-auto object-contain" 
                              alt="Elimination" 
                              style={{ imageRendering: '-webkit-optimize-contrast' }}
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight mb-0.5">
                            {log.date} • {log.time}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 text-zinc-700 hover:text-zinc-400">
                            {log.outcome === 'SURVIVAL' 
                              ? `${getVariantDisplayName(log.variant)} Success` 
                              : `${getVariantDisplayName(log.variant)} Termination`}
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <img src="/duration-alarm.png" alt="" className="h-5 w-auto object-contain mr-0.5 relative -top-[0.5px]" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                        <span className="text-[9px] font-black text-zinc-900 uppercase">{log.durationLabel} Round</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Outcome</span>
                        <div className="flex items-center mt-0.5">
                          <span className="text-sm font-black text-zinc-900">
                            {log.survivorCount} {log.survivorCount === 1 ? 'Person' : 'People'} {log.variant === 'pley' ? 'Pleyed' : 'Survived'}
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
          (true) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                <img src="/empty-dog.png" alt="Empty" className="w-64 h-auto object-contain animate-in fade-in zoom-in duration-1000" />
              </div>
              <div className="mb-4">
                {isActive ? (
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase mb-2">
                    {t('search_waiting')}
                  </h2>
                ) : (
                  <img src="/nobody-yet.png" alt="NoBody yet" className="w-72 h-auto object-contain mx-auto" />
                )}
              </div>
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
