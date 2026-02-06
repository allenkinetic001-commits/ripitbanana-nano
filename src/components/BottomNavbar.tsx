import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, LucideIcon } from 'lucide-react';
import { cn } from '../utils';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200',
        isActive ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'
      )
    }
  >
    <Icon size={24} />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const BottomNavbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-zinc-200 safe-area-pb">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/search" icon={Search} label="Search" />
        <NavItem to="/create" icon={PlusSquare} label="Create" />
        <NavItem to="/notifications" icon={Heart} label="Activity" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNavbar;
