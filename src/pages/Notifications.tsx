import React from 'react';
import { useChallenge } from '../contexts/ChallengeContext';

const Notifications = () => {
  const { t } = useChallenge();

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
      <header className="px-4 h-14 flex items-center border-b border-zinc-100 sticky top-0 bg-white z-10">
        <h1 className="text-lg font-bold">{t('notif_activity')}</h1>
      </header>

      <div className="flex flex-col divide-y divide-zinc-50">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-center p-4 space-x-3">
            <img src={notif.avatar} alt={notif.user} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 text-sm">
              <span className="font-bold">{notif.user}</span>{' '}
              <span className="text-zinc-600">{notif.content}</span>{' '}
              <span className="text-zinc-400 text-xs">{notif.time}</span>
            </div>
            {notif.postImage ? (
              <img src={notif.postImage} alt="Post" className="w-10 h-10 rounded object-cover" />
            ) : (
              <button className="bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">
                {t('notif_follow')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
