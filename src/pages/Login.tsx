import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';
import { Sparkles, Mail, Key, Eye, EyeOff } from 'lucide-react';

export default function Login() {
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

    if (email && password) {
      // Extract username from email for mock login
      const username = email.split('@')[0];
      login(username);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-300">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </div>
          <h1 className="text-4xl font-black font-serif tracking-tighter text-zinc-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-500 font-medium">
            Enter your email to continue to RipIt
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <Mail size={20} />
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
                <Key size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Enter your password"
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

          <div className="flex justify-end pt-2">
            <a href="#" className="text-sm font-bold text-zinc-400 hover:text-purple-600 transition-colors">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-6"
          >
            <span>Sign In</span>
            <Sparkles size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
