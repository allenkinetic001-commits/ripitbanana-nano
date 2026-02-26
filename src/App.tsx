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
import Settings from "./pages/SettingsPage";
import Chat from "./pages/Chat";
import { useChallenge } from "./contexts/ChallengeContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useChallenge();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
