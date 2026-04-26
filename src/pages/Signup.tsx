import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Validate username: 3–20 chars, alphanumeric + underscores only
  const validateUsername = (val: string) => /^[a-zA-Z0-9_]{3,20}$/.test(val);

  // Check username availability against DB with 500ms debounce
  useEffect(() => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);

    if (!username) {
      setUsernameStatus('idle');
      return;
    }

    if (!validateUsername(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    usernameTimer.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);

    return () => { if (usernameTimer.current) clearTimeout(usernameTimer.current); };
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!validateUsername(username)) {
      setError('Username must be 3–20 characters: letters, numbers, underscores only.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('That username is already taken. Please choose another.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter a display name.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            full_name: fullName.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;

      // If email confirmation is required, data.user exists but session may be null
      if (data?.user && !data?.session) {
        setShowConfirmation(true);
        return;
      }

      navigate('/onboarding');
    } catch (err: any) {
      // Map common Supabase errors to friendly messages
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email already')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
        setError('That username is already taken. Please choose another.');
      } else if (msg.toLowerCase().includes('password')) {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (msg.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes before trying to register again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = () => {
    if (usernameStatus === 'invalid')
      return { text: '3–20 chars: letters, numbers, underscores', color: 'text-amber-500' };
    if (usernameStatus === 'checking')
      return { text: 'Checking availability…', color: 'text-zinc-400' };
    if (usernameStatus === 'taken')
      return { text: 'Username already taken', color: 'text-red-500' };
    if (usernameStatus === 'available')
      return { text: 'Username is available!', color: 'text-green-500' };
    return null;
  };

  const hint = usernameHint();
  const canSubmit = !loading && usernameStatus !== 'taken' && usernameStatus !== 'invalid' && usernameStatus !== 'checking' && username && fullName && email && password;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {showConfirmation ? (
          <div className="text-center space-y-6 py-12 px-8 bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 shadow-2xl">
            <div className="flex justify-center">
              <div className="relative">
                <img src="/signup-welcome-hydrant.png" alt="Email" className="w-64 h-auto object-contain" />
                <div className="absolute -inset-4 bg-purple-100/50 blur-xl rounded-full -z-10" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <img 
                  src="/check-your-mail.png" 
                  alt="Check Your Email" 
                  className="h-12 w-auto mix-blend-multiply" 
                />
              </div>
              <p className="text-zinc-500 font-medium leading-relaxed">
                We've sent a confirmation link to <span className="text-zinc-900 font-bold">{email}</span>. 
                Please click it to activate your citizen profile.
              </p>
            </div>
            <div className="pt-8 flex justify-center w-full">
              <button 
                onClick={() => navigate('/login')}
                className="w-48 transition-all duration-300 active:scale-95 hover:scale-105"
              >
                <img
                  src="/back-to-login.png"
                  alt="back to login"
                  className="w-full h-auto object-contain drop-shadow-md"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/signup-welcome-hydrant.png"
              alt="Welcome"
              className="w-64 h-auto object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom duration-700"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
          <div className="flex justify-center mb-2">
            <img
              src="/signup-title-text.png"
              alt="Create Account"
              className="h-20 w-auto object-contain animate-in fade-in zoom-in duration-500"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>
          <p className="text-zinc-500 font-medium">Join the RipIt community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
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
                name="signup_username_field"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className={`w-full bg-zinc-50 border rounded-2xl py-4 pl-12 pr-12 font-medium outline-none transition-all placeholder:text-zinc-400 ${
                  usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/10'
                    : usernameStatus === 'available'
                    ? 'border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                    : 'border-zinc-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                placeholder="Choose a username"
                autoComplete="off"
                required
              />
              {/* Status icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 size={18} className="text-zinc-400 animate-spin" />}
                {usernameStatus === 'available' && <Check size={18} className="text-green-500" />}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={18} className="text-red-500" />}
              </div>
            </div>
            {hint && (
              <p className={`text-xs ml-1 font-medium ${hint.color} animate-in fade-in duration-200`}>
                {hint.text}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Display Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <img src="/signup-user-icon.png" alt="" className="w-6 h-6 object-contain opacity-40 group-focus-within:opacity-100 transition-opacity" />
              </div>
              <input
                type="text"
                name="signup_fullname_field"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(''); }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Your display name"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <img src="/login-email-icon.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <input
                type="text"
                name="signup_email_field"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={`w-full bg-zinc-50 border rounded-2xl py-4 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-zinc-400 ${
                  error && !email ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/10'
                  : 'border-zinc-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                }`}
                placeholder="Enter your email"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors">
                <img src="/login-password-key.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="signup_password_field"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-zinc-400"
                placeholder="Create a password (min 6 chars)"
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
            {/* Password strength bar */}
            {password && (
              <div className="flex gap-1 ml-1 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= i * 3
                        ? password.length < 6 ? 'bg-red-400' : password.length < 10 ? 'bg-amber-400' : 'bg-green-400'
                        : 'bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 flex justify-center mt-8 ${!canSubmit ? 'cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="h-24 flex items-center justify-center gap-3 bg-zinc-100 rounded-2xl w-full">
                <Loader2 size={24} className="animate-spin text-zinc-500" />
                <span className="text-zinc-500 font-bold text-lg">Creating account…</span>
              </div>
            ) : (
              <img
                src="/signup-button.png"
                alt="Create Account"
                className="h-24 w-auto object-contain drop-shadow-2xl"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            )}
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
          </>
        )}
      </div>
    </div>
  );
}
