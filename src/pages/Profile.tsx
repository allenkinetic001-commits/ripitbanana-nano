import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Grid, List, Trash2, ShieldAlert, X, Check, Camera, UserPlus, Trophy, Sparkles, MessageSquare } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';
import { PixelHeart } from '../components/PixelHeart';
import { ProfileHeartsToggle } from '../components/ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';
import { supabase } from '../lib/supabase';
import { fetchPostsByUsername, formatPostForUI } from '../hooks/useSupabase';
import EmptyFeed from '../components/Empty';

// Removed hardcoded userPosts

const Profile = () => {
  const navigate = useNavigate();
  const [showHearts, setShowHearts] = useState(false);
  const { 
    enemies, removeEnemy, userProfile, setUserProfile, 
    followedUsers, toggleFollow, isLegend, survivorHistory,
    wallPosts, addWallPost, allPosts,
    t
  } = useChallenge();

  const { handlers: heartsHandlers } = useLongPress(() => {
    setShowHearts(prev => !prev);
  }, 400);
  const [viewMode, setViewMode] = useState<'posts' | 'wall' | 'enemies' | 'following'>('posts');
  const [wallInput, setWallInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditEditForm] = useState(userProfile);
  // Supabase data with caching
  const [profileData, setProfileData] = useState<any>(() => {
    // Priority: Context > Cache > Null
    if (userProfile.username) return { 
      username: userProfile.username,
      avatar_url: userProfile.avatar,
      bio: userProfile.bio || 'Surviving the round ⚡',
      lives: 3 // Default
    };
    return null;
  });

  const [userPosts, setUserPosts] = useState<any[]>(() => {
    if (!userProfile?.username) return [];
    const cached = localStorage.getItem(`user_posts_cache_${userProfile.username}`);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loadingPosts, setLoadingPosts] = useState(!userProfile?.username || userPosts.length === 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!userProfile?.username) return;
      
      // If we have posts cached, we don't need to show a blocking loader
      const cachedPosts = localStorage.getItem(`user_posts_cache_${userProfile.username}`);
      if (!cachedPosts) setLoadingPosts(true);
      
      // Fetch profile for latest lives count
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', userProfile.username)
        .single();
      
      if (profile) {
        setProfileData(profile);
        try {
          localStorage.setItem(`user_profile_cache_${userProfile.username}`, JSON.stringify(profile));
        } catch(e) {
          console.warn('Profile cache quota exceeded');
        }
      }

      const { data, error } = await fetchPostsByUsername(userProfile.username);
      if (data) {
        const formatted = data.map(formatPostForUI);
        setUserPosts(formatted);
        try {
          localStorage.setItem(`user_posts_cache_${userProfile.username}`, JSON.stringify(formatted));
        } catch(e) {
          console.warn('Posts cache quota exceeded');
        }
      }
      setLoadingPosts(false);
    };

    fetchProfileAndPosts();

    // Subscribe to self profile updates
    const channel = supabase
      .channel(`self-profile:${userProfile.username}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `username=eq.${userProfile.username}`
      }, (payload) => {
        setProfileData(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.username]);

  // Get data for followed users from history or default data
  const followedUsersData = followedUsers.map(username => {
    const historyData = survivorHistory.find(s => s.username === username);
    return {
      username,
      avatar: historyData?.avatar || "/custom-empty-profile.png",
      isLegend: isLegend(username)
    };
  });

  const handleSaveProfile = () => {
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEditing) {
          setEditEditForm(prev => ({ ...prev, avatar: result }));
        } else {
          setUserProfile({ ...userProfile, avatar: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostToWall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallInput.trim()) return;
    addWallPost(wallInput.trim(), userProfile.username);
    setWallInput('');
  };

  const userWallPosts = wallPosts.filter(p => p.targetUser === userProfile.username);

  // Merge context posts with DB posts to ensure local optimistic posts are shown instantly
  const contextPosts = allPosts.filter((p: any) => p.username === userProfile.username);
  const mergedPosts = [...contextPosts];
  userPosts.forEach(dbPost => {
    if (!mergedPosts.some(p => p.id === dbPost.id)) {
      mergedPosts.push(dbPost);
    }
  });
  mergedPosts.sort((a, b) => b.id - a.id);

  const hasActed = false; // Mock for own profile
  const toggleTraitor = () => {}; // Mock for own profile

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 bg-white">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />
      <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-bold">@{userProfile.username || 'user'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'enemies' ? 'posts' : 'enemies')}
            className={cn(
              "transition-all duration-300",
              viewMode === 'enemies' ? "text-rose-600" : "text-zinc-700"
            )}
            title={viewMode === 'enemies' ? "Back to Posts" : "View Enemies"}
          >
            <img 
              src="/enemies-icon.png" 
              alt="Enemies" 
              className={cn(
                "w-7 h-7 object-contain transition-all duration-300",
                viewMode === 'enemies' ? "brightness-0 invert-[.13] sepia-[.91] saturate-[74.13] hue-rotate-[354deg] brightness-[.89] contrast-[1.24]" : "opacity-40"
              )}
            />
          </button>
          <div className="relative">
            <button 
              onClick={() => navigate('/settings')}
              className="text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Edit Profile Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100">
            <button onClick={() => setIsEditing(false)} className="text-zinc-900">
              <X size={24} />
            </button>
            <h2 className="font-bold">Edit Profile</h2>
            <button onClick={handleSaveProfile} className="text-zinc-900 font-bold">
              <Check size={24} />
            </button>
          </header>
          
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <img 
                  src={editForm.avatar || "/custom-empty-profile.png"} 
                  className={cn(
                    "w-24 h-24 rounded-full object-cover border border-zinc-200 shadow-sm",
                    !editForm.avatar && "p-0 bg-white"
                  )}
                  alt="Avatar"
                />
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-zinc-900 text-sm font-bold underline"
              >
                Change profile photo
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Name</label>
                <input 
                  type="text" 
                  value={editForm.fullName}
                  onChange={(e) => setEditEditForm({...editForm, fullName: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-zinc-900 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username</label>
                <input 
                  type="text" 
                  value={editForm.username}
                  onChange={(e) => setEditEditForm({...editForm, username: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-zinc-900 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Website</label>
                <input 
                  type="text" 
                  value={editForm.website}
                  onChange={(e) => setEditEditForm({...editForm, website: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-zinc-900 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bio</label>
                <textarea 
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditEditForm({...editForm, bio: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-rose-600 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full border-4 border-white overflow-hidden relative group shadow-lg cursor-pointer"
          >
            <img 
              src={userProfile.avatar || "/custom-empty-profile.png"}
              alt="Profile"
              className={cn(
                "w-full h-full object-cover",
                !userProfile.avatar && "p-0 bg-white"
              )}
            />
            {!userProfile.avatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Camera size={28} className="text-white drop-shadow-md" />
              </div>
            )}
            {isLegend(userProfile.username) && (
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
              <span className="font-bold">{mergedPosts.length}</span>
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
            <div 
              onClick={() => setViewMode('following')}
              className="flex flex-col items-center cursor-pointer"
            >
              <span className="font-bold">{followedUsers.length}</span>
              <img 
                src="/following-title.png" 
                alt="Following" 
                className="h-3.5 w-auto object-contain opacity-40" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
            <div 
              onClick={() => setViewMode('enemies')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <span className="font-bold text-rose-600">{enemies.length}</span>
              <img 
                src="/enemies-title.png" 
                alt="Enemies" 
                className="h-3 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col" {...heartsHandlers}>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold">
              {userProfile.fullName || (userProfile.username ? `@${userProfile.username}` : 'Loading...')}
            </h2>
            <div className="flex items-center gap-0.5">
              <ProfileHeartsToggle isVisible={showHearts} lives={profileData?.lives ?? 3} />
            </div>
          </div>
          <p className="text-sm text-zinc-600">{userProfile.bio}</p>
          <a href="#" className="text-sm text-blue-900 font-medium">{userProfile.website}</a>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setEditEditForm(userProfile);
              setIsEditing(true);
            }}
            className="flex-1 bg-zinc-100 py-1.5 rounded-lg flex items-center justify-center transition-all hover:bg-zinc-200 active:scale-95"
          >
            <img 
              src="/edit-profile-title.png" 
              alt="Edit Profile" 
              className="h-4 w-auto object-contain" 
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </button>
          <button 
            onClick={() => setViewMode('enemies')}
            className={`flex-1 py-1.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border flex items-center justify-center ${
              viewMode === 'enemies' ? 'bg-rose-600 border-rose-500' : 'bg-white border-red-100 hover:bg-red-50'
            }`}
          >
            <img 
              src="/enemies-title.png" 
              alt="Enemies" 
              className={`h-4 w-auto object-contain ${viewMode === 'enemies' ? 'brightness-0 invert' : ''}`} 
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </button>
        </div>
      </div>

      <div className="flex border-t border-zinc-100 mt-4 items-center">
        <button 
          onClick={() => setViewMode('posts')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'posts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
        >
          <Grid size={24} />
        </button>
        {!hasActed && (
          <div 
            onClick={toggleTraitor}
            className="w-20 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-xl hover:bg-zinc-100/50 active:scale-95"
            title="Traitor Toggle"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-200/40" />
          </div>
        )}
        <button 
          onClick={() => setViewMode('enemies')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'enemies' ? 'border-rose-600' : 'border-transparent text-zinc-400'}`}
        >
          <img 
            src="/enemies-icon.png" 
            alt="Enemies" 
            className={cn(
              "w-7 h-7 object-contain transition-all duration-300",
              viewMode === 'enemies' ? "brightness-0 invert-[.13] sepia-[.91] saturate-[74.13] hue-rotate-[354deg] brightness-[.89] contrast-[1.24]" : "opacity-40"
            )}
          />
        </button>
        <button 
          className="flex-1 flex items-center justify-center h-12 border-b-2 border-transparent opacity-20 cursor-not-allowed"
          title="Trophies coming soon"
        >
          <img 
            src="/trophy-icon.png" 
            alt="Trophies" 
            className="w-6 h-6 object-contain" 
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </button>
      </div>

      {/* Content */}
      {viewMode === 'posts' ? (
        loadingPosts && mergedPosts.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          </div>
        ) : mergedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 pb-4">
            {mergedPosts.map((post, index) => (
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
      ) : viewMode === 'enemies' ? (
        <div className="flex-1 bg-zinc-50/50 p-4">
          <div className="space-y-3">
            {enemies.length > 0 ? (
              enemies.map((enemy) => (
                <div key={enemy.id} className="bg-white rounded-xl p-3 border border-red-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                      <img 
                        src="/enemies-icon.png" 
                        alt="Enemy" 
                        className="w-6 h-6 object-contain brightness-0 invert-[.13] sepia-[.91] saturate-[74.13] hue-rotate-[354deg] brightness-[.89] contrast-[1.24]" 
                      />
                    </div>
                    <span className="font-bold text-sm">@{enemy.username}</span>
                  </div>
                  <button 
                    onClick={() => removeEnemy(enemy.id)}
                    className="text-xs text-zinc-400 font-bold hover:text-zinc-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <EmptyFeed 
                className="min-h-[40vh] pt-16" 
                subtitle="Nobody yet" 
              />
            )}
          </div>
        </div>
      ) : viewMode === 'following' ? (
        <div className="space-y-3 p-4">
          {followedUsers.length > 0 ? (
            followedUsers.map((username) => (
              <div key={username} className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="/custom-empty-profile.png" className="w-10 h-10 rounded-full border border-zinc-50" alt={username} />
                  <span className="font-bold text-sm">@{username}</span>
                </div>
                <button 
                  onClick={() => toggleFollow(username)}
                  className="text-xs text-rose-600 font-black uppercase tracking-widest"
                >
                  Following
                </button>
              </div>
            ))
          ) : (
            <EmptyFeed className="min-h-[40vh] pt-24" subtitle="Nobody yet" />
          )}
        </div>
      ) : (
        <EmptyFeed className="min-h-[40vh] pt-16" subtitle="Nobody yet" />
      )}
      </div>
  );
};

export default Profile;
