import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  const [showBottomNav, setShowBottomNav] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      <div className={`max-w-md mx-auto h-full bg-white shadow-sm flex flex-col w-full relative transition-all duration-300 ${showBottomNav ? 'pb-16' : 'pb-0'}`}>
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet context={{ setShowBottomNav, showBottomNav }} />
        </main>
        <BottomNav visible={showBottomNav} />
      </div>
    </div>
  );
};

export default Layout;
