import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useChallenge();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (username && email && password) {
      // In a real app, you would validate credentials here
      login(username);
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/signup-welcome-hydrant.png" 
              alt="Welcome" 
              className="w-56 h-auto object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom duration-700"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
          <div className="flex justify-center mb-4">
            <img 
              src="/signup-title-text.png" 
              alt="Create Account" 
              className="h-40 w-auto object-contain animate-in fade-in zoom-in duration-500"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
          <p className="text-zinc-500 font-medium">
            Join the RipIt community today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
                  <img 
                    src="/signup-user-icon.png" 
                    alt="" 
                    className="w-6 h-6 object-contain opacity-40 group-focus-within:opacity-100 transition-opacity"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <img src="/login-email-icon.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full bg-zinc-50 border rounded-2xl py-4 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-zinc-400 ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-zinc-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <img src="/login-password-key.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex justify-center mt-6"
          >
            <img 
              src="/signup-button.png" 
              alt="Sign Up" 
              className="h-32 w-auto object-contain drop-shadow-xl"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-bold hover:text-red-700 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
