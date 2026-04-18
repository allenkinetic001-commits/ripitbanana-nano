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
  };
}

// Fetch all posts with profile data joined
export function useSupabasePosts() {
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    // Only set loading to true if we have no posts (to avoid flickering on background refresh)
    if (posts.length === 0) {
      setLoading(true);
    }
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts(data as SupabasePost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
        // Fetch the profile for the new post to maintain JOIN consistency
        const { data: newPostWithProfile } = await supabase
          .from('posts')
          .select('*, profiles(username, full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single();
          
        if (newPostWithProfile) {
          setPosts(prev => [newPostWithProfile as SupabasePost, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(prev => prev.filter(post => post.id !== payload.old.id));
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
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!inner (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('profiles.username', username)
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

// Create a new post
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

// Helper: format a SupabasePost into the shape the existing UI components expect
export function formatPostForUI(post: SupabasePost) {
  const timeAgo = getTimeAgo(post.created_at);
  const isVideo = post.image_url?.startsWith('data:video/') || post.image_url?.endsWith('.mp4');
  
  return {
    id: post.id,
    username: post.profiles?.username || 'unknown',
    avatar: post.profiles?.avatar_url || '',
    image: post.image_url || '',
    type: isVideo ? 'video' : 'image',
    caption: post.caption || '',
    likes: post.likes_count || 0,
    time: timeAgo,
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
