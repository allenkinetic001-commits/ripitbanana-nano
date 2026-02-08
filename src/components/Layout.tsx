import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm flex flex-col w-full">
        <main className="flex-1 pb-16">
          <Outlet />
        </main>
        <BottomNavbar />
      </div>
    </div>
  );
};

export default Layout;
