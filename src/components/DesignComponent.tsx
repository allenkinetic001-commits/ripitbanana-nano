import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

const DesignComponent: React.FC = () => {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const { addEnemy, enemies, addComment, userProfile, userSelection, majorityVariant } = useChallenge();
  const navigate = useNavigate();

  const gameMode = userSelection || majorityVariant;
  const isEnemy = enemies.some(e => e.id === 888);

  const handlePostComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickComment.trim()) return;
    addComment(888, quickComment);
    setQuickComment('');
  };

  const handleAddEnemy = () => {
    if (isEnemy) return;
    addEnemy({
      id: 888, // Static ID for demo component
      username: 'John Doe',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+man&image_size=square',
      image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+design+content&image_size=square',
      caption: 'This is a beautiful design that combines modern aesthetics.',
      time: '2 hours ago',
      comments: []
    });
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1000);
  };

  const handleVote = (vote: 1 | -1) => {
    if (gameMode === 'vause' || gameMode === 'pley' || gameMode === 'kight') {
      if (vote === 1) {
        if (gameMode === 'kight' || gameMode === 'pley') return;
        return;
      }
      if (vote === -1) {
        // In a real app we'd trigger deletion, here we just update UI
        setUserVote(vote);
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
    <div className="bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div 
          onClick={() => navigate('/user/John Doe')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md group-hover:ring-2 group-hover:ring-purple-100 transition-all">
            <span className="text-white font-bold text-sm">JD</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">John Doe</h3>
            <p className="text-gray-500 text-xs">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(!isEnemy || showAddedFeedback) && (
            <button 
              onClick={handleAddEnemy}
              className={`transition-all duration-300 group px-3 py-1.5 rounded-md ${
                showAddedFeedback ? "text-rose-600" : "text-[#DC143C] hover:bg-red-50"
              }`}
            >
              <span className="text-sm font-bold">
                 {showAddedFeedback ? 'Added Enemy' : 'Add Enemy'}
               </span>
            </button>
          )}
        </div>
      </div>

      {/* Image Content */}
      <div className="relative">
        <div className="w-full aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 bg-white/15 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-1/2 right-4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-700"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl border border-white/50">
              <ArrowBigUp className="w-12 h-12 text-orange-400 animate-pulse" />
            </div>
            <p className="text-gray-700 font-bold text-lg">Your Design Content</p>
            <p className="text-gray-500 text-sm mt-1">Beautiful and modern design</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 rounded-full px-1 transition-all duration-300",
              userVote === 1 ? "bg-green-600" : userVote === -1 ? "bg-[#DC143C]" : "bg-zinc-50"
            )}>
              {(!gameMode || gameMode === 'vause') && (
                <button 
                  onClick={() => handleVote(1)}
                  className="p-1 transition-all duration-300 hover:scale-110"
                >
                  <ArrowBigUp 
                    className="w-6 h-6"
                    fill="white"
                    stroke={userVote !== 0 ? "none" : "black"}
                    strokeWidth={userVote !== 0 ? 0 : 2}
                  />
                </button>
              )}
              <button 
                onClick={() => handleVote(-1)}
                className="p-1 transition-all duration-300 hover:scale-110"
              >
                <ArrowBigDown 
                  className="w-6 h-6"
                  fill="white"
                  stroke={userVote !== 0 ? "none" : "black"}
                  strokeWidth={userVote !== 0 ? 0 : 2}
                />
              </button>
            </div>

            <button 
              onClick={() => navigate('/post/888')}
              className="flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 h-8 w-8 rounded-full transition-colors group"
            >
              <MessageCircle size={20} stroke="black" />
            </button>
          </div>
          
          <button className="hover:text-purple-500 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
        
        {/* Description */}
        <div className="space-y-3">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">John Doe</span> This is a beautiful design that combines modern aesthetics with functional user experience. The color palette and layout create an engaging visual hierarchy.
          </p>

          <form 
            onSubmit={handlePostComment}
            className="flex items-center gap-2 pt-3 border-t border-zinc-100"
          >
            <div className="w-8 h-8 rounded-full border border-zinc-200 overflow-hidden shrink-0">
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Me" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Write a comment..."
                className="flex-1 text-xs bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 outline-none focus:border-purple-300 transition-all"
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!quickComment.trim()}
                className={cn(
                  "text-[10px] font-black transition-all px-2 py-1.5 rounded-lg",
                  quickComment.trim() ? "text-purple-600 hover:bg-purple-50" : "text-zinc-300 cursor-not-allowed"
                )}
              >
                Add Comment
              </button>
            </div>
          </form>

          <button 
            onClick={() => navigate('/post/888')}
            className="text-gray-500 text-xs hover:text-gray-700 transition-colors block pt-1"
          >
            View all 12 comments
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignComponent;
