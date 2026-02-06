import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Bookmark, MoreHorizontal, Eye, MessageCircle } from 'lucide-react';

const ModernDesignComponent: React.FC = () => {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleVote = (vote: 1 | -1) => {
    if (userVote === vote) {
      setUserVote(0);
    } else {
      setUserVote(vote);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-lg">MD</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-600 transition-colors">Modern Designer</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <span>15 min ago</span>
              <span className="text-purple-400">•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                1.2k
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#DC143C] hover:text-[#B22222] transition-all duration-300 group px-6 py-2.5 rounded-2xl hover:bg-red-50">
            <span className="text-sm font-black tracking-wider">Add Enemy</span>
          </button>
          <button className="p-3 hover:bg-white/60 rounded-full transition-all duration-300 group-hover:scale-110">
            <MoreHorizontal className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Image Content with enhanced design */}
      <div className="relative">
        <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-6 left-6 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse delay-500"></div>
            <div className="absolute top-1/3 right-8 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-1000"></div>
          </div>
          
          {/* Main content */}
          <div className="text-center relative z-10 space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white/95 backdrop-blur-md rounded-full mx-auto flex items-center justify-center shadow-2xl border-2 border-white/50 group-hover:scale-110 transition-transform duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-inner">
                  <ArrowBigUp className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full animate-bounce delay-100"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-300"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Modern Design System</h2>
              <p className="text-gray-600 text-base max-w-xs mx-auto leading-relaxed">
                A beautiful, responsive design that combines modern aesthetics with intuitive user experience
              </p>
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full px-2 py-1 transition-all duration-300 ${
              userVote === 1 ? 'bg-green-600' : userVote === -1 ? 'bg-[#DC143C]' : 'bg-gray-50'
            }`}>
              <button 
                onClick={() => handleVote(1)}
                className="p-1 transition-all duration-300 hover:scale-110"
              >
                <ArrowBigUp 
                  className="w-7 h-7"
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
                  className="w-7 h-7"
                  fill="white"
                  stroke={userVote !== 0 ? "none" : "black"}
                  strokeWidth={userVote !== 0 ? 0 : 2}
                />
              </button>
            </div>
            
            <button className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 h-10 w-10 rounded-full transition-all duration-300 group hover:scale-110">
              <MessageCircle size={20} stroke="black" />
            </button>
          </div>
          
          <button 
            onClick={handleBookmark}
            className={`transition-all duration-300 hover:scale-110 ${
              isBookmarked ? 'text-purple-500' : 'text-gray-600 hover:text-purple-500'
            }`}
          >
            <Bookmark 
              className={`w-6 h-6 transition-all ${
                isBookmarked ? 'fill-purple-500 text-purple-500' : ''
              }`} 
            />
          </button>
        </div>
        
        {/* Description with enhanced styling */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-900 leading-relaxed">
            <span className="font-bold text-gray-900">Modern Designer</span> 
            <span className="text-gray-700">
              ✨ Just finished working on this amazing design system! The combination of smooth animations, 
              gradient backgrounds, and interactive elements creates an engaging user experience. 
              What do you think about the color palette? 🎨
            </span>
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">#design</span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">#ui/ux</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">#modern</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">#creative</span>
          </div>
          
          <button className="text-gray-500 text-xs hover:text-gray-700 transition-colors font-medium">
            View all 23 comments →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernDesignComponent;
