import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (email && password) {
      setLoading(true);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        // After successful auth, check if the profile exists
        // If it doesn't, it means the user was eliminated (destroyed)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (!profile || profileError) {
          // Profile missing = Eliminated
          await supabase.auth.signOut();
          setError("Oops… you don’t exist here anymore.");
          return;
        }

        navigate('/');
      } catch (err: any) {
        setError(err.message || 'An error occurred during log in.');
      } finally {
        setLoading(false);
      }
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
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/welcome-back-hydrant.png" 
              alt="Welcome Back" 
              className="w-56 h-auto object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom duration-700"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
          <div className="flex justify-center mb-2">
            <img 
              src="/login-welcome-logo.png" 
              alt="RiPit" 
              className="h-16 w-auto object-contain animate-in fade-in zoom-in duration-500"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
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
                <img src="/login-email-icon.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <input
                type="text"
                name="user_email_login"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full bg-zinc-50 border rounded-2xl py-4 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-zinc-400 ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-zinc-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                placeholder="Enter your email"
                autoComplete="off"
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
                name="user_password_login"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Enter your password"
                autoComplete="off"
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
            disabled={loading}
            className={`w-full h-32 transition-all duration-300 active:scale-95 hover:scale-105 mt-6 relative ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="h-16 flex items-center justify-center gap-3 bg-zinc-100 rounded-2xl w-full">
                <Loader2 size={20} className="animate-spin text-zinc-500" />
                <span className="text-zinc-500 font-bold text-sm">Signing in…</span>
              </div>
            ) : (
              <img
                src="/btn-sign-in.png"
                alt="Sign In"
                className="w-full h-full object-contain drop-shadow-xl"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-red-600 font-bold hover:text-red-700 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
