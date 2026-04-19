import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';
import { useChallenge } from '../contexts/ChallengeContext';
import { setTraitorStatus } from '../hooks/useSupabase';
import { PixelHeart } from './PixelHeart';
import { ProfileHeartsToggle } from './ProfileHeartsToggle';
import { useLongPress } from '../hooks/useLongPress';
import { decrementUserLives } from '../hooks/useSupabase';

interface PostProps {
  id: number;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  time: string;
  type?: 'image' | 'video';
  gameMode?: string | null;
  onDelete?: () => void;
  onPass?: () => void;
  comments: { id: number; username: string; text: string; time: string; }[];
  isTraitorGlobal?: boolean;
  globalLives?: number;
}

const PostCard = ({ id, username, avatar, image, caption, time, type = 'image', gameMode, onDelete, onPass, comments, isTraitorGlobal, globalLives = 3 }: PostProps) => {
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [hasActed, setHasActed] = useState(false);
  const [isSwornLocal, setIsSwornLocal] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [showHearts, setShowHearts] = useState(false);
  const [isTraitor, setIsTraitor] = useState(false);
  const navigate = useNavigate();
  const { addEnemy, addSwornEnemy, removeEnemy, enemies, addComment, userProfile, postComments, isLegend, isSurvivor, toggleFollow, followedUsers, t, userVotes, postLives, userLives, setUserVoteForPost, setPostLivesForPost, setUserLivesForUser } = useChallenge();

  // Track downvote per TARGET USERNAME (not per post) — 1 click per voter per person
  const userVote = userVotes[`user_${username}`] !== undefined ? userVotes[`user_${username}`] : 0;
  
  // Optimistic lives: Use global value as base, but allow instant local decrements
  const [optimisticLives, setOptimisticLives] = useState(globalLives);
  
  // Sync with database when global values change
  React.useEffect(() => {
    setOptimisticLives(globalLives);
  }, [globalLives]);

  const { handlers: heartsHandlers } = useLongPress(() => {
    setShowHearts(prev => !prev);
  }, 400);

  const isEnemy = enemies.some(e => e.username === username);
  const isSwornEnemy = enemies.find(e => e.username === username)?.isSworn || false;
  const isMe = username === userProfile.username;
  const localComments = postComments[id] || [];

  const { handlers: enemyLongPress } = useLongPress(() => {
    setIsSwornLocal(prev => !prev);
  }, 400);

  const toggleTraitor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTraitor(!isTraitor);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    addComment(id, quickComment.trim());
    setQuickComment('');
    // Removed navigation to let user stay on Home screen
  };

  const handleAddEnemy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isTraitor) {
      // Set traitor status globally in Supabase
      setIsTraitor(true);
      await setTraitorStatus(username, true);
      return;
    }

    const survivorData = { id, username, avatar, image, caption, time, comments };
    
    if (isEnemy) {
      const enemyToRemove = enemies.find(e => e.username === username);
      if (enemyToRemove) {
        removeEnemy(enemyToRemove.id);
      }
      setShowAddedFeedback(false);
      setHasActed(false);
    } else {
      if (isSwornLocal) {
        addSwornEnemy(survivorData);
      } else {
        addEnemy(survivorData);
      }
      setShowAddedFeedback(true);
      setHasActed(true);
    }
  };

  const handleVote = async (vote: 1 | -1) => {
    if (!userProfile.username) {
      alert("Please log in to participate in the elimination rounds.");
      navigate('/login');
      return;
    }

    if (!gameMode) {
      alert("Click on the purple '+' icon and select any variant for the icons to work.");
      return;
    }

    if (gameMode === 'pley') {
      if (vote === 1) {
        return; // Downvotes only in Pley
      }
      if (vote === -1) {
        if (userVote === -1) {
          // Already downvoted this USER — blocked regardless of which post
          return;
        } else {
          // Apply downvote: keyed by TARGET USERNAME so 1 click = 1 heart across all their posts
          setUserVoteForPost(`user_${username}`, -1);
          setOptimisticLives(prev => Math.max(0, prev - 1));
          
          // Sync to global database
          await decrementUserLives(username);
          
          if (globalLives <= 1) {
            if (onDelete) onDelete();
          }
        }
        return;
      }
    }

    if (userVote === vote) {
      setUserVoteForPost(id, 0);
    } else {
      setUserVoteForPost(id, vote);
    }
  };

  return (
    <div className="flex flex-col border-b border-zinc-100 last:border-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div 
          onClick={() => navigate(`/user/${username}`)}
          className="flex items-center space-x-3 cursor-pointer group"
          {...heartsHandlers}
        >
          <div className="relative">
            <img 
              src={avatar || "/custom-empty-profile.png"} 
              alt={username} 
              className="w-8 h-8 rounded-full object-cover group-hover:ring-2 group-hover:ring-rose-100 transition-all shadow-sm" 
            />
            {isLegend(username) && (
              <div className="absolute -bottom-2 -right-2 flex items-center justify-center pointer-events-none">
                <img 
                  src="/pley-badge.png" 
                  alt="Survivor" 
                  className="w-11 h-11 object-contain" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black italic transition-colors">@{username}</span>
            </div>
            {/* 3 Lives Hearts */}
            <div className="flex items-center gap-0.5 mt-0.5">
              <ProfileHeartsToggle isVisible={showHearts} lives={optimisticLives} heartClassName="w-4 h-4" />
            </div>
          </div>
        </div>
          <div className="flex items-center space-x-2">
            {isTraitorGlobal || isTraitor ? (
              <button 
                onClick={handleAddEnemy}
                className="animate-pop-in transition-all active:scale-95 flex items-center justify-center p-1"
                title="Trigger Traitor Action"
              >
                <img 
                  src="/traitor.png" 
                  alt="Traitor" 
                  className="h-8 w-auto object-contain" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </button>
            ) : (
              <>
                {username !== userProfile.username && (
                <div className="flex items-center">
                  <button 
                  onClick={handleAddEnemy}
                  {...enemyLongPress}
                  className="active:scale-95 drop-shadow-sm"
                >
                  {showAddedFeedback || isEnemy ? (
                    <img 
                      src="/btn-added.png" 
                      alt="Added" 
                      className="h-[28px] w-auto object-contain"
                    />
                  ) : isSwornLocal ? (
                    <img 
                      src="/btn-sworn.png" 
                      alt="Sworn Enemy" 
                      className="h-[28px] w-auto object-contain"
                    />
                  ) : (
                    <img 
                      src="/add-enemy.png" 
                      alt={t('home_add_enemy')} 
                      className="h-[44px] w-auto object-contain rounded-xl"
                    />
                  )}
                </button>
              </div>
                )}
                {!isMe && isSurvivor(username) && (
                  <button 
                    onClick={() => toggleFollow(username)}
                    className="transition-all active:scale-95 hover:scale-105"
                  >
                    {followedUsers.includes(username) ? (
                      <img 
                        src="/btn-following.png" 
                        alt="Following" 
                        className="h-8 w-auto object-contain" 
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                      />
                    ) : (
                      <img 
                        src="/btn-follow.png" 
                        alt="Follow" 
                        className="h-8 w-auto object-contain" 
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                      />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
      </div>

      {/* Media Content */}
      <div 
        onClick={() => navigate(`/post/${id}`)}
        className="aspect-square bg-zinc-100 overflow-hidden relative flex items-center justify-center cursor-pointer group"
      >
        {type === 'video' ? (
          <video 
            src={image} 
            className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500" 
            controls 
            loop 
            muted 
            playsInline
            autoPlay
          />
        ) : (
          <img 
            src={image} 
            alt="Post content" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 rounded-full px-1.5 py-0.5 transition-all duration-300 shadow-sm bg-zinc-100 border border-zinc-200"
            )}>
              {!gameMode && (
                <button 
                  onClick={() => handleVote(1)}
                  className={cn(
                    "p-1 transition-all duration-300",
                    userVote === 0 && "hover:scale-110"
                  )}
                >
                  <ArrowBigUp 
                    size={22} 
                    fill={userVote === 1 ? "#16a34a" : "transparent"} 
                    stroke={userVote === 1 ? "#16a34a" : "black"}
                    strokeWidth={2}
                  />
                </button>
              )}
              <button 
                onClick={() => handleVote(-1)}
                className={cn(
                  "p-1 transition-all duration-300",
                  userVote === 0 && "hover:scale-110"
                )}
              >
                <ArrowBigDown 
                  size={22} 
                  fill={userVote === -1 ? "#DC143C" : "transparent"} 
                  stroke={userVote === -1 ? "#DC143C" : "black"}
                  strokeWidth={2}
                />
              </button>
            </div>
            
            <button 
              onClick={() => navigate(`/post/${id}`)}
              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors group"
            >
              <MessageCircle size={20} stroke="black" />
            </button>
            {!hasActed && (
              <div 
                onClick={toggleTraitor}
                className="w-20 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-xl hover:bg-zinc-100/50 active:scale-95 touch-none"
                title="Traitor Toggle"
              >
                <div className="w-2 h-2 rounded-full bg-zinc-200/40" />
              </div>
            )}
          </div>
          <button className="text-zinc-700 hover:text-rose-600 transition-colors">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <p className="text-sm">
            <span 
              onClick={() => navigate(`/user/${username}`)}
              className="font-black italic mr-1 cursor-pointer transition-colors"
            >
              @{username}
            </span>
            {caption}
          </p>
          
          {comments.length > 0 && (
            <button 
              onClick={() => navigate(`/post/${id}`)}
              className="text-[10px] text-zinc-500 font-bold mt-1 hover:text-rose-600 transition-colors"
            >
              {t('post_view_comments')} ({localComments.length})
            </button>
          )}

          {localComments.slice(-2).map((comment, idx) => (
            <p key={idx} className="text-xs flex items-center gap-1">
              <span className="font-bold">@{comment.username}</span>
              <span className="text-zinc-700 ml-1">{comment.text}</span>
            </p>
          ))}

          <form 
            onSubmit={handlePostComment}
            className="flex items-center gap-3 pt-3 mt-2 border-t border-zinc-50 group"
          >
            <div className="w-9 h-9 rounded-full border border-zinc-200 overflow-hidden shrink-0 bg-zinc-50 shadow-sm">
              <img 
                src={userProfile.avatar || "/custom-empty-profile.png"} 
                className="w-full h-full object-cover" 
                alt="Me" 
              />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-1.5 focus-within:bg-zinc-200/50 transition-colors">
              <input 
                type="text"
                placeholder={t('post_write_comment')}
                className="flex-1 text-xs bg-transparent border-none outline-none py-1"
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!quickComment.trim()}
                className={cn(
                  "transition-all active:scale-95",
                  quickComment.trim() ? "opacity-100 hover:opacity-80" : "opacity-30 cursor-not-allowed grayscale"
                )}
              >
                <img src="/btn-post-comment.png" alt="Post" className="h-[44px] w-auto object-contain" />
              </button>
            </div>
          </form>

          <p className="text-[10px] text-zinc-400 uppercase pt-1">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
