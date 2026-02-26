import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Heart, Bookmark, MoreHorizontal, X } from 'lucide-react';
import { posts } from '../data/posts';
import { cn } from '../utils';
import { useChallenge } from '../contexts/ChallengeContext';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { postComments, addComment } = useChallenge();
  
  const postId = Number(id);
  const post = posts.find(p => p.id === postId);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const localComments = postComments[postId] || [];

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-bold">Post not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-purple-600 font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const finalComment = replyingTo ? `@${replyingTo} ${commentText}` : commentText;
    addComment(postId, finalComment);
    setCommentText('');
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 h-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-zinc-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Comments</h1>
      </header>

      {/* Post Content Summary */}
      <div className="p-4 border-b border-zinc-50 flex gap-3">
        <img src={post.avatar} alt={post.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-bold mr-2">{post.username}</span>
            {post.caption}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase">{post.time}</p>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 shrink-0 flex items-center justify-center text-[10px] font-bold">
                {comment.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{comment.username}</span>
                  <span className="text-[10px] text-zinc-400">{comment.time}</span>
                </div>
                <p className="text-sm text-zinc-700 mt-0.5">{comment.text}</p>
                <button 
                  onClick={() => setReplyingTo(comment.username)}
                  className="text-[10px] text-zinc-500 font-bold mt-1 hover:text-purple-600 transition-colors"
                >
                  Reply
                </button>
              </div>
              <button className="text-zinc-400">
                <Heart size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
            <MessageCircle size={40} strokeWidth={1} className="mb-2 opacity-20" />
            <p className="text-sm">No comments yet</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="sticky bottom-0 bg-white border-t border-zinc-100 p-4 safe-area-pb">
        {replyingTo && (
          <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 mb-2 rounded-lg border border-zinc-100 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <p className="text-[10px] text-zinc-500 font-medium">
              Replying to <span className="font-bold text-purple-600">@{replyingTo}</span>
            </p>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-zinc-100 rounded-2xl px-4 py-2">
          <input 
            type="text" 
            placeholder="Add a comment..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-1"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          />
          <button 
            onClick={handleSendComment}
            disabled={!commentText.trim()}
            className={cn(
              "text-purple-600 font-bold text-sm transition-opacity",
              !commentText.trim() && "opacity-30"
            )}
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
