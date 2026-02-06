import React from 'react';
import { Settings, Grid, User as UserIcon, List } from 'lucide-react';
import ChallengeTimer from '../components/ChallengeTimer';

const userPosts = [
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Stunning+mountain+landscape+at+dawn&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Delicious+plate+of+sushi+artfully+arranged&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Abstract+digital+art+with+vibrant+colors&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful+sunset+over+a+tropical+beach+with+palm+trees&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up+of+a+gourmet+burger+with+melted+cheese+and+crispy+fries&image_size=square',
];

const Profile = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white z-10">
        <h1 className="text-lg font-bold">allen_dev</h1>
        <div className="flex items-center gap-3">
          <ChallengeTimer />
          <button className="text-zinc-700">
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-8">
          <div className="w-20 h-20 rounded-full border border-zinc-200 overflow-hidden">
            <img
              src="https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+smiling+young+man+with+glasses&image_size=square"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="font-bold">24</span>
              <span className="text-xs text-zinc-500">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">1.2k</span>
              <span className="text-xs text-zinc-500">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">450</span>
              <span className="text-xs text-zinc-500">Following</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold">Allen | Full Stack Dev</h2>
          <p className="text-sm text-zinc-600">Building cool stuff with React & Tailwind 🚀</p>
          <a href="#" className="text-sm text-blue-900 font-medium">github.com/allen-dev</a>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-zinc-100 py-1.5 rounded-lg text-sm font-semibold">Edit Profile</button>
          <button className="flex-1 bg-zinc-100 py-1.5 rounded-lg text-sm font-semibold">Share Profile</button>
          <button className="flex-1 text-[#DC143C] py-2 rounded-xl text-base font-black hover:bg-red-50 transition-all duration-300 shadow-sm hover:shadow-md">Add Enemy</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-zinc-100 mt-4">
        <button className="flex-1 flex items-center justify-center h-12 border-b-2 border-zinc-900">
          <Grid size={24} />
        </button>
        <button className="flex-1 flex items-center justify-center h-12 text-zinc-400">
          <List size={24} />
        </button>
        <button className="flex-1 flex items-center justify-center h-12 text-zinc-400">
          <UserIcon size={24} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 pb-4">
        {userPosts.map((post, index) => (
          <div key={index} className="aspect-square bg-zinc-100 overflow-hidden">
            <img src={post} alt={`Post ${index}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
