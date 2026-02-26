import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      <div className="max-w-md mx-auto h-full bg-white shadow-sm flex flex-col w-full relative">
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
