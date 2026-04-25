import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SupabasePost {
  id: string;
  user_id: string;
  caption: string;
  image_url: string;
  likes_count: number;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
    is_traitor: boolean;
    lives: number;
  };
}

// Fetch all posts with profile data joined
export function useSupabasePosts() {
  const [posts, setPosts] = useState<SupabasePost[]>(() => {
    const saved = localStorage.getItem('supabase_posts_cache');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse supabase_posts_cache', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    // We start with loading=true on mount. We don't need to conditionally set it here.
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url,
          is_traitor,
          lives
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts(data as any[]);
      localStorage.setItem('supabase_posts_cache', JSON.stringify(data));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
        // Fetch the profile for the new post to maintain JOIN consistency
        // Add a small retry loop to handle replication latency
        let newPostWithProfile = null;
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase
            .from('posts')
            .select('*, profiles(username, full_name, avatar_url, is_traitor, lives)')
            .eq('id', payload.new.id)
            .single();
            
          if (data) {
            newPostWithProfile = data;
            break;
          }
          // wait 500ms before retrying
          await new Promise(r => setTimeout(r, 500));
        }
          
        if (newPostWithProfile) {
          setPosts(prev => {
            const next = [newPostWithProfile as SupabasePost, ...prev];
            localStorage.setItem('supabase_posts_cache', JSON.stringify(next));
            return next;
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(prev => prev.filter(post => post.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setPosts(prev => prev.map(post => {
          if (post.user_id === payload.new.id) {
            return {
              ...post,
              profiles: {
                ...post.profiles,
                ...payload.new
              }
            };
          }
          return post;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}

// Fetch posts by a specific username
export async function fetchPostsByUsername(username: string) {
  // First get the profile ID for this username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) return { data: [], error: null };

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return { data: data as SupabasePost[] | null, error };
}

// Fetch a single post by ID
export async function fetchPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single();

  return { data: data as SupabasePost | null, error };
}

// Fetch a profile by username
export async function fetchProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  return { data, error };
}

// Upload media file to Supabase Storage, return the public URL
export async function uploadPostMedia(userId: string, file: File): Promise<{ url: string | null; error: any }> {
  const ext = file.name.split('.').pop() || (file.type.includes('video') ? 'mp4' : 'jpg');
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('posts')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

// Create a new post — imageUrl should be a public storage URL (not base64)
export async function createPost(userId: string, caption: string, imageUrl: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      caption,
      image_url: imageUrl,
    })
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .single();

  return { data: data as SupabasePost | null, error };
}

// Delete a post
export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  return { error };
}

// Fetch comments for a post
export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  return { data, error };
}

// Add a comment
export async function addCommentToPost(postId: string, userId: string, text: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      text,
    })
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

// Set a user as a traitor globally
export async function setTraitorStatus(username: string, status: boolean) {
  // Use RPC to bypass RLS since users are updating OTHER users' profiles
  if (status) {
    const { error } = await supabase.rpc('mark_traitor', { target_username: username });
    return { error };
  } else {
    return { error: null };
  }
}

// Decrement lives globally
export async function decrementUserLives(username: string) {
  const { error } = await supabase.rpc('decrement_lives', { target_username: username });
  return { error };
}

// Helper: format a SupabasePost into the shape the existing UI components expect
export function formatPostForUI(post: any) {
  const timeAgo = getTimeAgo(post.created_at);
  const url = post.image_url || '';
  const isVideo =
    url.startsWith('data:video/') ||
    /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url);
  
  return {
    id: post.id,
    username: post.profiles?.username || 'unknown',
    avatar: post.profiles?.avatar_url || '/custom-empty-profile.png',
    isTraitorGlobal: post.profiles?.is_traitor || false,
    image: url,
    type: isVideo ? 'video' : 'image',
    caption: post.caption || '',
    globalLives: post.profiles?.lives ?? 3,
    time: timeAgo,
    createdAt: post.created_at,
    comments: [],
  };
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
