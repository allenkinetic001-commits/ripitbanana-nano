import { Home, Search, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useChallenge();

  const navItems = [
    { icon: Home, label: t('nav_home'), path: '/' },
    { icon: Search, label: t('nav_search'), path: '/search' },
    { icon: Bell, label: t('nav_notifications'), path: '/notifications' },
    { icon: User, label: t('nav_profile'), path: '/profile' },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-zinc-100 px-6 py-2 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center space-y-1 transition-colors relative",
              isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <item.icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2}
              className={cn("transition-all duration-300", isActive && "scale-110")}
            />
            <span className={cn("text-[10px] font-medium transition-all", isActive ? "font-bold" : "font-medium")}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -top-2 w-1 h-1 bg-zinc-900 rounded-full animate-in zoom-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
