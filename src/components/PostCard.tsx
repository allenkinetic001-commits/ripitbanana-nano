import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MoreHorizontal, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';
import { useChallenge } from '../contexts/ChallengeContext';

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
}

const PostCard = ({ id, username, avatar, image, caption, time, type = 'image', gameMode, onDelete, onPass, comments }: PostProps) => {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const navigate = useNavigate();
  const { addEnemy, enemies, addComment, userProfile, postComments, t } = useChallenge();

  const isEnemy = enemies.some(e => e.id === id);
  const isMe = username === userProfile.username;
  const localComments = postComments[id] || [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    addComment(id, quickComment.trim());
    setQuickComment('');
    // Removed navigation to let user stay on Home screen
  };

  const handleAddEnemy = () => {
    if (isEnemy) return;
    addEnemy({ id, username, avatar, image, caption, time, comments });
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1000);
  };

  const handleVote = (vote: 1 | -1) => {
    if (!gameMode) {
      alert("Click on the purple '+' icon and select any variant for the icons to work.");
      return;
    }

    if (gameMode === 'vause' || gameMode === 'pley' || gameMode === 'kight') {
      if (vote === 1) {
        if (gameMode === 'kight' || gameMode === 'pley') return; // Downvotes only in Kight and Pley
        if (onPass) onPass();
        return;
      }
      if (vote === -1) {
        if (onDelete) onDelete();
        return;
      }
    }

    if (userVote === vote) {
      setUserVote(0);
    } else {
      setUserVote(vote);
    }
  };

  return (
    <div className="flex flex-col border-b border-zinc-100 last:border-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div 
          onClick={() => navigate(`/user/${username}`)}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img src={avatar} alt={username} className="w-8 h-8 rounded-full object-cover group-hover:ring-2 group-hover:ring-purple-100 transition-all" />
          <span className="text-sm font-semibold group-hover:text-purple-600 transition-colors">{username}</span>
        </div>
        <div className="flex items-center space-x-2">
          {!isMe && (!isEnemy || showAddedFeedback) && (
            <button 
              onClick={handleAddEnemy}
              className={cn(
                "transition-all duration-300 group px-2 py-1 rounded-md",
                showAddedFeedback ? "text-rose-600" : "text-[#DC143C] hover:bg-red-50"
              )}
            >
              <span className="text-sm font-bold">
                 {showAddedFeedback ? t('home_added_enemy') : t('home_add_enemy')}
               </span>
            </button>
          )}
        </div>
      </div>

      {/* Media Content */}
      <div className="aspect-square bg-zinc-100 overflow-hidden relative flex items-center justify-center">
        {type === 'video' ? (
          <video 
            src={image} 
            className="w-full h-full object-contain bg-black" 
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
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 rounded-full px-1 transition-all duration-300",
              userVote === 1 ? "bg-green-600" : userVote === -1 ? "bg-[#DC143C]" : "bg-zinc-100"
            )}>
              {(!gameMode || gameMode === 'vause') && (
                <button 
                  onClick={() => handleVote(1)}
                  className={cn(
                    "p-1 transition-all duration-300",
                    userVote === 0 && "hover:scale-110"
                  )}
                >
                  <ArrowBigUp 
                    size={24} 
                    fill="white" 
                    stroke={userVote !== 0 ? "none" : "black"}
                    strokeWidth={userVote !== 0 ? 0 : 2}
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
                  size={24} 
                  fill="white" 
                  stroke={userVote !== 0 ? "none" : "black"}
                  strokeWidth={userVote !== 0 ? 0 : 2}
                />
              </button>
            </div>
            
            <button 
              onClick={() => navigate(`/post/${id}`)}
              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors group"
            >
              <MessageCircle size={20} stroke="black" />
            </button>
          </div>
          <button className="text-zinc-700 hover:text-zinc-400 transition-colors">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <p className="text-sm">
            <span 
              onClick={() => navigate(`/user/${username}`)}
              className="font-bold mr-2 cursor-pointer hover:text-purple-600 transition-colors"
            >
              {username}
            </span>
            {caption}
          </p>
          
          {comments.length > 0 && (
            <button 
              onClick={() => navigate(`/post/${id}`)}
              className="text-xs text-zinc-500 font-medium hover:text-zinc-700 transition-colors"
            >
              {t('post_view_comments')} ({localComments.length})
            </button>
          )}

          {localComments.slice(-2).map((comment, idx) => (
            <p key={idx} className="text-xs">
              <span className="font-bold mr-2">{comment.username}</span>
              <span className="text-zinc-700">{comment.text}</span>
            </p>
          ))}

          <form 
            onSubmit={handlePostComment}
            className="flex items-center gap-2 pt-3 mt-2 border-t border-zinc-50 group"
          >
            <div className="w-8 h-8 rounded-full border border-zinc-200 overflow-hidden shrink-0">
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Me" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="text"
                placeholder={t('post_write_comment')}
                className="flex-1 text-xs bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 outline-none focus:border-purple-300 focus:bg-white transition-all"
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!quickComment.trim()}
                className={cn(
                  "text-xs font-black transition-all px-2 py-1.5 rounded-lg",
                  quickComment.trim() ? "text-purple-600 hover:bg-purple-50" : "text-zinc-300 cursor-not-allowed"
                )}
              >
                {t('post_add_comment')}
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
