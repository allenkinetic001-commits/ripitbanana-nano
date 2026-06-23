import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Camera, Search, Info, Sparkles, Users, Skull, Plus, Flame, Clock, X, Calendar, ChevronRight, Trophy, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { useSupabasePosts, createPost, uploadPostMedia, formatPostForUI } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { ProfileHeartsToggle } from '../components/ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';
import EmptyFeed from '../components/Empty';

const HomeUserItem = React.memo(({ user, index, navigate, isSearch = false }: any) => {
  const [showHearts, setShowHearts] = useState(false);
  const { handlers: heartsHandlers } = useLongPress(() => setShowHearts(!showHearts), 400);
  const { followedUsers, toggleFollow, isSurvivor, addEnemy, enemies, userProfile } = useChallenge();
  const isFollowing = followedUsers.includes(user.username);
  const [isTraitor, setIsTraitor] = useState(false);
  const hasActed = enemies.some((e: any) => e.username === user.username);

  const toggleTraitor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTraitor(!isTraitor);
  };

  return (
    <div 
      onClick={() => navigate(`/user/${user.username}`)}
      className="flex items-center p-3 hover:bg-zinc-50 transition-colors w-full text-left cursor-pointer"
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full border border-zinc-200 overflow-hidden bg-zinc-50">
          <img 
            src={user.avatar || "/custom-empty-profile.png"} 
            alt={user.username} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
      <div className="flex-1 ml-3 overflow-hidden">
        <p className="text-sm font-bold text-zinc-900 truncate">
          {user.fullName || `@${user.username}`}
        </p>
        <p className="text-xs text-zinc-500 truncate">
          {user.fullName ? `@${user.username}` : (isSearch ? 'Survivor' : user.caption)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {(isTraitor && !hasActed) ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addEnemy(user);
              setIsTraitor(false);
            }}
            className="animate-pop-in transition-all active:scale-95 flex items-center justify-center p-1"
          >
            <img 
              key="traitor-icon"
              src="/traitor.png" 
              alt="Traitor" 
              className="h-6 w-auto object-contain animate-pop-in" 
            />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            {user.username !== userProfile?.username && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addEnemy(user);
                }}
                className="active:scale-95 drop-shadow-sm"
              >
                {hasActed ? (
                  <img 
                    key="added"
                    src="/btn-added.png" 
                    alt="Added" 
                    className="h-7 w-auto object-contain animate-pop-in"
                  />
                ) : (
                  <img 
                    key="add"
                    src="/add-enemy.png" 
                    alt="Add Enemy" 
                    className="h-8 w-auto object-contain animate-pop-in"
                  />
                )}
              </button>
            )}
            {user.username !== userProfile?.username && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(user.username);
                }}
                className="transition-all active:scale-95 hover:scale-105"
              >
                {isFollowing ? (
                  <img
                    key="following"
                    src="/btn-following.png"
                    alt="Following"
                    className="h-8 w-auto object-contain animate-pop-in"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <img
                    key="follow"
                    src="/btn-follow.png"
                    alt="Follow"
                    className="h-8 w-auto object-contain animate-pop-in"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                )}
              </button>
            )}
          </div>
        )}
        {!hasActed && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              toggleTraitor(e);
            }}
            className="w-20 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-xl hover:bg-zinc-100/50 active:scale-95 touch-none"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-200/40" />
          </div>
        )}
      </div>
    </div>
  );
});

const SurvivorRow = React.memo(({ survivor, isSurvivor, toggleFollow, followedUsers, navigate, handleVote, selectedRoundId, isHistoryView, isChallengeEnded }: any) => {
  const [showHearts, setShowHearts] = useState(false);
  const { handlers: heartsHandlers } = useLongPress(() => setShowHearts(!showHearts), 400);

  const isVideo = survivor.type === 'video' || 
    survivor.image?.startsWith('data:video/') || 
    /\.(mp4|mov|webm|ogg)(\?|$)/i.test(survivor.image || '');

  return (
    <div className="mx-4 mb-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-2xl transition-all text-left">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4" {...heartsHandlers}>
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate(`/user/${survivor.username}`)}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              <img src={survivor.avatar || "/custom-empty-profile.png"} alt={survivor.username} className="w-full h-full object-cover" />
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
              <ProfileHeartsToggle isVisible={showHearts} heartClassName="w-7 h-7" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                {survivor.roundDate ? `${survivor.roundDate} at ${survivor.roundTime}` : survivor.time}
              </span>
              {survivor.roundDurationLabel && (
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  <img src="/duration-alarm.png" alt="" className="h-3 w-auto object-contain" />
                  <span className="text-[8px] text-purple-600 font-black uppercase tracking-tighter">
                    {survivor.roundDurationLabel === '2 min' || survivor.roundDurationLabel === '2 mins' ? '24hrs' : survivor.roundDurationLabel}
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
        {isVideo ? (
          <video 
            src={survivor.image} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-zinc-50" 
            controls 
            loop 
            muted 
            playsInline
            autoPlay
          />
        ) : (
          <img src={survivor.image} alt="Survival Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        
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
            {handleVote && (
              <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/50">
                <button 
                  onClick={() => handleVote(survivor.id, null, 'up')}
                  className={cn("p-1.5 rounded-full transition-all", survivor.userVote === 'up' ? "bg-white shadow-sm scale-110" : "opacity-40 hover:opacity-100")}
                >
                  <ArrowBigUp size={20} fill={survivor.userVote === 'up' ? "#22c55e" : "black"} stroke="none" />
                </button>
                <button 
                  onClick={() => handleVote(survivor.id, null, 'down')}
                  className={cn("p-1.5 rounded-full transition-all", survivor.userVote === 'down' ? "bg-white shadow-sm scale-110" : "opacity-40 hover:opacity-100")}
                >
                  <ArrowBigDown size={20} fill={survivor.userVote === 'down' ? "#ef4444" : "black"} stroke="none" />
                </button>
              </div>
            )}

            <button 
              onClick={() => navigate(`/post/${survivor.id}`)}
              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-10 w-10 rounded-full transition-all active:scale-90"
            >
              <img src="/locator.png" alt="Comment" className="h-5 w-5 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
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

const SearchContent = ({ searchQuery, allPosts, navigate }: { searchQuery: string, allPosts: any[], navigate: any }) => {
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 1) return;
    
    const searchRemote = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      
      if (!error && data) {
        setRemoteUsers(data.map(u => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          avatar: u.avatar_url,
          caption: 'New Citizen', // Fallback for people without posts
          isRemote: true
        })));
      }
      setLoading(false);
    };

    const timer = setTimeout(searchRemote, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const localResults = useMemo(() => {
    return allPosts
      .filter(post => post.username.toLowerCase().includes(searchQuery.toLowerCase()))
      .reduce((acc: any[], current) => {
        if (!acc.find(item => item.username === current.username)) {
          acc.push(current);
        }
        return acc;
      }, []);
  }, [allPosts, searchQuery]);

  // Merge results, prioritizing local ones (they have more data)
  const mergedResults = useMemo(() => {
    const results = [...localResults];
    const seenUsernames = new Set(results.map(r => r.username.toLowerCase()));
    
    remoteUsers.forEach(ru => {
      if (!seenUsernames.has(ru.username.toLowerCase())) {
        results.push(ru);
      }
    });
    return results;
  }, [localResults, remoteUsers]);

  return (
    <div className="p-2 space-y-1">
      {mergedResults.map((user) => (
        <HomeUserItem 
          key={user.id} 
          user={user} 
          navigate={navigate} 
          isSearch={true} 
        />
      ))}
      
      {loading && mergedResults.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-800 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-400">Searching records...</p>
        </div>
      )}

      {!loading && mergedResults.length === 0 && (
        <div className="pt-8 pb-16 text-center space-y-4">
          <div className="flex items-center justify-center mx-auto mb-2">
            <img src="/search-input-icon.png" alt="Not found" className="w-12 h-12 object-contain opacity-30" style={{ imageRendering: '-webkit-optimize-contrast' }} />
          </div>
          <p className="text-sm font-bold text-zinc-400 italic px-6">no people found on that place "@{searchQuery}"</p>
          <p className="text-xs text-zinc-400 px-10">Make sure you spelled the username correctly.</p>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const {
    timeLeft, roundTimeLeft, isActive, clickCounts, eliminationCounts, madeItCounts,
    userSelection, isChallengeEnded, survivors, eliminated,
    isEliminationRoundActive, setIsEliminationRoundActive,
    showPills, setShowPills, activeTab, setActiveTab,
    majorityVariant,
    unreadMessageCount,
    setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
    setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
    setUserSelection, setIsChallengeEnded,
    setSurvivors, addEliminated, startNewChallenge, getVariantDisplayName, userProfile, eliminateSelf,
    allPosts, setAllPosts, wallPosts, addWallPost,
    visiblePosts, setVisiblePosts,
    followedUsers, toggleFollow, isSurvivor, updateHistoryVote,
    language,
    t, postsLoading
  } = useChallenge();

  const handleVote = (survivorId: string | number, roundId: string | null, vote: 'up' | 'down') => {
    const idNum = typeof survivorId === 'number' ? survivorId : parseInt(survivorId, 10);
    if (!isNaN(idNum)) {
      updateHistoryVote(idNum, roundId, vote);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Supabase posts are now managed globally in ChallengeContext
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  useEffect(() => {
    if (allPosts.length > 0) setIsInitialSyncDone(true);
  }, [allPosts.length]);

  // Auto-populate visiblePosts from allPosts when the feed is empty but posts exist.
  // This fixes the bug where a new user logging in sees an empty feed even though
  // other users have posted content — visiblePosts gets reset on login but allPosts
  // is correctly loaded from Supabase.
  useEffect(() => {
    if (visiblePosts.length === 0 && allPosts.length > 0) {
      setVisiblePosts(allPosts);
    }
  }, [allPosts, visiblePosts.length, setVisiblePosts]);



  // New state for upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [captionText, setCaptionText] = useState('');
  const [showMustache, setShowMustache] = useState(true);
  const { setShowBottomNav, showBottomNav } = useOutletContext<{ setShowBottomNav: React.Dispatch<React.SetStateAction<boolean>>; showBottomNav: boolean }>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      setRawFile(file);

      // Instantly preview using an object URL instead of freezing the UI with a huge base64 string
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(objectUrl);
      setUploadModalOpen(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setRawFile(null);
    setCaptionText('');
    setIsUploading(false);
  };

  const handleCreatePost = () => {
    if (!selectedFile || !rawFile) return;
    setIsUploading(true);

    const caption = captionText || (fileType === 'video' ? 'Just uploaded a video! 🎥' : 'Just uploaded a photo! 📸');

    // Save the raw File and local preview before clearing modal state
    const currentRawFile = rawFile;
    const currentSelectedFile = selectedFile;
    
    // Generate a valid UUID v4 robustly (handles insecure contexts where crypto.randomUUID is undefined)
    const generateId = () => {
      const prefix = 'opt-';
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return prefix + crypto.randomUUID();
      }
      return prefix + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    const optimisticId = generateId();

    // Close modal instantly for snappy UX, but keep isUploading true
    setUploadModalOpen(false);
    setSelectedFile(null);
    setRawFile(null);
    setCaptionText('');

    // Optimistically show in local feed using blob preview with real UUID
    createLocalPostFallback(caption, currentSelectedFile, optimisticId);

    // Upload to Storage then insert DB row in background
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          alert('You must be logged in to upload content.');
          // Remove the optimistic post since we are not logged in
          setAllPosts(prev => prev.filter(p => p.id !== optimisticId));
          setVisiblePosts(prev => prev.filter(p => p.id !== optimisticId));
          return;
        }

        // Step 1: Upload file to Supabase Storage
        const { url: storageUrl, error: uploadError } = await uploadPostMedia(session.user.id, currentRawFile);

        if (uploadError || !storageUrl) {
          console.error('Storage upload failed:', uploadError);
          alert('Upload failed: ' + (uploadError?.message || 'Could not upload file'));
          // Remove the optimistic post since upload failed
          setAllPosts(prev => prev.filter(p => p.id !== optimisticId));
          setVisiblePosts(prev => prev.filter(p => p.id !== optimisticId));
          return;
        }

        // Step 2: Insert post row with public storage URL (Do NOT pass optimisticId, let Supabase auto-increment the ID)
        const { data: realPost, error: postError } = await createPost(session.user.id, caption, storageUrl);

        if (postError) {
          console.error('Failed to create post:', postError);
          alert('Post failed: ' + postError.message);
          
          // Remove the optimistic post since it failed
          setAllPosts(prev => prev.filter(p => p.id !== optimisticId));
          setVisiblePosts(prev => prev.filter(p => p.id !== optimisticId));
          return;
        }

        if (realPost) {
          // Swap out the optimistic post for the real post immediately so we don't get duplicates
          const formattedReal = formatPostForUI(realPost);
          
          setAllPosts(prev => {
            // If realtime already inserted the real post, just delete the optimistic one
            if (prev.some(p => String(p.id) === String(realPost.id))) {
              return prev.filter(p => String(p.id) !== String(optimisticId));
            }
            return prev.map(p => String(p.id) === String(optimisticId) ? formattedReal : p);
          });
          
          setVisiblePosts(prev => {
            if (prev.some(p => String(p.id) === String(realPost.id))) {
              return prev.filter(p => String(p.id) !== String(optimisticId));
            }
            return prev.map(p => String(p.id) === String(optimisticId) ? formattedReal : p);
          });
        }
      } catch (err: any) {
        console.error('Error during post creation background task:', err);
        alert('An unexpected error occurred during upload: ' + (err?.message || err));
        // Remove the optimistic post since it failed
        setAllPosts(prev => prev.filter(p => p.id !== optimisticId));
        setVisiblePosts(prev => prev.filter(p => p.id !== optimisticId));
      } finally {
        setIsUploading(false); // Only set false when completely finished
      }
    })();
  };

  // Prevent user from refreshing and cancelling the background upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = ''; // Shows standard browser warning
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const createLocalPostFallback = (caption: string, imageUrl: string, id: string) => {
    const localPost = {
      id: id,
      username: userProfile?.username || 'Guest',
      avatar: userProfile?.avatar || '/custom-empty-profile.png',
      image: imageUrl,
      type: fileType,
      caption,
      likes: 0,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      comments: []
    };
    setAllPosts(prev => [localPost, ...prev]);
    setVisiblePosts(prev => [localPost, ...prev]);
  };

  // Calculate exact unswiped posts during render
  const swipedIds = useMemo(() => new Set([
    ...survivors.map((s: any) => s.id),
    ...eliminated.map((e: any) => e.id)
  ]), [survivors, eliminated]);

  const eliminatedUsernames = useMemo(() => new Set(
    eliminated.map((e: any) => e.username)
  ), [eliminated]);

  const unswipedPosts = useMemo(() => 
    allPosts.filter(p => !swipedIds.has(p.id) && !eliminatedUsernames.has(p.username)),
  [allPosts, swipedIds, eliminatedUsernames]);

  // Deterministic feed synchronization: Ensures the feed always matches new posts minus swiped ones
  useEffect(() => {
    // If challenge ended, feed stays empty
    if (isChallengeEnded) {
      if (visiblePosts.length > 0) setVisiblePosts([]);
      return;
    }
    
    if (allPosts.length === 0) return;

    // Fast and reliable comparison of actual feed content to avoid unnecessary re-renders
    // while ensuring any new or removed posts instantly reflect.
    const visibleSimplified = visiblePosts.map((p: any) => `${p.id}-${p.avatar}-${p.username}-${p.isTraitorGlobal}-${p.globalLives}-${p.comments?.length || 0}`);
    const unswipedSimplified = unswipedPosts.map((p: any) => `${p.id}-${p.avatar}-${p.username}-${p.isTraitorGlobal}-${p.globalLives}-${p.comments?.length || 0}`);
    
    if (JSON.stringify(visibleSimplified) !== JSON.stringify(unswipedSimplified)) {
      setVisiblePosts(unswipedPosts);
    }
  }, [unswipedPosts, visiblePosts, isChallengeEnded]);


  const [showInfo, setShowPillsInfo] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  // Hide pills when navigating away
  useEffect(() => {
    return () => {
      setShowPills(false);
      setActiveTab(null);
    };
  }, [setShowPills, setActiveTab]);

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

  // End challenge if all posts are judged or timer runs out
  // Navigate to results when challenge ends
  // REMOVED auto-navigation to allow viewing end-screen on Home


  const handleTabClick = (tab: string) => {
    if (timeLeft > 0) {
      if (userSelection) return; // Locked
      
      // Immediate submission for active challenge
      setClickCounts(prev => ({
        ...prev,
        [tab]: prev[tab] + 1
      }));

      setVariantFirstClickTime(prev => {
        if (!prev[tab]) return { ...prev, [tab]: Date.now() };
        return prev;
      });
      
      setVariantDurations(prev => {
        if (!prev[tab]) return { ...prev, [tab]: timeLeft };
        return prev;
      });

      setUserSelection(tab);
      setShowPills(false);
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



  const handleDeletePost = (postId: number) => {
    const activeMode = userSelection || majorityVariant;
    
    const eliminatedPost = visiblePosts.find(post => post.id === postId);
    if (eliminatedPost) {
      if (eliminatedPost.username === userProfile?.username) {
        eliminateSelf();
        return;
      }

      addEliminated({
        id: eliminatedPost.id,
        username: eliminatedPost.username,
        avatar: eliminatedPost.avatar,
        image: eliminatedPost.image,
        caption: eliminatedPost.caption,
        time: eliminatedPost.time,
        comments: eliminatedPost.comments,
        madeIt: false
      });
      
      // Wipe out all posts from this user immediately
      setVisiblePosts(prev => prev.filter(post => post.username !== eliminatedPost.username));
    } else {
      setVisiblePosts(prev => prev.filter(post => post.id !== postId));
    }
    
    // Track eliminations for the current active mode
    if (activeMode && Object.prototype.hasOwnProperty.call(eliminationCounts, activeMode)) {
      setEliminationCounts(prev => ({
        ...prev,
        [activeMode]: (prev[activeMode] || 0) + 1
      }));
    }
  };

  const handlePassPost = (postId: number) => {
    const activeMode = userSelection || majorityVariant;

    const passedPost = visiblePosts.find(p => p.id === postId);
    setVisiblePosts(prev => prev.filter(post => post.id !== postId));
    
    // Add to survivors list if they passed
    if (passedPost) {
      setSurvivors(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        if (existingIds.has(passedPost.id)) return prev;
        return [...prev, { 
          id: passedPost.id,
          username: passedPost.username, 
          avatar: passedPost.avatar,
          image: passedPost.image,
          caption: passedPost.caption,
          time: passedPost.time,
          comments: passedPost.comments,
          madeIt: true
        }];
      });
    }

    // Track "made it" for the current active mode
    if (activeMode && Object.prototype.hasOwnProperty.call(madeItCounts, activeMode)) {
      setMadeItCounts(prev => ({
        ...prev,
        [activeMode]: (prev[activeMode] || 0) + 1
      }));
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      {/* Upload Post Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
              <img 
                src="/modal-new-post.png" 
                alt={t('home_upload_modal_title')} 
                className="h-6 w-auto object-contain ml-2"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Media Preview */}
              <div id="preview-container" className="aspect-square w-full bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden relative min-h-[300px]">
                {!selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                    <span className="text-white/30 text-xs">Loading preview...</span>
                  </div>
                ) : fileType === 'video' ? (
                  <video 
                    src={selectedFile} 
                    className="w-full h-full object-contain relative z-20" 
                    controls 
                    autoPlay 
                    muted 
                    loop 
                  />
                ) : (
                  <img 
                    src={selectedFile} 
                    alt="Preview" 
                    className="w-full h-full object-contain relative z-20" 
                  />
                )}
              </div>

              {/* Caption Input */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 bg-zinc-50">
                  <img 
                    src={userProfile?.avatar || "/custom-empty-profile.png"} 
                    alt={userProfile?.username || "Me"} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <textarea
                  placeholder={t('home_upload_caption_placeholder')}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-zinc-100 bg-white rounded-b-3xl shrink-0 flex items-center justify-end gap-4">
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="px-6 py-2 rounded-full text-sm font-bold text-zinc-400 hover:bg-zinc-100 transition-all disabled:opacity-50"
              >
                {t('home_upload_cancel')}
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isUploading}
                className="transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center relative min-w-[80px] h-9"
              >
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl backdrop-blur-[2px] z-10">
                    <div className="w-5 h-5 rounded-full border-[3px] border-red-500/20 border-t-red-600 animate-spin shadow-sm" />
                  </div>
                ) : null}
                <img 
                  src="/btn-post-modal.png" 
                  alt={t('home_upload_post')} 
                  className={cn(
                    "h-9 w-auto object-contain drop-shadow-md transition-all duration-300", 
                    isUploading && "grayscale opacity-80"
                  )}
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={() => setShowPillsInfo(false)}
          />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Decorative doodle background pattern — ultra-faint, WhatsApp-style */}
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: "url('/solo.png')",
                backgroundSize: '340px auto',
                backgroundRepeat: 'repeat',
                backgroundPosition: '10px 8px',
                mixBlendMode: 'multiply',
                opacity: 0.10,
                transform: 'rotate(-2deg) scale(1.2)',
                transformOrigin: 'center center',
              }}
            />
            <div className="p-6 border-b border-zinc-100/50 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/nav-news-v3.png" 
                    alt="" 
                    className="w-full h-full object-contain" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </div>
                <img src="/ripit-rules-header.png" alt="Rip It Rules" className="h-10 w-auto object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
              </div>
              <button 
                onClick={() => setShowPillsInfo(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto relative z-10">
              <div className="flex flex-col gap-4">
                <p className="text-base text-zinc-800 leading-relaxed font-bold italic border-l-4 border-red-600 pl-4 py-4 bg-zinc-50 rounded-r-2xl">
                  RIPIT is a global social media platform where users post any content and compete to survive for 24 hours based on audience reactions, where higher support keeps them in the network, lower performance leads to elimination for that round, and survivors gain survival, visibility, and importantly status as they continue competing daily.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 flex justify-center relative z-10">
              <button 
                onClick={() => setShowPillsInfo(false)}
                className="transition-all hover:scale-105 active:scale-95"
              >
                <img src="/understood-button.png" alt="Understood" className="h-[48px] w-auto object-contain drop-shadow-sm" style={{ imageRendering: '-webkit-optimize-contrast' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 flex flex-col">
        <div className="px-4 py-3 min-h-[4rem] flex items-center justify-between relative overflow-hidden bg-[#F9F9FB]">
          {/* Decorative background pattern */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/doodle-pattern-colored.png')",
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'center',
              opacity: 0.1, // 8-10% opacity
            }}
          />
          
          <div className="flex items-center gap-0 relative z-10">
            <button 
              onClick={() => setShowMustache(!showMustache)}
              className="transition-all active:scale-95 flex items-center gap-0"
              title="Toggle Menu"
            >
              <img src="/header-logo-hydrant.png" alt="Logo" className="h-[60px] w-auto object-contain" />
            </button>
            <Link 
              to="/" 
              className="transition-all active:scale-95"
              onClick={() => {
                setShowBottomNav(prev => !prev);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img 
                src="/header-logo-text.png" 
                alt="RipIt" 
                className="h-6 w-auto object-contain ml-0 mt-1" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </Link>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => {
                setActiveTab('pley');
                setShowPills(!showPills);
              }}
              className="relative flex items-center justify-center transition-opacity hover:opacity-80 active:scale-95 w-[44px] h-[44px]"
            >
              <img 
                key={showPills ? 'mustache-active' : 'mustache-inactive'}
                src={showPills ? "/nav-mustache-active.png" : "/nav-mustache.png"}
                alt="Create" 
                className="h-[44px] w-[44px] object-contain transition-all duration-200 animate-pop-in"
                style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
              />
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="text-zinc-700 hover:text-zinc-400 transition-colors relative"
            >
              <img src="/nav-chat-v3.png" alt="Chat" className="h-[38px] w-[38px] object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
              {unreadMessageCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white animate-pop-in">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </div>
              )}
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              <img src="/nav-camera-v3.png" alt="Camera" className="h-[38px] w-[38px] object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*,video/*" 
            />
            <button 
              className="flex items-center justify-center transition-all active:scale-90 hover:opacity-70"
              onClick={() => setShowPillsInfo(true)}
            >
              <img src="/nav-news-v3.png" alt="News" className="h-[38px] w-[38px] object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
            </button>
            <button 
              className="text-zinc-700 transition-all active:scale-90 hover:opacity-70"
              onClick={() => {
                setShowSearchModal(true);
                setShowBottomNav(false);
              }}
            >
              <img src="/header-search-v3.png" alt="Search" className="h-[26px] w-[26px] object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
            </button>
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center pt-10 px-4">
            <div 
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => {
                setShowSearchModal(false);
                setShowBottomNav(true);
                setSearchQuery('');
              }}
            />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 border-b border-zinc-100 flex items-center gap-2">
                <img 
                  src="/search-input-icon.png" 
                  alt="" 
                  className="h-7 w-auto object-contain opacity-50" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
                <div className="flex-1 relative flex items-center">
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-zinc-900 font-medium placeholder:text-transparent"
                  />
                  {!searchQuery && (
                    <img 
                      src="/search-placeholder.png" 
                      alt="" 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[35px] w-auto object-contain pointer-events-none opacity-40 ml-1" 
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowBottomNav(true);
                    setSearchQuery('');
                  }}
                  className="transition-all active:scale-95 hover:opacity-70 px-2"
                >
                  <img src="/search-cancel-text.png" alt="Cancel" className="h-[20px] w-auto object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {searchQuery ? (
                  <SearchContent searchQuery={searchQuery} allPosts={allPosts} navigate={navigate} />
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <img src="/search-chair-final.png" alt="Empty Chair" className="w-32 h-auto mx-auto object-contain mb-4" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                    <div className="space-y-1">
                      <img src="/search-header-text.png" alt="Find people" className="h-10 w-auto mx-auto object-contain mb-2" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                      <p className="text-sm text-zinc-400">Type a username to search through the elite who survived the Rip It rounds.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Setup Container - Simplified for Pley-only */}
        {showPills && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-zinc-50/50 rounded-[2rem] border border-zinc-100 p-4 space-y-5 shadow-sm">
              {/* Asset Section */}
              <div className="flex items-center justify-center relative w-full h-[52px]">
                <img src="/pley-challenge-logo.png" alt="Challenge House" className="h-[48px] w-auto object-contain absolute left-0 opacity-80" />
                <img src="/pley-challenge-car.png" alt="Challenge Car" className="h-[52px] w-auto object-contain relative z-10" />
                <img src="/pley-challenge-garage.png" alt="Challenge Garage" className="h-[50px] w-auto object-contain absolute right-0 opacity-80" />
              </div>

              <div className="h-px w-full bg-zinc-100/80" />

              {/* Start Button at Top for Visibility */}
              <div className="flex flex-col items-center justify-center w-full">
                <button
                  onClick={() => {
                    if (isEliminationRoundActive) return;
                    startNewChallenge();
                    setUserSelection('pley');
                    setClickCounts(prev => ({
                      ...prev,
                      ['pley']: (prev['pley'] || 0) + 1
                    }));
                    setVisiblePosts(allPosts);
                  }}
                  disabled={isEliminationRoundActive}
                  className={cn(
                    "mt-2 transition-transform flex items-center justify-center",
                    !isEliminationRoundActive && "hover:scale-105 active:scale-95"
                  )}
                >
                  <img 
                    src={isEliminationRoundActive ? "/btn-submitted.png" : "/btn-start-elimination.png"}
                    alt={isEliminationRoundActive ? "Submitted" : "Start Elimination"}
                    className="h-10 w-auto object-contain drop-shadow-md" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </button>
                {isEliminationRoundActive && (
                  <div className="text-[10px] font-black text-rose-600 font-mono mt-1.5 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shadow-sm animate-pulse">
                    <span>ROUND ENDS IN:</span>
                    <span>{(() => {
                      const m = Math.floor(roundTimeLeft / 60);
                      const s = roundTimeLeft % 60;
                      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    })()}</span>
                  </div>
                )}
              </div>

              {/* Automated Cycle UI */}
              {activeTab && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Calendar Card */}
                    <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex flex-col items-center justify-center space-y-2 group hover:border-purple-200 transition-colors">
                      <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <img src="/calendar-pizza.png" alt="Calendar" className="w-[44px] h-[44px] object-contain" />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest block">{t('home_calendar')}</span>
                        <span className="text-sm font-black text-zinc-900 leading-tight">
                          {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Timer Card */}
                    <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex flex-col items-center justify-center space-y-2 relative overflow-hidden group hover:border-purple-200 transition-colors">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full -mr-8 -mt-8" />
                      <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                        <img src="/reshuffle-keys.svg" alt="Reshuffle" className="w-[56px] h-[56px] object-contain" />
                      </div>
                      <div className="text-center relative z-10">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{t('home_next_reshuffle')}</span>
                        <span className="text-sm font-black text-zinc-900 leading-tight font-mono mt-0.5 block">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-4">
                      <img src="/alligator-logo.png" alt="Croc" className="h-[64px] w-auto object-contain mt-8" />
                      <img src="/worse-than-death.png" alt="Worse Than Death" className="h-[64px] w-auto object-contain" />
                    </div>
                    
                    <div className="flex justify-center items-center gap-8 -mt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-rose-600">
                          {Object.values(eliminationCounts).reduce((a, b) => a + b, 0)}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Eliminated</span>
                      </div>
                      <div className="w-px h-6 bg-zinc-200" />
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-green-600">
                          {survivors.length}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Survived</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-zinc-100/80" />

                    <div className="flex items-center justify-center w-full px-6 text-center">
                      <p className="text-[11px] font-bold text-zinc-500 italic leading-relaxed">
                        Round reshuflled automatically at midnight.<br/>All survivors archived to Hall of Fame.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-20' : 'pb-0'}`}>
        {postsLoading && allPosts.length === 0 ? (
          /* ── Loading state ── */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Loading...</p>
          </div>
        ) : isChallengeEnded ? (
          /* ── Universal Selection Ended / Victory Screen ── */
          <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-1000 px-6 text-center pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-100/30 blur-[100px] rounded-full -z-10" />
            
            <div className="space-y-6 mb-12 animate-in slide-in-from-top-12 duration-1000">
              <div className="relative inline-block">
                <img 
                  src="/the-end.png" 
                  alt={t('home_the_end')} 
                  className="h-24 w-auto object-contain mx-auto relative z-10" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
                <div className="absolute -inset-4 bg-white/50 blur-xl rounded-full -z-10" />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-[3px] w-32 bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
                <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">
                  Selection Complete
                </h2>
                <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">
                  You Survived the Universal Rounds
                </p>
              </div>
            </div>

            {survivors.length > 0 ? (
              <div className="w-full max-w-sm mb-12 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/guacamole-trophy.png" 
                      alt="Survival" 
                      className="h-6 w-auto object-contain" 
                      style={{ imageRendering: '-webkit-optimize-contrast' }} 
                    />
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Hall of Fame</span>
                  </div>
                  <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                    {survivors.length} SURVIVORS
                  </span>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto w-full pr-1 scrollbar-thin">
                  {survivors.slice(0, 10).map((survivor) => (
                    <SurvivorRow 
                      key={`survivor-${survivor.id}`} 
                      survivor={{ ...survivor, madeIt: true }} 
                      isSurvivor={isSurvivor}
                      toggleFollow={toggleFollow}
                      followedUsers={followedUsers}
                      navigate={navigate}
                      handleVote={handleVote}
                      selectedRoundId={null}
                      isHistoryView={true}
                      isChallengeEnded={false}
                    />
                  ))}
                  {survivors.length > 10 && (
                    <div className="p-4 text-center">
                      <button 
                        onClick={() => navigate('/search')}
                        className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline"
                      >
                        View All {survivors.length} in Public Gallery
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : eliminated.length > 0 && (
              /* ── TOTAL TERMINATION STATE ── */
              <div className="w-full max-w-sm mb-12 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
                <div className="bg-rose-50/80 backdrop-blur-md rounded-[2.5rem] border border-rose-100 p-8 shadow-2xl overflow-hidden group text-center">
                  <div className="relative mb-6">
                    <Skull size={48} className="text-rose-500 mx-auto drop-shadow-lg" />
                    <div className="absolute inset-0 bg-rose-200/20 blur-xl rounded-full -z-10" />
                  </div>
                  <h3 className="text-2xl font-black text-rose-600 uppercase tracking-tighter italic mb-2">
                    {t('search_total_termination')}
                  </h3>
                  <p className="text-rose-400 font-black uppercase tracking-[0.3em] text-[9px]">
                    No One Made It Out Alive
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000 delay-700">
              <button
                onClick={() => navigate('/search')}
                className="group relative transition-all active:scale-95 px-5 py-2.5 bg-white border border-zinc-100 rounded-full flex items-center gap-2 shadow-sm hover:bg-zinc-50 hover:border-zinc-200"
              >
                <Trophy size={14} className="text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">View Results</span>
                <ChevronRight size={14} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  startNewChallenge();
                  setVisiblePosts(allPosts);
                  setActiveTab('pley');
                  setShowPills(false);
                }}
                className="transition-all hover:scale-105 active:scale-95"
              >
                <img 
                  src="/artisan-lobster.png" 
                  alt="New Round" 
                  className="h-28 w-auto object-contain drop-shadow-lg" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </button>
            </div>
          </div>
        ) : (visiblePosts.length > 0 || unswipedPosts.length > 0) ? (
          /* ── Posts feed ── */
          (visiblePosts.length > 0 ? visiblePosts : unswipedPosts).map((post) => (
            <PostCard 
              key={post.id} 
              {...post} 
              gameMode={isEliminationRoundActive ? (userSelection || majorityVariant || 'pley') : null}
              onDelete={() => handleDeletePost(post.id)}
              onPass={() => handlePassPost(post.id)}
            />
          ))
        ) : (
          /* ── Empty feed ── */
          <EmptyFeed 
            className="min-h-[60vh]"
            title={allPosts.length === 0 ? "It's Quiet Here" : "All Caught Up"}
            subtitle={allPosts.length === 0 ? "No posts have been made yet" : "You have swiped all available posts"}
            actionButton={
              allPosts.length === 0 ? (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="transition-all active:scale-95 hover:scale-105"
                >
                  <img 
                    src="/btn-post-first.png" 
                    alt="Post First" 
                    className="h-14 w-auto object-contain drop-shadow-md" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </button>
              ) : undefined
            }
          />
        )}
      </main>
    </div>
  );
};

export default Home;
