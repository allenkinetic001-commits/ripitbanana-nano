import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, X } from 'lucide-react';
import { cn } from '../utils';
import { useChallenge } from '../contexts/ChallengeContext';
import { supabase } from '../lib/supabase';
import { fetchComments, getTimeAgo } from '../hooks/useSupabase';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { postComments, setPostComments, addComment, allPosts, userProfile } = useChallenge();
  const inputRef = useRef<HTMLInputElement>(null);

  const contextPost = allPosts.find((p: any) => String(p.id) === String(id));
  const [post, setPost] = useState<any>(contextPost || null);
  const [loading, setLoading] = useState(!contextPost);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('liked_comments_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('liked_comments_v1', JSON.stringify(likedComments));
  }, [likedComments]);

  const toggleLikeComment = (commentId: string | number) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  const localComments = (id ? postComments[id] : []) || postComments[Number(id)] || [];

  // Sync post state with context updates (e.g. profile picture edits)
  useEffect(() => {
    if (contextPost) {
      setPost(contextPost);
    }
  }, [contextPost]);

  // Fetch comments from Supabase on mount/load
  useEffect(() => {
    if (id) {
      const getComments = async () => {
        try {
          const { data, error } = await fetchComments(id);
          if (data && !error) {
            const formatted = data.map((c: any) => ({
              id: c.id,
              username: c.profiles?.username || 'unknown',
              avatar: c.profiles?.avatar_url || '/custom-empty-profile.png',
              text: c.text,
              time: getTimeAgo(c.created_at)
            }));
            setPostComments(prev => ({
              ...prev,
              [id]: formatted
            }));
          }
        } catch (e) {
          console.error("Failed to load comments for post:", e);
        }
      };
      getComments();
    }
  }, [id, setPostComments]);

  // Fetch from Supabase for freshness (background update if already in context)
  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        if (!post) setLoading(true);
        const { data } = await supabase
          .from('posts')
          .select('*, profiles(username, full_name, avatar_url)')
          .eq('id', id)
          .single();
        if (data) {
          setPost({
            id: data.id,
            username: data.profiles?.username || 'unknown',
            avatar: data.profiles?.avatar_url || '',
            image: data.image_url || '',
            caption: data.caption || '',
            likes: data.likes_count || 0,
            time: 'Recently',
            type: (data.image_url?.startsWith('data:video/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(data.image_url || '')) ? 'video' : 'image',
            comments: [],
          });
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [id, contextPost]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const finalComment = replyingTo ? `@${replyingTo} ${commentText}` : commentText;
    addComment(id!, finalComment);
    setCommentText('');
    setReplyingTo(null);
    inputRef.current?.blur();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <MessageCircle size={48} className="text-zinc-200 mb-4" />
        <h2 className="text-lg font-bold text-zinc-800">Post not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-zinc-900 font-semibold underline text-sm">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ?? Header ?? */}
      <header className="shrink-0 sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-zinc-800 hover:text-zinc-500 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <img src="/comments-header.png" alt="Comments" className="h-5 w-auto object-contain" />
      </header>

      {/* ?? Scrollable area ?? */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Post media */}
        <div className="w-full aspect-square bg-zinc-100 overflow-hidden">
          {post.type === 'video' ? (
            <video
              src={post.image}
              className="w-full h-full object-contain bg-zinc-50"
              controls autoPlay muted loop playsInline
            />
          ) : (
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Poster row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-zinc-50">
          <img
            src={post.avatar || '/custom-empty-profile.png'}
            alt={post.username}
            onClick={() => navigate(`/user/${post.username}`)}
            className="w-9 h-9 rounded-full object-cover border border-zinc-200 shadow-sm shrink-0 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span
                className="font-black italic cursor-pointer hover:underline"
                onClick={() => navigate(`/user/${post.username}`)}
              >
                @{post.username}
              </span>
              {post.caption ? <span className="ml-2 text-zinc-700">{post.caption}</span> : null}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wide">{post.time}</p>
          </div>
          <button
            onClick={() => setLiked(l => !l)}
            className="shrink-0 flex flex-col items-center gap-0.5 transition-all active:scale-90"
          >
            <Heart
              size={20}
              className={cn('transition-colors', liked ? 'text-rose-500 fill-rose-500' : 'text-zinc-400')}
            />
            <span className="text-[10px] text-zinc-400 font-semibold">
              {(post.likes || 0) + (liked ? 1 : 0)}
            </span>
          </button>
        </div>

        {/* Comments list */}
        <div className="px-4 py-4 space-y-5">
          {localComments.length > 0 ? (
            localComments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
                {/* Commenter avatar */}
                <img
                  src={comment.avatar || '/custom-empty-profile.png'}
                  alt={comment.username}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-100 shadow-sm shrink-0 self-start"
                />
                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="bg-zinc-50 rounded-2xl rounded-tl-sm px-3 py-2">
                    <span className="text-xs font-black text-zinc-900">@{comment.username} </span>
                    <span className="text-sm text-zinc-700">{comment.text}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-[10px] text-zinc-400">{comment.time}</span>
                    <button
                      onClick={() => {
                        setReplyingTo(comment.username);
                        inputRef.current?.focus();
                      }}
                      className="text-[10px] text-zinc-500 font-bold hover:text-zinc-800 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
                {/* Like */}
                <button
                  onClick={() => toggleLikeComment(comment.id)}
                  className={cn(
                    "shrink-0 self-start mt-2 transition-all active:scale-90",
                    likedComments[comment.id] ? "text-rose-500 hover:text-rose-600" : "text-zinc-300 hover:text-rose-400"
                  )}
                >
                  <Heart
                    size={14}
                    className={cn(likedComments[comment.id] && "fill-rose-500 text-rose-500")}
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <img src="/empty-comments.png" alt="Cup Icon" className="w-24 h-24 object-contain grayscale opacity-40" />
              <img src="/no-comment-text.png" alt="no comment yet" className="h-6 mt-2 object-contain grayscale opacity-40" />
            </div>
          )}
        </div>
      </div>

      {/* ?? Sticky comment bar ?? */}
      <div className="shrink-0 fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-4 pt-2 pb-4 safe-area-pb">
        {replyingTo && (
          <div className="flex items-center justify-between bg-zinc-50 px-3 py-1.5 mb-2 rounded-lg border border-zinc-100 animate-in fade-in duration-150">
            <p className="text-[11px] text-zinc-500">
              Replying to <span className="font-bold text-zinc-900">@{replyingTo}</span>
            </p>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-zinc-400 hover:text-rose-500 transition-colors ml-2"
            >
              <X size={13} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          {/* My avatar */}
          <div className="w-9 h-9 rounded-full border border-zinc-200 overflow-hidden shrink-0 bg-zinc-50 shadow-sm">
            <img
              src={userProfile.avatar || '/custom-empty-profile.png'}
              alt="Me"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Input pill */}
          <div className="flex-1 flex items-center gap-2 bg-zinc-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-zinc-300 transition-all">
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
          </div>

          {/* Post button */}
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim()}
            className={cn(
              'shrink-0 transition-all active:scale-90',
              commentText.trim() ? 'opacity-100' : 'opacity-30 cursor-not-allowed grayscale'
            )}
          >
            <img src="/btn-post-comment.png" alt="Post" className="h-10 w-auto object-contain" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
