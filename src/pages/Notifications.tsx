import React from 'react';
import { useChallenge } from '../contexts/ChallengeContext';
import ChallengeTimer from '../components/ChallengeTimer';
import { cn } from '../utils';

const Notifications = () => {
  const { t, isActive, toggleFollow, followedUsers, isSurvivor } = useChallenge();

  const notifications = [
    {
      id: 1,
      type: 'upvote',
      user: 'sarah_j',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+young+woman+with+long+brown+hair&image_size=square',
      content: t('notif_upvoted'),
      time: '5m',
      postImage: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square'
    },
    {
      id: 2,
      type: 'comment',
      user: 'mike_travels',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+man+with+a+beard+outdoors&image_size=square',
      content: `${t('notif_commented')} "Amazing view! Where is this?"`,
      time: '20m',
      postImage: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful+sunset+over+a+tropical+beach+with+palm+trees&image_size=square'
    },
    {
      id: 3,
      type: 'follow',
      user: 'tech_guru',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional+headshot+of+a+man+in+a+tech+office&image_size=square',
      content: t('notif_started_following'),
      time: '1h',
      isFollowing: false
    },
    {
      id: 4,
      type: 'upvote',
      user: 'anna_dev',
      avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional+headshot+of+a+woman+in+a+tech+office&image_size=square',
      content: t('notif_upvoted'),
      time: '3h',
      postImage: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square'
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <header className="px-4 py-2 flex flex-col items-start border-b border-zinc-100 sticky top-0 bg-white z-10">
        <h1 className="flex items-center gap-2">
          <img src="/activity-icon.png" alt="" className="h-8 w-8 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
          <img 
            src="/activity-header.png" 
            alt={t('notif_activity')} 
            className="h-8 w-auto object-contain" 
            style={{ imageRendering: '-webkit-optimize-contrast' }} 
          />
        </h1>
        {isActive && (
          <div className="mt-2 w-full min-w-[200px]">
            <ChallengeTimer />
          </div>
        )}
      </header>

      <div className="flex flex-col divide-y divide-zinc-50">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-center p-4 space-x-3">
            <img src={notif.avatar} alt={notif.user} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 text-sm">
              <span className="font-bold text-zinc-900">{notif.user}</span>{' '}
              <span className="text-zinc-700">{notif.content}</span>{' '}
              <span className="text-zinc-500 text-xs font-medium">{notif.time}</span>
            </div>
            {notif.postImage ? (
              <img src={notif.postImage} alt="Post" className="w-10 h-10 rounded object-cover" />
            ) : (
              isSurvivor(notif.user) && (
                <button 
                  onClick={() => toggleFollow(notif.user)}
                  className="transition-all active:scale-95 hover:scale-105"
                >
                  {followedUsers.includes(notif.user) ? (
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200">Following</span>
                  ) : (
                    <img 
                      src="/btn-follow.png" 
                      alt="Follow" 
                      className="h-7 w-auto object-contain" 
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                  )}
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
