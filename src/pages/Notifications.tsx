import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { supabase } from '../lib/supabase';
import EmptyFeed from '../components/Empty';


const Notifications = () => {
  const navigate = useNavigate();
  const { t, toggleFollow, followedUsers, isSurvivor, setUnreadMessageCount } = useChallenge();
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('notifications_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(notifications.length === 0);

  const clearNotifications = async () => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return;

    const now = new Date().toISOString();
    // 1. Set local persistent flag immediately
    localStorage.setItem(`notifications_last_cleared_${userId}`, now);
    localStorage.removeItem('notifications_cache');
    localStorage.removeItem(`chat_messages_${userId}`); // Clear the chat cache too!
    setNotifications([]);

    // 2. Attempt universal deletion from DB
    await supabase
      .from('messages')
      .delete()
      .eq('receiver_id', userId);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem('supabaseUserId');
      if (!userId) return;

      const lastCleared = localStorage.getItem(`notifications_last_cleared_${userId}`);

      // Fetch recent messages received by the user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          text,
          created_at,
          read,
          sender_id,
          profiles:sender_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })
        .limit(40); // Fetch more to ensure we have enough after filtering
      
      if (!error && data) {
        let formatted = data.map((m: any) => ({
          id: m.id,
          user: m.profiles?.username || 'unknown',
          fullName: m.profiles?.full_name || 'Survivor',
          avatar: m.profiles?.avatar_url || '/custom-empty-profile.png',
          content: `sent you: "${m.text.substring(0, 30)}${m.text.length > 30 ? '...' : ''}"`,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: m.created_at,
          read: m.read,
          type: 'message'
        }));

        // STRICT FILTER: Remove anything older than the last clear action
        if (lastCleared) {
          const clearDate = new Date(lastCleared);
          formatted = formatted.filter(n => new Date(n.created_at) > clearDate);
        }

        setNotifications(formatted);
        localStorage.setItem('notifications_cache', JSON.stringify(formatted));
      }
      setLoading(false);
    };

    fetchNotifications();

    // Reset global unread count when viewing notifications
    setUnreadMessageCount(0);
    
    // Mark all as read in DB (simplified for now)
    const userId = localStorage.getItem('supabaseUserId');
    if (userId) {
      supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', userId)
        .eq('read', false)
        .then();
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <header className="px-4 py-2 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white z-10">
        <h1 className="flex items-center gap-2">
          <img src="/activity-icon.png" alt="" className="h-8 w-8 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
          <img 
            src="/activity-header-v3.png" 
            alt={t('notif_activity')} 
            className="h-6 w-auto object-contain" 
            style={{ imageRendering: '-webkit-optimize-contrast' }} 
          />
        </h1>
        <button 
          onClick={clearNotifications}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <img 
            src="/garbage-truck-v3.png" 
            alt="Clear notifications" 
            className="h-6 w-auto object-contain"
            style={{ 
              mixBlendMode: 'multiply',
              opacity: 0.4
            }}
          />
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-800 animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="flex flex-col divide-y divide-zinc-50">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`flex items-center p-4 space-x-3 cursor-pointer transition-colors hover:bg-zinc-50 ${!notif.read ? 'bg-zinc-50/50' : ''}`}
              onClick={() => navigate(`/chat/${notif.user}`)}
            >
              <img 
                src={notif.avatar} 
                alt={notif.user} 
                className="w-10 h-10 rounded-full object-cover shrink-0" 
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="flex-1 text-sm">
                <span className="font-black text-zinc-900 tracking-tight">{notif.user}</span>{' '}
                <span className="text-zinc-800 font-medium">{notif.content}</span>{' '}
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{notif.time}</span>
              </div>
              <div className="shrink-0 flex items-center">
                {!notif.read && (
                  <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
                )}
                <div className="ml-2 w-9 h-9 flex items-center justify-center">
                  <img 
                    src="/nav-chat-v3.png" 
                    alt="Reply" 
                    className="w-7 h-7 object-contain opacity-100" 
                    style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyFeed subtitle="No recent activity" />
      )}
    </div>
  );
};

export default Notifications;
