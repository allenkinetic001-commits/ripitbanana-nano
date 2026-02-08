import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

interface PostProps {
  id: number;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  time: string;
  gameMode?: string | null;
  onDelete?: () => void;
  onPass?: () => void;
}

const PostCard = ({ id, username, avatar, image, caption, time, gameMode, onDelete, onPass }: PostProps) => {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const navigate = useNavigate();

  const handleVote = (vote: 1 | -1) => {
    if (gameMode === 'vause' || gameMode === 'pley') {
      if (vote === 1) {
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
        <div className="flex items-center space-x-3">
          <img src={avatar} alt={username} className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-semibold">{username}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-[#DC143C] hover:text-[#B22222] transition-colors group px-2 py-1 rounded-md hover:bg-red-50">
            <span className="text-sm font-bold">Add Enemy</span>
          </button>
          <button className="text-zinc-500">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-zinc-100 overflow-hidden">
        <img src={image} alt="Post content" className="w-full h-full object-cover" />
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
            <span className="font-bold mr-2">{username}</span>
            {caption}
          </p>
          <p className="text-[10px] text-zinc-400 uppercase">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
