import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Camera, Search, Info, Sparkles, Users, Skull, Plus, Flame, Clock, X, MessageCircle } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import ChallengeTimer from '../components/ChallengeTimer';
import { posts } from '../data/posts';
import { cn } from '../utils';

const Home = () => {
  const navigate = useNavigate();
  const {
    timeLeft, isActive, clickCounts, eliminationCounts, madeItCounts,
    userSelection, isChallengeEnded, survivors,
    showPills, setShowPills, activeTab, setActiveTab,
    kightRankingVotes, userKightRanking, hasVotedKightRanking,
    majorityVariant, majorityRankingRule,
    setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
    setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
    setUserSelection, setIsChallengeEnded, setKightRankingVotes,
    setKightFirstRankingVoteTime, setUserKightRanking, setHasVotedKightRanking,
    setSurvivors, startNewChallenge, getVariantDisplayName, userProfile,
    allPosts, setAllPosts, wallPosts, addWallPost,
    visiblePosts, setVisiblePosts,
    t
  } = useChallenge();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New state for upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [captionText, setCaptionText] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSelectedFile(fileUrl);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      setUploadModalOpen(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setCaptionText('');
  };

  const handleCreatePost = () => {
    if (!selectedFile) return;

    const newPost = {
      id: Date.now(),
      username: userProfile.username,
      avatar: userProfile.avatar,
      image: selectedFile,
      type: fileType,
      caption: captionText || (fileType === 'video' ? 'Just uploaded a video! 🎥' : 'Just uploaded a photo! 📸'),
      likes: 0,
      time: 'Just now',
      comments: []
    };
    
    setAllPosts(prev => [newPost, ...prev]);
    setVisiblePosts(prev => [newPost, ...prev]);
    
    // Reset and close
    setUploadModalOpen(false);
    setSelectedFile(null);
    setCaptionText('');
  };

  // Sync visible posts with master list when starting a round or on mount
  useEffect(() => {
    if (!isActive && !isChallengeEnded) {
      setVisiblePosts(allPosts);
    }
  }, [allPosts, isActive, isChallengeEnded]);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [showInfo, setShowPillsInfo] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kightWarning, setKightWarning] = useState<string | null>(null);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // Sync pills visibility with global state and selection
  useEffect(() => {
    if (userSelection || isActive) {
      setShowPills(false);
    }
  }, [userSelection, isActive, setShowPills]);

  // Helper to generate a random 4-digit number
  // const getRandomNumber = () => Math.floor(1000 + Math.random() * 9000);

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
  useEffect(() => {
    if (isActive && !isChallengeEnded) {
      const activeMode = userSelection || majorityVariant;
      
      // Kight specific completion logic: Round ends when remaining posts match the Top N rule
      if (activeMode === 'kight' && majorityRankingRule) {
        const topN = parseInt(majorityRankingRule.replace('Top ', ''));
        // We only auto-end if it's strictly LESS than topN (e.g. timeout or accidental double click)
        // or if it's 0. If it's EQUAL to topN, we let the user click to trigger the end.
        if (visiblePosts.length < topN || (visiblePosts.length === 0)) {
          const remainingSurvivors = visiblePosts.map(p => ({ 
            id: p.id,
            username: p.username, 
            avatar: p.avatar,
            image: p.image,
            caption: p.caption,
            time: p.time,
            comments: p.comments
          }));
          
          setSurvivors(prev => {
            // Only add those not already in survivors to avoid duplicates
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = remainingSurvivors.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueNew];
          });
          
          setMadeItCounts(prev => ({
            ...prev,
            kight: (prev.kight || 0) + remainingSurvivors.length
          }));

          setIsActive(false);
          setIsChallengeEnded(true);
          setTimeLeft(0);
          return;
        }
      }

      if (visiblePosts.length === 0) {
        setIsActive(false);
        setIsChallengeEnded(true);
        setTimeLeft(0);
      } else if (timeLeft === 0 && isActive) {
        // Timer ran out logic is now handled in ChallengeContext
        setIsActive(false);
        setIsChallengeEnded(true);
      }
    }
  }, [visiblePosts.length, isActive, isChallengeEnded, timeLeft, setSurvivors, setIsActive, setIsChallengeEnded, setTimeLeft, userSelection, majorityVariant, setMadeItCounts, majorityRankingRule]);

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

  const adjustTime = (type: 'h' | 'm', amount: number) => {
    if (type === 'h') {
      setHours(prev => Math.max(0, prev + amount));
    } else {
      setMinutes(prev => {
        const next = prev + amount;
        if (next >= 60) {
          setHours(h => h + 1);
          return 0;
        }
        if (next < 0 && hours > 0) {
          setHours(h => h - 1);
          return 45;
        }
        return Math.max(0, next);
      });
    }
  };

  const handleDeletePost = (postId: number) => {
    const activeMode = userSelection || majorityVariant;
    
    // Kight specific: prevent deletion if we are already at the Top N limit
    if (activeMode === 'kight' && majorityRankingRule) {
      const topN = parseInt(majorityRankingRule.replace('Top ', ''));
      if (visiblePosts.length <= topN) {
        setKightWarning(`Only ${topN} remain since you set it on ${majorityRankingRule}`);
        
        // Add remaining posts to survivors before ending
        const remainingSurvivors = visiblePosts.map(p => ({ 
          id: p.id,
          username: p.username, 
          avatar: p.avatar,
          image: p.image,
          caption: p.caption,
          time: p.time,
          comments: p.comments
        }));
        
        setSurvivors(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = remainingSurvivors.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        });

        // Update MadeIt counts
        if (activeMode && Object.prototype.hasOwnProperty.call(madeItCounts, activeMode)) {
          setMadeItCounts(prev => ({
            ...prev,
            [activeMode]: (prev[activeMode] || 0) + remainingSurvivors.length
          }));
        }

        // Auto-end the game after a short delay so they see the message
        setTimeout(() => {
          setIsActive(false);
          setIsChallengeEnded(true);
          setTimeLeft(0);
          setKightWarning(null);
        }, 2000);
        return;
      }
    }

    setVisiblePosts(prev => prev.filter(post => post.id !== postId));
    
    // Track eliminations for the current active mode
    if (activeMode && Object.prototype.hasOwnProperty.call(eliminationCounts, activeMode)) {
      setEliminationCounts(prev => ({
        ...prev,
        [activeMode]: prev[activeMode] + 1
      }));
    }
  };

  const handlePassPost = (postId: number) => {
    const activeMode = userSelection || majorityVariant;

    // Kight specific: end game if we are already at the Top N limit
    if (activeMode === 'kight' && majorityRankingRule) {
      const topN = parseInt(majorityRankingRule.replace('Top ', ''));
      if (visiblePosts.length <= topN) {
        setKightWarning(`Only ${topN} remain since you set it on ${majorityRankingRule}`);
        
        // Add remaining posts to survivors before ending
        const remainingSurvivors = visiblePosts.map(p => ({ 
          id: p.id,
          username: p.username, 
          avatar: p.avatar,
          image: p.image,
          caption: p.caption,
          time: p.time,
          comments: p.comments
        }));
        
        setSurvivors(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = remainingSurvivors.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        });

        // Update MadeIt counts
        if (activeMode && Object.prototype.hasOwnProperty.call(madeItCounts, activeMode)) {
          setMadeItCounts(prev => ({
            ...prev,
            [activeMode]: (prev[activeMode] || 0) + remainingSurvivors.length
          }));
        }

        setTimeout(() => {
          setIsActive(false);
          setIsChallengeEnded(true);
          setTimeLeft(0);
          setKightWarning(null);
        }, 2000);
        return;
      }
    }

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
          comments: passedPost.comments
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <h2 className="text-lg font-bold font-serif text-zinc-900">{t('home_upload_modal_title')}</h2>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Media Preview */}
              <div className="w-full bg-zinc-100 rounded-xl overflow-hidden relative max-h-[40vh]">
                {fileType === 'video' ? (
                  <video 
                    src={selectedFile!} 
                    className="w-full h-full object-contain bg-black" 
                    controls 
                    autoPlay
                    loop
                    muted
                  />
                ) : (
                  <img 
                    src={selectedFile || ''} 
                    alt="Preview" 
                    className="w-full h-full object-contain bg-zinc-100" 
                  />
                )}
              </div>

              {/* Caption Input */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200">
                  <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover" />
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
            <div className="p-4 border-t border-zinc-100 bg-white rounded-b-3xl shrink-0 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-full text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
              >
                {t('home_upload_cancel')}
              </button>
              <button
                onClick={handleCreatePost}
                className="px-6 py-2 rounded-full text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
              >
                {t('home_upload_post')}
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
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Info size={18} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-black font-serif text-zinc-900">Rip It Rules</h2>
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
            <h1 className="text-xl font-bold font-serif">RipIt</h1>
          </div>
          <div className="flex items-center gap-4">
            <ChallengeTimer />
            {!isChallengeEnded && (
              <button 
                onClick={() => {
                  if (showPills) {
                    setActiveTab(null);
                  }
                  setShowPills(!showPills);
                }}
                className="flex items-center justify-center w-6 h-6 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-all active:scale-90 shadow-sm"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            )}
            <button 
              onClick={() => navigate('/chat')}
              className="text-zinc-700 hover:text-purple-600 transition-colors"
            >
              <MessageCircle size={24} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-700 hover:text-purple-600 transition-colors"
            >
              <Camera size={24} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*,video/*" 
            />
            <button 
              className="text-zinc-700 hover:text-purple-600 transition-colors"
              onClick={() => setShowPillsInfo(true)}
            >
              <Info size={24} />
            </button>
            <button 
              className="text-zinc-700 hover:text-purple-600 transition-colors"
              onClick={() => setShowSearchModal(true)}
            >
              <Search size={24} />
            </button>
          </div>
        </div>
        
        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center pt-20 px-4">
            <div 
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery('');
              }}
            />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
                <Search size={20} className="text-zinc-400" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-zinc-900 font-medium placeholder:text-zinc-400"
                />
                <button 
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="text-zinc-400 hover:text-zinc-900 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {searchQuery ? (
                  <div className="p-2 space-y-1">
                    {allPosts
                      .filter(post => 
                        post.username.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .reduce((acc: any[], current) => {
                        const x = acc.find(item => item.username === current.username);
                        if (!x) {
                          return acc.concat([current]);
                        } else {
                          return acc;
                        }
                      }, [])
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setShowSearchModal(false);
                            setSearchQuery('');
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-2xl transition-all group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-100 group-hover:scale-105 transition-transform shrink-0">
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-bold text-zinc-900 truncate">@{user.username}</p>
                            <p className="text-xs text-zinc-400 truncate">Survivor</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-purple-600 group-hover:bg-purple-50 transition-all">
                            <Users size={16} />
                          </div>
                        </button>
                      ))
                    }
                    {allPosts.filter(post => post.username.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="py-12 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mx-auto text-zinc-300">
                          <Search size={24} />
                        </div>
                        <p className="text-sm font-medium text-zinc-400 italic">No survivors found matching "@{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center mx-auto text-purple-400">
                      <Sparkles size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-900 font-bold">Find Survivors</p>
                      <p className="text-sm text-zinc-400">Type a username to search through the elite who survived the Rip It rounds.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-header Navigation */}
        <div className="px-6 pt-0 pb-1 flex items-end justify-between gap-6 relative">
          {showPills && !isChallengeEnded ? (
            <>
              {/* Pley Pill Container */}
               <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px] relative group">
                 <div className="h-[48px] flex flex-col items-center justify-end w-full">
                   {/* Variant Label or Majority Badge */}
                   {majorityVariant === 'pley' && timeLeft > 0 ? (
                     <div className="flex flex-col items-center gap-1 w-full">
                       {eliminationCounts.pley > 0 && (
                         <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                           <Skull size={10} className="text-rose-500 fill-rose-500" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{eliminationCounts.pley}</span>
                             {t('home_eliminated')}
                           </span>
                         </div>
                       )}
                       {madeItCounts.pley > 0 && (
                        <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100 shadow-[0_2px_10px_-3px_rgba(22,163,74,0.2)] animate-slide-in w-fit">
                          <Sparkles size={10} className="text-green-500 fill-green-500" />
                          <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                            <span className="mr-1">{madeItCounts.pley}</span>
                            {t('home_survivors')}
                          </span>
                        </div>
                      )}
                       <div className="flex items-center gap-1 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse w-fit">
                         <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                         <span className="text-[9px] font-black font-serif text-amber-700 uppercase tracking-tight leading-none">{t('home_majority')}</span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-purple-200 shadow-[0_4px_15px_-3px_rgba(147,51,234,0.1)] animate-float">
                       <Sparkles size={12} className="text-purple-500 fill-purple-500" />
                       <span className="text-[10px] font-black font-serif bg-gradient-to-r from-purple-600 via-purple-400 to-zinc-900 bg-clip-text text-transparent tracking-tight leading-none whitespace-nowrap">
                         {t('home_choose_variant')}
                       </span>
                     </div>
                   )}
                 </div>
                 
                 <button 
                   onClick={() => handleTabClick('pley')}
                   className={`w-full py-3 border-2 rounded-2xl text-center text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-500 relative overflow-hidden group/pill ${
                     activeTab === 'pley' 
                       ? 'bg-orange-600 border-orange-500 text-white shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] scale-105 translate-y-[-4px]' 
                       : userSelection === 'pley'
                         ? 'bg-orange-50 border-orange-200 text-orange-600'
                         : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-orange-300 hover:bg-orange-50/30 hover:text-orange-500 hover:translate-y-[-2px]'
                   } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                 >
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/pill:translate-x-[100%] transition-transform duration-1000" />
                   <span className="relative z-10 flex items-center justify-center gap-2">
                     {activeTab === 'pley' && <Flame size={12} className="animate-pulse" />}
                     Pley
                   </span>
                   {timeLeft > 0 && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2">
                       <span className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-sm">
                         {clickCounts.pley}
                       </span>
                     </div>
                   )}
                 </button>
               </div>

               {/* Vause Pill */}
               <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px] relative group">
                 <div className="h-[48px] flex flex-col items-center justify-end w-full">
                   {timeLeft > 0 && (
                     <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800 shadow-lg group/total cursor-help mb-1 animate-slide-in">
                       <Users size={10} className="text-zinc-400" />
                       <span className="text-[9px] font-black text-white leading-none">
                         {Object.values(clickCounts).reduce((a, b) => a + b, 0)}
                       </span>
                     </div>
                   )}
                   {majorityVariant === 'vause' && timeLeft > 0 ? (
                     <div className="flex flex-col items-center gap-1 w-full">
                       {eliminationCounts.vause > 0 && (
                         <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                           <Skull size={10} className="text-rose-500 fill-rose-500" />
                           <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                             <span className="mr-1">{eliminationCounts.vause}</span>
                             {t('home_eliminated')}
                           </span>
                         </div>
                       )}
                       {madeItCounts.vause > 0 && (
                        <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100 shadow-[0_2px_10px_-3px_rgba(22,163,74,0.2)] animate-slide-in w-fit">
                          <Sparkles size={10} className="text-green-500 fill-green-500" />
                          <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                            <span className="mr-1">{madeItCounts.vause}</span>
                            {t('home_survivors')}
                          </span>
                        </div>
                      )}
                       <div className="flex items-center gap-1 bg-amber-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse w-fit">
                         <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                         <span className="text-[9px] font-black font-serif text-amber-700 uppercase tracking-tight leading-none">{t('home_majority')}</span>
                       </div>
                     </div>
                   ) : null}
                 </div>
                 <button 
                   onClick={() => handleTabClick('vause')}
                   className={`w-full py-3 border-2 rounded-2xl text-center text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-500 relative overflow-hidden group/pill ${
                     activeTab === 'vause' 
                       ? 'bg-purple-600 border-purple-500 text-white shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)] scale-105 translate-y-[-4px]' 
                       : userSelection === 'vause'
                         ? 'bg-purple-50 border-purple-200 text-purple-600'
                         : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-purple-300 hover:bg-purple-50/30 hover:text-purple-500 hover:translate-y-[-2px]'
                   } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                 >
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/pill:translate-x-[100%] transition-transform duration-1000" />
                   <span className="relative z-10 flex items-center justify-center gap-2">
                     {activeTab === 'vause' && <Sparkles size={12} className="animate-spin-slow" />}
                     VAUSE
                   </span>
                   {timeLeft > 0 && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2">
                       <span className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-sm">
                         {clickCounts.vause}
                       </span>
                     </div>
                   )}
                </button>
              </div>

              {/* Kight Pill */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px] relative group">
                <div className="h-[48px] flex flex-col items-center justify-end w-full">
                  {majorityVariant === 'kight' && timeLeft > 0 ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                      {eliminationCounts.kight > 0 && (
                        <div className="flex items-center gap-1.5 bg-rose-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] animate-slide-in w-fit">
                          <Skull size={10} className="text-rose-500 fill-rose-500" />
                          <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                            <span className="mr-1">{eliminationCounts.kight}</span>
                            {t('home_eliminated')}
                          </span>
                        </div>
                      )}
                      {madeItCounts.kight > 0 && (
                        <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100 shadow-[0_2px_10px_-3px_rgba(22,163,74,0.2)] animate-slide-in w-fit">
                          <Sparkles size={10} className="text-green-500 fill-green-500" />
                          <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter leading-none whitespace-nowrap">
                            <span className="mr-1">{madeItCounts.kight}</span>
                            {t('home_survivors')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <button 
                  onClick={() => handleTabClick('kight')}
                  className={`w-full py-3 border-2 rounded-2xl text-center text-[11px] uppercase tracking-[0.2em] font-black transition-all duration-500 relative overflow-hidden group/pill ${
                    activeTab === 'kight' 
                      ? 'bg-amber-500 border-amber-400 text-white shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] scale-105 translate-y-[-4px]' 
                      : userSelection === 'kight'
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 hover:border-amber-300 hover:bg-amber-50/30 hover:text-amber-500 hover:translate-y-[-2px]'
                  } ${userSelection && timeLeft > 0 ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/pill:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {activeTab === 'kight' && <Users size={12} className="animate-bounce" />}
                    Kight
                  </span>
                  {timeLeft > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <span className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-sm">
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
        {showPills && activeTab && (
          <div className="px-6 pb-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-purple-600" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('home_set_duration')}</span>
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
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('home_select_ranking')}</span>
                  </div>
                  {majorityRankingRule && (
                    <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">{t('home_majority')}: {majorityRankingRule}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{t('home_select_rule')}</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-zinc-900 leading-none">Top {userKightRanking}</span>
                      <span className="text-[8px] font-bold text-purple-500 uppercase tracking-widest mt-1">{t('home_current_choice')}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10, 20].map((val) => (
                      <button
                        key={val}
                        disabled={hasVotedKightRanking && timeLeft > 0}
                        onClick={() => {
                          if (val > visiblePosts.length) {
                            setRankingError(`Users are not up to ${val}`);
                            setTimeout(() => setRankingError(null), 3000);
                            return;
                          }
                          setUserKightRanking(val);
                          setRankingError(null);
                        }}
                        className={`py-3 rounded-xl text-xs font-black transition-all relative overflow-hidden ${
                          userKightRanking === val
                            ? "bg-purple-600 text-white shadow-lg scale-105"
                            : val > visiblePosts.length
                              ? "bg-zinc-100 border border-zinc-200 text-zinc-300 cursor-not-allowed opacity-60"
                              : "bg-white border border-zinc-200 text-zinc-500 hover:border-purple-200 hover:text-purple-500"
                        } ${hasVotedKightRanking && timeLeft > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span>{val}</span>
                      </button>
                    ))}
                  </div>
                  
                  {rankingError && (
                    <div className="px-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter italic">
                        {rankingError}
                      </p>
                    </div>
                  )}
                  
                  {/* Community Breakdown (Top 3 rules) */}
                  {Object.keys(kightRankingVotes).length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest px-1">{t('home_community_votes')}</span>
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
              {(userSelection && timeLeft > 0) ? (
                <span className="text-[10px] font-bold text-zinc-400 italic">{t('home_selection_locked')}</span>
              ) : (activeTab === 'kight' && userKightRanking > visiblePosts.length) ? (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
                  Need {userKightRanking} users to play
                </span>
              ) : null}
              <button 
                disabled={(!!userSelection && timeLeft > 0) || (hours === 0 && minutes === 0) || (activeTab === 'kight' && userKightRanking > visiblePosts.length)}
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
                    setShowPills(false);
                    setActiveTab(null);
                    setHours(0);
                    setMinutes(0);
                  }}
                className={`px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all transform ${
                  (!!userSelection && timeLeft > 0) || (hours === 0 && minutes === 0) || (activeTab === 'kight' && userKightRanking > visiblePosts.length)
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none scale-100'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95'
                }`}
              >
                {userSelection && timeLeft > 0 
                  ? t('home_submitted')
                  : (activeTab === 'kight' && userKightRanking > visiblePosts.length)
                    ? t('home_invalid_ranking')
                    : t('home_submit')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Kight Warning Overlay */}
      {kightWarning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 pointer-events-none">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 flex items-center gap-3 border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Skull size={20} className="text-rose-500" />
            </div>
            <p className="font-black uppercase tracking-tight text-sm italic">
              {kightWarning}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {visiblePosts.length > 0 && !isChallengeEnded ? (
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
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-1000 px-6 text-center pb-20">
            <div className="space-y-4 mb-8">
              <h2 className="text-7xl font-black font-serif text-zinc-900 tracking-tighter uppercase italic">
                {t('home_the_end')}
              </h2>
              <div className="flex flex-col items-center gap-3">
                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">
                  {isChallengeEnded 
                    ? (majorityVariant === 'kight' ? t('home_winner_complete') : t('home_universal_complete')) 
                    : t('home_all_judged')}
                </p>
              </div>
            </div>

            {survivors.length > 0 && (
              <div className="w-full max-w-sm mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Sparkles size={14} className="text-green-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('home_survivors')}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{survivors.length}</span>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="max-h-[200px] overflow-y-auto divide-y divide-zinc-50">
                    {survivors.map((survivor, index) => (
                      <div key={survivor.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-100 shrink-0">
                          <img src={survivor.avatar} alt={survivor.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm truncate">{survivor.username}</span>
                              <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 rounded-md">
                                #{index + 1}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">{survivor.caption}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/search')}
              className="group relative w-full max-w-xs py-6 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {t('home_view_history')}
                <Search size={18} className="text-purple-400" />
              </span>
            </button>

            <button
              onClick={() => {
                startNewChallenge();
                setVisiblePosts(allPosts);
                setHours(0);
                setMinutes(0);
                setActiveTab('kight');
                setShowPills(true);
              }}
              className="mt-8 text-zinc-400 font-bold uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors"
            >
              {t('home_start_new')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
