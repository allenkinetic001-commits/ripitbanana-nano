import { useState } from 'react';
import { Home, Search, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  isImage?: boolean;
  size?: string;
}

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useChallenge();
  const [clickedPath, setClickedPath] = useState<string | null>(null);

  const handleNavClick = (path: string) => {
    setClickedPath(path);
    navigate(path);
    setTimeout(() => setClickedPath(null), 300);
  };

  const navItems: NavItem[] = [
    { icon: '/nav-home-v3.png', label: t('nav_home'), path: '/', isImage: true },
    { icon: '/nav-chair-v3.png', label: t('nav_search'), path: '/search', isImage: true, size: 'h-[53px] w-[53px]' },
    { icon: '/nav-phone-v3.png', label: t('nav_notifications'), path: '/notifications', isImage: true },
    { icon: '/nav-profile-v3.png', label: t('nav_profile'), path: '/profile', isImage: true },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-zinc-100 px-6 py-2 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const isBouncing = clickedPath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            className={cn(
              "flex flex-col items-center transition-colors relative",
              "text-zinc-900"
            )}
          >
            <div className="h-14 flex items-center justify-center mb-1">
              {item.isImage ? (
                <img 
                  src={item.icon as string} 
                  alt={item.label}
                  className={cn(
                    item.size || "h-9 w-9",
                    "object-contain transition-all duration-300", 
                    isActive ? "scale-110" : "scale-100",
                    isBouncing && "animate-nav-bounce",
                    "opacity-100"
                  )} 
                />
              ) : (
                <div className={cn(isBouncing && "animate-nav-bounce")}>
                  {(() => {
                    const Icon = item.icon as any;
                    return <Icon 
                      size={24} 
                      className={cn("transition-all duration-300", isActive && "scale-110")}
                    />;
                  })()}
                </div>
              )}
            </div>
            <div className="h-7 flex items-center justify-center -mt-1">
              {item.path === '/' ? (
                <img 
                  src="/nav-home-text.png" 
                  alt="Home" 
                  className={cn(
                    "h-full w-auto object-contain transition-all duration-300", 
                    isActive ? "scale-110" : "scale-100 font-extrabold"
                  )} 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : item.path === '/search' ? (
                <img 
                  src="/nav-search-text.png" 
                  alt="Search" 
                  className={cn(
                    "h-full w-auto object-contain transition-all duration-300", 
                    isActive ? "scale-110" : "scale-100"
                  )} 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : item.path === '/notifications' ? (
                <img 
                  src="/nav-activity-text.png" 
                  alt="Activity" 
                  className={cn(
                    "h-full w-auto object-contain transition-all duration-300", 
                    isActive ? "scale-110" : "scale-100"
                  )} 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : item.path === '/profile' ? (
                <img 
                  src="/nav-profile-text.png" 
                  alt="Profile" 
                  className={cn(
                    "h-full w-auto object-contain transition-all duration-300", 
                    isActive ? "scale-110" : "scale-100"
                  )} 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className={cn(
                  "text-[10px] font-medium transition-all translate-y-1", 
                  isActive ? "font-bold text-zinc-900" : "font-black text-zinc-500"
                )}>
                  {item.label}
                </span>
              )}
            </div>
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 bg-zinc-900 rounded-full animate-in zoom-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
