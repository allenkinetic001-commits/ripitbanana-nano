import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, ShieldAlert, Send, Heart, Trash2, MessageSquare } from 'lucide-react';
import { posts } from '../data/posts';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

const UserDetail = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { 
    addEnemy, enemies, removeEnemy, wallPosts, addWallPost, userProfile,
    toggleFollow, followedUsers, isLegend
  } = useChallenge();
  const [viewMode, setViewMode] = useState<'posts' | 'wall'>('posts');
  const [wallInput, setWallInput] = useState('');

  const userPosts = posts.filter(p => p.username === username);
  const isEnemy = enemies.some(e => e.username === username);
  const userWallPosts = wallPosts.filter(p => p.targetUser === username);
  const userIsLegend = username ? isLegend(username) : false;
  const isFollowing = username ? followedUsers.includes(username) : false;

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
          <div className="w-20 h-20 rounded-full border border-zinc-200 overflow-hidden">
            <img
              src={userPosts[0]?.avatar || `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Profile+avatar+for+${username}&image_size=square`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="font-bold">{userPosts.length}</span>
              <span className="text-xs text-zinc-500">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">842</span>
              <span className="text-xs text-zinc-500">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">156</span>
              <span className="text-xs text-zinc-500">Following</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">{username}</h2>
            {userIsLegend && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded flex items-center gap-0.5">
                Legend
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-600">Digital Creator | Explorer 🌍</p>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => username && toggleFollow(username)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all",
              isFollowing 
                ? "bg-zinc-100 text-zinc-400 border border-zinc-200" 
                : "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
            )}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button 
            onClick={() => navigate(`/chat/${username}`)}
            className="flex-1 bg-zinc-100 py-1.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Message
          </button>
          <button 
            onClick={() => {
              if (isEnemy) {
                const enemy = enemies.find(e => e.username === username);
                if (enemy) removeEnemy(enemy.id);
              } else {
                if (userPosts[0]) addEnemy(userPosts[0]);
              }
            }}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors",
              isEnemy ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-900"
            )}
          >
            {isEnemy ? 'Enemy Marked' : 'Mark Enemy'}
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
          onClick={() => setViewMode('wall')}
          className={`flex-1 flex items-center justify-center h-12 border-b-2 transition-colors ${viewMode === 'wall' ? 'border-purple-600 text-purple-600' : 'border-transparent text-zinc-400'}`}
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Content */}
      {viewMode === 'posts' ? (
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
        <div className="flex-1 bg-zinc-50/50 p-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{username}'s Wall</h2>
          </div>

          <form onSubmit={handlePostToWall} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <img src={userProfile.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-100 shadow-sm" alt="Me" />
              <textarea 
                value={wallInput}
                onChange={(e) => setWallInput(e.target.value)}
                placeholder={`Write something to ${username}...`}
                className="flex-1 bg-white border border-zinc-100 rounded-2xl p-3 text-sm outline-none focus:border-purple-300 transition-all resize-none h-24 shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={!wallInput.trim()}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  wallInput.trim() ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg" : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                )}
              >
                post to wall
              </button>
            </div>
          </form>

          <div className="space-y-4 pt-2">
            {userWallPosts.length > 0 ? (
              userWallPosts.map((post) => (
                <div key={post.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <img src={post.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-100 shadow-sm" alt={post.username} />
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-zinc-900">@{post.username}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{post.time}</span>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed font-medium">{post.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-sm">
                  <MessageSquare size={32} className="text-zinc-100" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-zinc-900 uppercase tracking-tight">Wall is empty</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Be the first to post on {username}'s wall!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
