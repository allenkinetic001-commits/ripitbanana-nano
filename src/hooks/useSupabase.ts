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
      const parsed: SupabasePost[] = JSON.parse(saved);
      // Strip any stale base64 or blob: URLs - they are broken after a page reload
      const clean = parsed.filter(p => {
        const url = p.image_url || '';
        return !url.startsWith('data:') && !url.startsWith('blob:');
      });
      // If we stripped anything, clear the cache so DB fetch replaces it cleanly
      if (clean.length !== parsed.length) {
        localStorage.removeItem('supabase_posts_cache');
        localStorage.removeItem('allPosts_v2');
        localStorage.removeItem('visiblePosts_v2');
      }
      return clean;
    } catch (e) {
      console.error('Failed to parse supabase_posts_cache', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
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
        ),
        comments (
          id,
          text,
          created_at,
          profiles (
            username,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      // Filter out posts where profile is null (meaning the user has been eliminated)
      const validPosts = (data || []).filter((post: any) => post.profiles !== null);
      setPosts(validPosts as any[]);
      localStorage.setItem('supabase_posts_cache', JSON.stringify(validPosts));
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
            .select(`
              *,
              profiles (username, full_name, avatar_url, is_traitor, lives),
              comments (
                id,
                text,
                created_at,
                profiles (
                  username,
                  avatar_url
                )
              )
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (data) {
            newPostWithProfile = data;
            break;
          }
          // wait 500ms before retrying
          await new Promise(r => setTimeout(r, 500));
        }
          
        if (newPostWithProfile && newPostWithProfile.profiles !== null) {
          setPosts(prev => {
            const next = [newPostWithProfile as SupabasePost, ...prev];
            localStorage.setItem('supabase_posts_cache', JSON.stringify(next));
            return next;
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(prev => {
          const next = prev.filter(post => post.id !== payload.old.id);
          localStorage.setItem('supabase_posts_cache', JSON.stringify(next));
          return next;
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, (payload) => {
        // Remove all posts belonging to the deleted profile (eliminated user)
        setPosts(prev => {
          const next = prev.filter(post => post.user_id !== payload.old.id);
          localStorage.setItem('supabase_posts_cache', JSON.stringify(next));
          return next;
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setPosts(prev => {
          const next = prev.map(post => {
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
          });
          localStorage.setItem('supabase_posts_cache', JSON.stringify(next));
          return next;
        });
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
  const ext = (file?.name || '').split('.').pop() || (file?.type?.includes('video') ? 'mp4' : 'jpg');
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

// Create a new post - imageUrl should be a public storage URL (not base64)
export async function createPost(userId: string, caption: string, imageUrl: string, id?: string) {
  const payload: any = {
    user_id: userId,
    caption,
    image_url: imageUrl,
  };
  if (id) payload.id = id;

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
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
  
  // Format comments from database
  const formattedComments = (post.comments || []).map((c: any) => ({
    id: c.id,
    username: c.profiles?.username || 'unknown',
    avatar: c.profiles?.avatar_url || '/custom-empty-profile.png',
    text: c.text,
    time: getTimeAgo(c.created_at),
    createdAt: c.created_at
  })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    id: post.id,
    userId: post.user_id,
    username: post.profiles?.username || 'unknown',
    avatar: post.profiles?.avatar_url || '/custom-empty-profile.png',
    isTraitorGlobal: post.profiles?.is_traitor || false,
    image: url,
    type: isVideo ? 'video' : 'image',
    caption: post.caption || '',
    globalLives: post.profiles?.lives ?? 3,
    time: timeAgo,
    createdAt: post.created_at,
    comments: formattedComments,
  };
}

export function getTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Just now';
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

// Upload avatar file to Supabase Storage, return the public URL
export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: any }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

// Update profile row on the Supabase backend
export async function updateUserProfile(
  userId: string, 
  profile: { username?: string, fullName?: string, bio?: string, website?: string, avatarUrl?: string }
) {
  const payload: any = {};
  if (profile.username !== undefined) payload.username = profile.username;
  if (profile.fullName !== undefined) payload.full_name = profile.fullName;
  if (profile.bio !== undefined) payload.bio = profile.bio;
  if (profile.website !== undefined) payload.website = profile.website;
  if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}
