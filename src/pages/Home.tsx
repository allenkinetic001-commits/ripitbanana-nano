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
    majorityVariant,
    setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
    setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
    setUserSelection, setIsChallengeEnded,
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
  const [showMustache, setShowMustache] = useState(true);

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
      caption: captionText || (fileType === 'video' ? 'Just uploaded a video! ðŸŽ¥' : 'Just uploaded a photo! ðŸ“¸'),
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
  }, [visiblePosts.length, isActive, isChallengeEnded, timeLeft, setSurvivors, setIsActive, setIsChallengeEnded, setTimeLeft, userSelection, majorityVariant, setMadeItCounts]);

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
                âœ•
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              {/* Pley */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-full">Pley</span>
                  <div className="flex items-center gap-1.5">
                    <Flame size={12} className="text-orange-600 fill-orange-600" />
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter">â€” Fate Worse Than Death</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  A feature game mode where users can only vote down, and a single down permanently destroys a playerâ€™s account for that round.
                </p>
              </div>

              {/*  */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-full"></span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  A high-stakes game mode where users can only receive downvotes. Before the round begins, players select the ranking rule they wantâ€”Top 1, Top 5, Top 10, or Top 20. The final rule is determined by majority vote, with the first playerâ€™s choice acting as a temporary default until the majority is established. At the end of the round, any player who fails to make it into the selected top ranking has their profile, followers, and posts reset to zero, while their account remains intact.
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
        <div className="px-4 py-3 min-h-[4rem] flex items-center justify-between">
          <div className="flex items-center gap-0">
            <button 
              onClick={() => setShowMustache(!showMustache)}
              className="transition-all active:scale-95 hover:opacity-80 flex items-center gap-0"
              title="Toggle Menu"
            >
              <img src="/header-logo-hydrant.png" alt="Logo" className="h-[60px] w-auto object-contain" />
              <img src="/header-logo-text.png" alt="RipIt" className="h-6 w-auto object-contain ml-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <ChallengeTimer />
            {!isChallengeEnded && showMustache && (
              <button 
                onClick={() => {
                  if (!showPills) {
                    setActiveTab('pley');
                  } else {
                    setActiveTab(null);
                  }
                  setShowPills(!showPills);
                }}
                className="flex items-center justify-center transition-all active:scale-90 hover:opacity-70"
              >
                <img 
                  src={showPills ? "/nav-mustache-active.png" : "/nav-mustache.png"} 
                  alt="Create" 
                  className="h-[44px] w-[44px] object-contain transition-all duration-300 transform" 
                />
              </button>
            )}
            <button 
              onClick={() => navigate('/chat')}
              className="text-zinc-700 hover:text-purple-600 transition-colors"
            >
              <img src="/nav-chat-v3.png" alt="Chat" className="h-[38px] w-[38px] object-contain" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-700 hover:text-purple-600 transition-colors"
            >
              <img src="/nav-camera-v3.png" alt="Camera" className="h-[38px] w-[38px] object-contain" />
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
              <img src="/nav-news-v3.png" alt="News" className="h-[38px] w-[38px] object-contain" />
            </button>
            <button 
              className="text-zinc-700 transition-all active:scale-90 hover:opacity-70"
              onClick={() => setShowSearchModal(true)}
            >
              <img src="/header-search-v3.png" alt="Search" className="h-[26px] w-[26px] object-contain" />
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

        {/* Sub-header Navigation - Simplified for Pley-only */}
        <div className="px-6 pt-0 pb-1 flex items-end justify-between gap-6 relative">
          {showPills && !isChallengeEnded && (
            <div className="flex flex-col items-center gap-2 flex-1 relative group">
                <div className="flex items-center justify-center relative w-full h-[48px]">
                  <img src="/pley-challenge-logo.png" alt="Challenge House" className="h-[48px] w-auto object-contain absolute left-0" />
                  <img src="/pley-challenge-car.png" alt="Challenge Car" className="h-[52px] w-auto object-contain relative z-10" />
                  <img src="/pley-challenge-garage.png" alt="Challenge Garage" className="h-[50px] w-auto object-contain absolute right-4" />
                </div>
            </div>
          )}
          {!showPills && <div className="flex-1" />}
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
            
            <div className="flex justify-center w-full pb-2">
              <img src="/worse-than-death.png" alt="Worse Than Death" className="h-[72px] w-auto object-contain" />
            </div>

            <div className="flex justify-end items-center gap-3">
              {(userSelection && timeLeft > 0) ? (
                <span className="text-[10px] font-bold text-zinc-400 italic">{t('home_selection_locked')}</span>
              ) : null}
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
                className={`transition-all transform flex items-center justify-center mix-blend-multiply ${
                  (!!userSelection && timeLeft > 0) || (hours === 0 && minutes === 0)
                    ? 'opacity-50 grayscale cursor-not-allowed scale-100'
                    : 'hover:scale-105 active:scale-95 hover:opacity-90'
                }`}
              >
                <img 
                  src="/btn-submit.png" 
                  alt={userSelection && timeLeft > 0 ? "Submitted" : "Submit"} 
                  className="h-[72px] w-auto object-contain" 
                />
              </button>
            </div>
          </div>
        )}
      </header>

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
                    ? t('home_universal_complete') 
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
                setActiveTab('pley');
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

