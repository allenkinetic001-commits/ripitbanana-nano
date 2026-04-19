import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import CreatePost from "./pages/CreatePost";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserDetail from "./pages/UserDetail";
import Pley from "./pages/Pley";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/SettingsPage";
import Chat from "./pages/Chat";
import EliminatedPage from "./pages/Eliminated";
import { useChallenge } from "./contexts/ChallengeContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authLoading, isEliminated } = useChallenge();
  
  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-zinc-500">Loading profile...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (isEliminated) {
    return <EliminatedPage />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/user/:username" element={<UserDetail />} />
          <Route path="/pley" element={<Pley />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:username" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
}
