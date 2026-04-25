import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, ShieldAlert, Send, Trash2, MessageSquare, List, Trophy, UserPlus } from 'lucide-react';
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
    toggleFollow, followedUsers, isLegend, isSurvivor, allPosts, userLives
  } = useChallenge();
  const [wallInput, setWallInput] = useState('');
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  // Derived state from context
  const hasActed = enemies.some(e => e.username === username);
  const [isSwornLocal, setIsSwornLocal] = useState(false);
  const [viewMode, setViewMode] = useState<'posts' | 'wall'>('posts');
  const [isTraitor, setIsTraitor] = useState(false);

  const isMe = username === userProfile.username;

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
    const cached = localStorage.getItem(`user_profile_cache_${username}`);
    return cached ? JSON.parse(cached) : null;
  });
  
  const [userPostsFromDB, setUserPostsFromDB] = useState<any[]>(() => {
    const cached = localStorage.getItem(`user_posts_cache_${username}`);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loadingPosts, setLoadingPosts] = useState(!profileData || userPostsFromDB.length === 0);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    // If it's me, we can skip the initial loading state since we have profile data
    if (isMe) {
      setLoadingPosts(userPostsFromDB.length === 0);
    } else {
      // For others, only show loading if we have NO cached data
      const hasCache = localStorage.getItem(`user_profile_cache_${username}`);
      if (!hasCache) setLoadingPosts(true);
    }
    
    setProfileNotFound(false);

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
        setProfileNotFound(true);
        setLoadingPosts(false);
        return;
      }

      setProfileData(profile);
      localStorage.setItem(`user_profile_cache_${username}`, JSON.stringify(profile));
      
      // Fetch their posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (posts) {
        const formatted = posts.map((p: any) => ({
          id: p.id,
          username: p.profiles?.username || username,
          avatar: p.profiles?.avatar_url || profile.avatar_url || '/custom-empty-profile.png',
          image: p.image_url || '',
          caption: p.caption || '',
          likes: p.likes_count || 0,
          time: 'Recently',
          comments: [],
        }));
        setUserPostsFromDB(formatted);
        localStorage.setItem(`user_posts_cache_${username}`, JSON.stringify(formatted));
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
        setProfileData(payload.new);
        localStorage.setItem(`user_profile_cache_${username}`, JSON.stringify(payload.new));
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'profiles',
        filter: `username=eq.${username}`
      }, () => {
        navigate('/');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, isMe]);

  // Merge context posts with DB posts to ensure local optimistic posts are shown instantly
  const contextPosts = allPosts.filter((p: any) => p.username === username);
  const userPosts = [...contextPosts];
  userPostsFromDB.forEach(dbPost => {
    if (!userPosts.some(p => p.id === dbPost.id)) {
      userPosts.push(dbPost);
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
            <div className="flex flex-col items-center">
              <span className="font-bold">0</span>
              <img 
                src="/followers-title.png" 
                alt="Followers" 
                className="h-3 w-auto object-contain opacity-40" 
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
          className="flex-1 flex items-center justify-center h-12 border-b-2 border-transparent text-zinc-400 opacity-20 cursor-not-allowed"
          title="Enemies view coming soon"
        >
          <ShieldAlert size={24} />
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
                className="aspect-square bg-zinc-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img src={post.image} alt={`Post ${index}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyFeed className="min-h-[40vh] pt-36" subtitle="Nobody yet" />
        )
      ) : (
        <div className="flex-1 bg-zinc-50/50 p-4">
          {/* Default empty state or other content */}
        </div>
      )}
    </div>
  );
};

export default UserDetail;
