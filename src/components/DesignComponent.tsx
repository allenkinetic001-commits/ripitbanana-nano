import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MoreHorizontal, MessageCircle } from 'lucide-react';

const DesignComponent: React.FC = () => {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);

  const handleVote = (vote: 1 | -1) => {
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">JD</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">John Doe</h3>
            <p className="text-gray-500 text-xs">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[#DC143C] hover:text-[#B22222] transition-colors group px-3 py-1.5 rounded-md hover:bg-red-50">
            <span className="text-sm font-bold">Add Enemy</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
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
            <div className={`flex items-center space-x-1 rounded-full px-1 transition-all duration-300 ${
              userVote === 1 ? 'bg-green-600' : userVote === -1 ? 'bg-[#DC143C]' : 'bg-zinc-50'
            }`}>
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

            <button className="flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 h-8 w-8 rounded-full transition-colors group">
              <MessageCircle size={20} stroke="black" />
            </button>
          </div>
          
          <button className="hover:text-purple-500 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">John Doe</span> This is a beautiful design that combines modern aesthetics with functional user experience. The color palette and layout create an engaging visual hierarchy.
          </p>
          <button className="text-gray-500 text-xs hover:text-gray-700 transition-colors">
            View all 12 comments
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignComponent;
