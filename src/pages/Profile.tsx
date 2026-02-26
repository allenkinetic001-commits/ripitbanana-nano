import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Grid, List, Trash2, ShieldAlert, X, Check, Camera, UserPlus, Trophy, Sparkles } from 'lucide-react';
import ChallengeTimer from '../components/ChallengeTimer';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

const userPosts = [
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Stunning+mountain+landscape+at+dawn&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Delicious+plate+of+sushi+artfully+arranged&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Abstract+digital+art+with+vibrant+colors&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful+sunset+over+a+tropical+beach+with+palm+trees&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up+of+a+gourmet+burger+with+melted+cheese+and+crispy+fries&image_size=square',
];

const Profile = () => {
  const navigate = useNavigate();
  const { 
    enemies, removeEnemy, userProfile, setUserProfile, 
    followedUsers, toggleFollow, isLegend, survivorHistory,
    t
  } = useChallenge();
  const [viewMode, setViewMode] = useState<'posts' | 'enemies' | 'following'>('enemies');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditEditForm] = useState(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get data for followed users from history or default data
  const followedUsersData = followedUsers.map(username => {
    const historyData = survivorHistory.find(s => s.username === username);
    return {
      username,
      avatar: historyData?.avatar || `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Profile+avatar+for+${username}&image_size=square`,
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
        <h1 className="text-lg font-bold">{userProfile.username}</h1>
        <div className="flex items-center gap-3">
          <ChallengeTimer />
          <button 
            onClick={() => setViewMode(viewMode === 'following' ? 'enemies' : 'following')}
            className={cn(
              "transition-all duration-300",
              viewMode === 'enemies' ? "text-rose-600" : "text-zinc-700 hover:text-purple-600"
            )}
            title={viewMode === 'enemies' ? "Switch to Following" : "Switch to Enemies"}
          >
            {viewMode === 'enemies' ? <ShieldAlert size={24} /> : <UserPlus size={24} />}
          </button>
          <div className="relative">
            <button 
              onClick={() => navigate('/settings')}
              className="text-zinc-700 hover:bg-zinc-100 p-2 rounded-full transition-colors"
            >
              <Settings size={24} />
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
            <button onClick={handleSaveProfile} className="text-purple-600 font-bold">
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
                  src={editForm.avatar} 
                  className="w-24 h-24 rounded-full object-cover border border-zinc-200"
                  alt="Avatar"
                />
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-600 text-sm font-bold"
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
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-purple-600 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username</label>
                <input 
                  type="text" 
                  value={editForm.username}
                  onChange={(e) => setEditEditForm({...editForm, username: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-purple-600 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Website</label>
                <input 
                  type="text" 
                  value={editForm.website}
                  onChange={(e) => setEditEditForm({...editForm, website: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-purple-600 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bio</label>
                <textarea 
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditEditForm({...editForm, bio: e.target.value})}
                  className="w-full py-2 border-b border-zinc-100 outline-none text-sm font-medium focus:border-purple-600 transition-colors resize-none"
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
            className="relative w-20 h-20 rounded-full border border-zinc-200 overflow-hidden cursor-pointer group"
          >
            <img
              src={userProfile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-zinc-200 shadow-sm">
              <Camera size={12} className="text-zinc-600" />
            </div>
          </div>
          <div className="flex-1 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="font-bold">24</span>
              <span className="text-xs text-zinc-500">{t('profile_posts')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">1.2k</span>
              <span className="text-xs text-zinc-500">{t('profile_followers')}</span>
            </div>
            <div 
              onClick={() => setViewMode('following')}
              className="flex flex-col items-center cursor-pointer"
            >
              <span className="font-bold">{followedUsers.length}</span>
              <span className="text-xs text-zinc-500">{t('profile_following')}</span>
            </div>
            <div 
              onClick={() => setViewMode('enemies')}
              className="flex flex-col items-center text-rose-600 cursor-pointer"
            >
              <span className="font-bold">{enemies.length}</span>
              <span className="text-xs font-bold uppercase tracking-tighter">{t('profile_enemies')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold">{userProfile.fullName}</h2>
          <p className="text-sm text-zinc-600">{userProfile.bio}</p>
          <a href="#" className="text-sm text-blue-900 font-medium">{userProfile.website}</a>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setEditEditForm(userProfile);
              setIsEditing(true);
            }}
            className="flex-1 bg-zinc-100 py-1.5 rounded-lg text-sm font-semibold"
          >
            {t('profile_edit')}
          </button>
          <button 
            onClick={() => setViewMode('enemies')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all duration-300 shadow-sm hover:shadow-md border ${
              viewMode === 'enemies' ? 'bg-rose-600 text-white border-rose-500' : 'text-[#DC143C] bg-white border-red-100 hover:bg-red-50'
            }`}
          >
            {t('profile_tab_enemies')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-zinc-100 mt-4">
        <button 
          onClick={() => setViewMode('posts')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'posts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
        >
          <Grid size={24} />
        </button>
        <button 
          onClick={() => setViewMode('enemies')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'enemies' ? 'border-rose-600 text-rose-600' : 'border-transparent text-zinc-400'}`}
        >
          <ShieldAlert size={24} />
        </button>
        <button 
          onClick={() => setViewMode('following')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'following' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
        >
          <UserPlus size={24} />
        </button>
      </div>

      {/* Content */}
      {viewMode === 'posts' ? (
        <div className="grid grid-cols-3 gap-0.5 pb-4">
          {userPosts.map((post, index) => (
            <div key={index} className="aspect-square bg-zinc-100 overflow-hidden">
              <img src={post} alt={`Post ${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : viewMode === 'enemies' ? (
        <div className="flex-1 bg-zinc-50/50 p-4 space-y-3">
          {enemies.length > 0 ? (
            enemies.map((enemy) => (
              <div key={enemy.id} className="bg-white p-3 rounded-2xl border border-zinc-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <img src={enemy.avatar} alt={enemy.username} className="w-12 h-12 rounded-full object-cover border-2 border-rose-100 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-zinc-900">@{enemy.username}</span>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{t('profile_marked_enemy')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeEnemy(enemy.id)}
                  className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-full"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                <ShieldAlert size={32} className="text-zinc-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-zinc-900 uppercase">{t('profile_no_enemies')}</p>
                <p className="text-xs text-zinc-400 font-medium">{t('profile_enemies_desc')}</p>
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'following' ? (
        <div className="flex-1 bg-zinc-50/50 p-4 space-y-3">
          {followedUsersData.length > 0 ? (
            followedUsersData.map((user) => (
              <div key={user.username} className="bg-white p-3 rounded-2xl border border-zinc-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  <div className="relative">
                    <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-100 shadow-sm" />
                    {user.isLegend && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                        <Trophy size={10} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-zinc-900">@{user.username}</span>
                      {user.isLegend && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded">{t('profile_legend')}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('profile_following')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleFollow(user.username)}
                  className="px-4 py-1.5 bg-zinc-100 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all active:scale-95"
                >
                  {t('profile_unfollow')}
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                <UserPlus size={32} className="text-zinc-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-zinc-900 uppercase">{t('profile_no_following')}</p>
                <p className="text-xs text-zinc-400 font-medium">{t('profile_following_desc')}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
