import React from 'react';
import { useChallenge } from '../contexts/ChallengeContext';
import EmptyFeed from '../components/Empty';

const Notifications = () => {
  const { t, toggleFollow, followedUsers, isSurvivor } = useChallenge();

  // Real notifications from followed users — currently empty until backend feeds data
  const notifications: any[] = [];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <header className="px-4 py-2 flex flex-col items-start border-b border-zinc-100 sticky top-0 bg-white z-10">
        <h1 className="flex items-center gap-2">
          <img src="/activity-icon.png" alt="" className="h-8 w-8 object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
          <img 
            src="/activity-header-v3.png" 
            alt={t('notif_activity')} 
            className="h-6 w-auto object-contain" 
            style={{ imageRendering: '-webkit-optimize-contrast' }} 
          />
        </h1>
      </header>

      {notifications.length > 0 ? (
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
                      <img 
                        src="/btn-following.png" 
                        alt="Following" 
                        className="h-7 w-auto object-contain" 
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                      />
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
      ) : (
        <EmptyFeed subtitle="Nobody yet" />
      )}
    </div>
  );
};

export default Notifications;
