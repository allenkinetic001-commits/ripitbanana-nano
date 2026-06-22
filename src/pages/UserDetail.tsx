import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, ShieldAlert, Send, Trash2, MessageSquare, List, Trophy, UserPlus, Play } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';
import { PixelHeart } from '../components/PixelHeart';
import { ProfileHeartsToggle } from '../components/ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';
import { supabase } from '../lib/supabase';
import EmptyFeed from '../components/Empty';

const UserDetail = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [showHearts, setShowHearts] = useState(false);
  const { 
    addEnemy, addSwornEnemy, enemies, removeEnemy, wallPosts, addWallPost, userProfile,
    toggleFollow, followedUsers, isLegend, isSurvivor, allPosts, userLives, eliminated, roundHistory
  } = useChallenge();
  const [wallInput, setWallInput] = useState('');
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  // Derived state from context
  const hasActed = enemies.some(e => e.username === username);
  const [isSwornLocal, setIsSwornLocal] = useState(false);
  const [viewMode, setViewMode] = useState<'posts' | 'wall' | 'enemies'>('posts');
  const [enemiesSubTab, setEnemiesSubTab] = useState<'added_them' | 'added_me'>('added_them');
  const [isTraitor, setIsTraitor] = useState(false);

  const isMe = username === userProfile.username;

  const getEnemiesOfCount = (targetUsername: string | undefined) => {
    if (!targetUsername) return 0;
    let count = 0;
    const currentUsername = userProfile?.username;
    
    // 1. Check if current user has targetUsername as enemy
    const currentHasAdded = enemies.some((e: any) => e.username === targetUsername);
    if (currentHasAdded) {
      count++;
    }
    
    // 2. Scan other users' stored enemy lists in localStorage
    try {
      const currentUserKey = currentUsername ? `enemies_v7_${currentUsername}` : null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('enemies_v7_') && key !== currentUserKey) {
          const listStr = localStorage.getItem(key);
          if (listStr) {
            const list = JSON.parse(listStr);
            if (Array.isArray(list) && list.some((e: any) => e.username === targetUsername)) {
              count++;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error scanning enemies list:', e);
    }
    
    return count;
  };

  const enemiesOfCount = getEnemiesOfCount(username);

  const getUserEnemies = (targetUsername: string | undefined) => {
    if (!targetUsername) return [];
    try {
      const listStr = localStorage.getItem(`enemies_v7_${targetUsername}`);
      if (listStr) {
        const list = JSON.parse(listStr);
        if (Array.isArray(list)) return list;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const getAddedByList = (targetUsername: string | undefined) => {
    if (!targetUsername) return [];
    const list: any[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('enemies_v7_')) {
          const listStr = localStorage.getItem(key);
          if (listStr) {
            const enemiesList = JSON.parse(listStr);
            if (Array.isArray(enemiesList)) {
              const found = enemiesList.find((e: any) => e.username === targetUsername);
              if (found) {
                const sourceUsername = key.replace('enemies_v7_', '');
                const cachedProfileStr = localStorage.getItem(`user_profile_cache_${sourceUsername}`);
                let avatar = '/custom-empty-profile.png';
                if (cachedProfileStr) {
                  const cached = JSON.parse(cachedProfileStr);
                  avatar = cached?.avatar_url || avatar;
                }
                list.push({
                  id: sourceUsername,
                  username: sourceUsername,
                  avatar: avatar
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return list;
  };

  // Helper to determine if a user has been eliminated
  const checkIsEliminated = (uname: string | undefined) => {
    if (!uname || uname === userProfile.username) return false;
    const cacheEliminated = localStorage.getItem(`user_eliminated_${uname}`) === 'true';
    const livesEliminated = userLives[uname] !== undefined && userLives[uname] <= 0;
    const listEliminated = eliminated && eliminated.some((e: any) => e.username === uname);
    const historyEliminated = roundHistory && roundHistory.some(r => 
      r.eliminated && r.eliminated.some((e: any) => e.username === uname)
    );
    return cacheEliminated || livesEliminated || listEliminated || historyEliminated;
  };

  // Supabase data with caching
  const [profileData, setProfileData] = useState<any>(() => {
    // Priority: Context (if Me) > Cache > Null
    if (isMe && userProfile?.username) return { 
      id: (userProfile as any)?.id || userProfile?.username || 'me',
      username: userProfile.username,
      avatar_url: userProfile.avatar,
      bio: userProfile.bio || 'Surviving the round ⚡',
      lives: userLives[userProfile.username] || 3
    };
    
    if (checkIsEliminated(username)) return null;

    const cached = localStorage.getItem(`user_profile_cache_${username}`);
    return cached ? JSON.parse(cached) : null;
  });
  
  const [userPostsFromDB, setUserPostsFromDB] = useState<any[]>(() => {
    if (checkIsEliminated(username)) return [];

    const cached = localStorage.getItem(`user_posts_cache_${username}`);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [profileNotFound, setProfileNotFound] = useState(() => {
    return checkIsEliminated(username);
  });

  const [loadingPosts, setLoadingPosts] = useState(() => {
    if (profileNotFound) return false;
    return !profileData || userPostsFromDB.length === 0;
  });

  useEffect(() => {
    if (!username) return;
    
    const isEliminated = checkIsEliminated(username);

    // If it's me, we can skip the initial loading state since we have profile data
    if (isMe) {
      setLoadingPosts(userPostsFromDB.length === 0);
    } else {
      // For others, only show loading if we have NO cached data and they are not eliminated
      const hasCache = localStorage.getItem(`user_profile_cache_${username}`);
      if (!hasCache && !isEliminated) setLoadingPosts(true);
    }
    
    setProfileNotFound(isEliminated);

    const fetchUserData = async () => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (!profile || profileError) {
        // If not found in DB, check if it's in our local context (Guest mode or recent signup)
        if (isMe) {
          setLoadingPosts(false);
          return;
        }
        // Clear stale cache for eliminated users
        localStorage.removeItem(`user_profile_cache_${username}`);
        localStorage.removeItem(`user_posts_cache_${username}`);
        localStorage.setItem(`user_eliminated_${username}`, 'true');
        setProfileData(null);
        setUserPostsFromDB([]);
        setProfileNotFound(true);
        setLoadingPosts(false);
        return;
      }

      // Check if lives <= 0 (user was eliminated but profile row still exists)
      if (profile.lives !== undefined && profile.lives !== null && profile.lives <= 0) {
        localStorage.removeItem(`user_profile_cache_${username}`);
        localStorage.removeItem(`user_posts_cache_${username}`);
        localStorage.setItem(`user_eliminated_${username}`, 'true');
        setProfileData(null);
        setUserPostsFromDB([]);
        setProfileNotFound(true);
        setLoadingPosts(false);
        return;
      }

      setProfileData(profile);
      localStorage.removeItem(`user_eliminated_${username}`);
      try {
        localStorage.setItem(`user_profile_cache_${username}`, JSON.stringify(profile));
      } catch(e) {
        console.warn('Profile cache quota exceeded');
      }
      
      // Fetch their posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (posts) {
        const formatted = posts.map((p: any) => {
          const url = p.image_url || '';
          const isVideo = url.startsWith('data:video/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url);
          return {
            id: p.id,
            username: p.profiles?.username || username,
            avatar: p.profiles?.avatar_url || profile.avatar_url || '/custom-empty-profile.png',
            image: url,
            type: isVideo ? 'video' : 'image',
            caption: p.caption || '',
            likes: p.likes_count || 0,
            time: 'Recently',
            comments: [],
          };
        });
        setUserPostsFromDB(formatted);
        try {
          localStorage.setItem(`user_posts_cache_${username}`, JSON.stringify(formatted));
        } catch(e) {
          console.warn('Posts cache quota exceeded');
        }
      }
      setLoadingPosts(false);
    };

    fetchUserData();

    const channel = supabase
      .channel(`profile:${username}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `username=eq.${username}`
      }, (payload) => {
        // If lives dropped to 0 or below, mark as eliminated immediately
        if (payload.new.lives !== undefined && payload.new.lives !== null && payload.new.lives <= 0) {
          localStorage.removeItem(`user_profile_cache_${username}`);
          localStorage.removeItem(`user_posts_cache_${username}`);
          localStorage.setItem(`user_eliminated_${username}`, 'true');
          setProfileData(null);
          setUserPostsFromDB([]);
          setProfileNotFound(true);
          return;
        }
        setProfileData(payload.new);
        try {
          localStorage.setItem(`user_profile_cache_${username}`, JSON.stringify(payload.new));
        } catch(e) {
          console.warn('Profile cache quota exceeded');
        }
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'profiles',
        filter: `username=eq.${username}`
      }, () => {
        // Profile was deleted — show eliminated screen instead of navigating away
        localStorage.removeItem(`user_profile_cache_${username}`);
        localStorage.removeItem(`user_posts_cache_${username}`);
        localStorage.setItem(`user_eliminated_${username}`, 'true');
        setProfileData(null);
        setUserPostsFromDB([]);
        setProfileNotFound(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, isMe]);

  // Merge context posts with DB posts to ensure local optimistic posts are shown instantly
  const contextPosts = allPosts.filter((p: any) => p.username === username);
  const userPosts = [...contextPosts].map(p => ({
    ...p,
    avatar: profileData?.avatar_url || p.avatar
  }));
  userPostsFromDB.forEach(dbPost => {
    if (!userPosts.some(p => p.id === dbPost.id)) {
      userPosts.push({
        ...dbPost,
        avatar: profileData?.avatar_url || dbPost.avatar
      });
    }
  });
  userPosts.sort((a, b) => {
    // Try to sort by id descending
    const aId = typeof a.id === 'number' ? a.id : 0;
    const bId = typeof b.id === 'number' ? b.id : 0;
    return bId - aId;
  });

  const isEnemy = enemies.some(e => e.username === username);
  const isSwornEnemy = enemies.find(e => e.username === username)?.isSworn || false;
  const userWallPosts = wallPosts.filter(p => p.targetUser === username);
  const userIsLegend = username ? isLegend(username) : false;
  const isFollowing = username ? followedUsers.includes(username) : false;

  const toggleTraitor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTraitor(!isTraitor);
  };

  const { handlers: heartsHandlers } = useLongPress(() => {
    setShowHearts(prev => !prev);
  }, 400);

  const globalLives = profileData?.lives ?? 3;

  const { handlers: enemyLongPress } = useLongPress(() => {
    setIsSwornLocal(prev => !prev);
  }, 400);

  const handleAddEnemy = async () => {
    if (profileData?.is_traitor || isTraitor) {
      setIsTraitor(true);
      if (username) {
        const { setTraitorStatus } = await import('../hooks/useSupabase');
        await setTraitorStatus(username, true);
      }
      return;
    }

    if (isEnemy) {
      const enemyToRemove = enemies.find(e => e.username === username);
      if (enemyToRemove) {
        removeEnemy(enemyToRemove.id);
      }
      setShowAddedFeedback(false);
    } else {
      const survivorData = userPosts[0] || {
        id: profileData?.id || Date.now(),
        username: username || '',
        avatar: profileData?.avatar_url || userPosts[0]?.avatar || "/custom-empty-profile.png",
        image: '',
        caption: profileData?.bio || 'Survivor',
        time: 'Just now',
        comments: []
      };

      if (isSwornLocal) {
        addSwornEnemy(survivorData);
      } else {
        addEnemy(survivorData);
      }
      setShowAddedFeedback(true);
    }
  };

  const handlePostToWall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallInput.trim()) return;
    addWallPost(wallInput.trim(), username);
    setWallInput('');
  };

  const isUserEliminated = !isMe && (
    checkIsEliminated(username) || 
    (profileData && profileData.lives !== undefined && profileData.lives !== null && profileData.lives <= 0)
  );

  // Full-screen block for eliminated users
  if (isUserEliminated) {
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="px-4 h-14 flex items-center gap-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <button onClick={() => navigate(-1)} className="text-zinc-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">{username}</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-700">
          <img 
            src="/droppy.png" 
            alt="Eliminated" 
            className="w-48 h-48 object-contain mb-8" 
            style={{ imageRendering: '-webkit-optimize-contrast' }} 
          />
          <div className="space-y-3 max-w-sm">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">
              Oops… this user doesn't exist here anymore.
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Their profile, posts, and interactions have been wiped from the system. They have been eliminated.
            </p>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-12">
            Existence Terminated
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-white">
      {/* Header */}
      <header className="px-4 h-14 flex items-center gap-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="text-zinc-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{username}</h1>
      </header>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-8">
          <div className="w-20 h-20 rounded-full border border-zinc-200 overflow-hidden relative">
            <img
              src={profileData?.avatar_url || userPosts[0]?.avatar || "/custom-empty-profile.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {userIsLegend && (
              <div className="absolute -bottom-3 -right-3 flex items-center justify-center pointer-events-none">
                <img 
                  src="/pley-badge.png" 
                  alt="Survivor" 
                  className="w-12 h-12 object-contain" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="font-bold">{userPosts.length}</span>
              <img 
                src="/posts-title.png" 
                alt="Posts" 
                className="h-3 w-auto object-contain opacity-40" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            <div 
              onClick={() => setViewMode(viewMode === 'enemies' ? 'posts' : 'enemies')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <span className="font-bold text-rose-600">{enemiesOfCount}</span>
              <img 
                src="/enemies-title.png" 
                alt="Enemies" 
                className="h-3 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{isMe ? followedUsers.length : 0}</span>
              <img 
                src="/following-title.png" 
                alt="Following" 
                className="h-3.5 w-auto object-contain opacity-40" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">0</span>
              <img 
                src="/followers-title.png" 
                alt="Followers" 
                className="h-3 w-auto object-contain opacity-40" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1" {...heartsHandlers}>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold">{username}</h2>
              <div className="flex items-center gap-0.5">
                <ProfileHeartsToggle isVisible={showHearts} lives={globalLives} />
              </div>
            </div>
            <p className="text-sm text-zinc-600">{profileData?.bio || 'Surviving the round ⚡'}</p>
          </div>
          <div className="flex items-center space-x-2">
            {profileData?.is_traitor || isTraitor ? (
              <button 
                onClick={handleAddEnemy}
                className="animate-pop-in transition-all active:scale-95 flex items-center justify-center p-1"
                title="Trigger Traitor Action"
              >
                <img 
                  key="traitor-mustache"
                  src="/traitor.png" 
                  alt="Traitor" 
                  className="h-8 w-auto object-contain animate-pop-in" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </button>
            ) : (
              <>
                {!isMe && (
                  <button 
                    onClick={handleAddEnemy}
                    {...enemyLongPress}
                    className="flex items-center justify-center active:scale-95 drop-shadow-sm"
                  >
                    {showAddedFeedback || isEnemy ? (
                      <img 
                        key="added"
                        src="/btn-added.png" 
                        alt="Added" 
                        className="h-[32px] w-auto object-contain animate-pop-in" 
                      />
                    ) : isSwornLocal ? (
                      <img 
                        key="sworn"
                        src="/btn-sworn.png" 
                        alt="Sworn Enemy" 
                        className="h-[32px] w-auto object-contain animate-pop-in" 
                      />
                    ) : (
                      <img 
                        key="add"
                        src="/add-enemy.png" 
                        alt="Add Enemy" 
                        className="h-[43px] w-auto object-contain rounded-xl animate-pop-in" 
                      />
                    )}
                  </button>
                )}
                {!isMe && (
                  <button 
                    onClick={() => toggleFollow(username || '')}
                    className="transition-all active:scale-95 hover:scale-105"
                  >
                    {isFollowing ? (
                      <img 
                        key="following"
                        src="/btn-following.png" 
                        alt="Following" 
                        className="h-[32px] w-auto object-contain animate-pop-in" 
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                      />
                    ) : (
                      <img 
                        key="follow"
                        src="/btn-follow.png" 
                        alt="Follow" 
                        className="h-[32px] w-auto object-contain animate-pop-in" 
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                      />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {!isTraitor && !isMe && (
            <button 
              onClick={() => navigate(`/chat/${username}`)}
              className="w-full bg-zinc-100 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-zinc-200 transition-colors"
            >
              Message
            </button>
          )}
        </div>


      </div>

      {/* Tabs */}
      <div className="flex border-t border-zinc-100 mt-4 items-center">
        <button 
          onClick={() => setViewMode('posts')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'posts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
        >
          <Grid size={24} />
        </button>
        <button 
          className="flex-1 flex items-center justify-center h-12 border-b-2 border-transparent text-zinc-400 opacity-20 cursor-not-allowed"
          title="List view coming soon"
        >
          <List size={24} />
        </button>
        {!hasActed && (
          <div 
            onClick={toggleTraitor}
            className="w-16 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-xl hover:bg-zinc-100/50 active:scale-95"
            title="Traitor Toggle"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-200/40" />
          </div>
        )}
        <button 
          onClick={() => setViewMode(viewMode === 'enemies' ? 'posts' : 'enemies')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'enemies' ? 'border-rose-600' : 'border-transparent text-zinc-400'}`}
        >
          <img 
            src="/ballad.png" 
            alt="Enemies" 
            className={cn(
              "w-7 h-7 object-contain transition-all duration-300",
              viewMode === 'enemies' ? "brightness-0 invert-[.13] sepia-[.91] saturate-[74.13] hue-rotate-[354deg] brightness-[.89] contrast-[1.24]" : "opacity-40"
            )}
          />
        </button>
        <button 
          className="flex-1 flex items-center justify-center h-12 border-b-2 border-transparent text-zinc-400 opacity-20 cursor-not-allowed"
          title="Trophies coming soon"
        >
          <Trophy size={20} />
        </button>
      </div>

      {/* Content */}
      {viewMode === 'posts' ? (
        loadingPosts ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          </div>
        ) : profileNotFound ? (
          <EmptyFeed
            className="min-h-[40vh] pt-36"
            title="User Not Found"
            subtitle="This profile doesn't exist"
          />
        ) : userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 pb-4">
            {userPosts.map((post, index) => (
              <div 
                key={index} 
                onClick={() => navigate(`/post/${post.id}`)}
                className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                {post.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video 
                      src={post.image} 
                      className="w-full h-full object-cover pointer-events-none" 
                      muted 
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-[2px] rounded-md p-1 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <img src={post.image} alt={`Post ${index}`} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyFeed className="min-h-[40vh] pt-36" subtitle="Nobody yet" />
        )
      ) : viewMode === 'enemies' ? (
        <div className="flex-1 bg-zinc-50/50 p-4">
          {/* Sub Tabs */}
          <div className="flex bg-zinc-100 p-0.5 rounded-lg mb-4">
            <button 
              onClick={() => setEnemiesSubTab('added_them')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${enemiesSubTab === 'added_them' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Added by Them
            </button>
            <button 
              onClick={() => setEnemiesSubTab('added_me')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${enemiesSubTab === 'added_me' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-500 hover:text-rose-600'}`}
            >
              Who Added Them
            </button>
          </div>

          <div className="space-y-3">
            {enemiesSubTab === 'added_them' ? (
              getUserEnemies(username).length > 0 ? (
                getUserEnemies(username).map((enemy: any) => (
                  <div 
                    key={enemy.id} 
                    onClick={() => navigate(`/user/${enemy.username}`)}
                    className="bg-white rounded-xl p-3 border border-red-50 shadow-sm flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 active:scale-[0.99] transition-all animate-in fade-in duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={enemy.avatar || "/custom-empty-profile.png"} 
                        className="w-10 h-10 rounded-full border border-zinc-50 object-cover" 
                        alt={enemy.username} 
                      />
                      <span className="font-bold text-sm">@{enemy.username}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      View Profile
                    </span>
                  </div>
                ))
              ) : (
                <EmptyFeed 
                  className="min-h-[30vh] pt-12" 
                  subtitle="Nobody yet" 
                />
              )
            ) : (
              getAddedByList(username).length > 0 ? (
                getAddedByList(username).map((enemy: any) => (
                  <div 
                    key={enemy.id} 
                    onClick={() => navigate(`/user/${enemy.username}`)}
                    className="bg-white rounded-xl p-3 border border-red-50 shadow-sm flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 active:scale-[0.99] transition-all animate-in fade-in duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={enemy.avatar || "/custom-empty-profile.png"} 
                        className="w-10 h-10 rounded-full border border-zinc-50 object-cover" 
                        alt={enemy.username} 
                      />
                      <span className="font-bold text-sm">@{enemy.username}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      View Profile
                    </span>
                  </div>
                ))
              ) : (
                <EmptyFeed 
                  className="min-h-[30vh] pt-12" 
                  subtitle="Nobody yet" 
                />
              )
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-zinc-50/50 p-4">
          {/* Default empty state or other content */}
        </div>
      )}
    </div>
  );
};

export default UserDetail;
