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
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationResentMsg, setVerificationResentMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [forgotMsg, setForgotMsg] = useState('');
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter your email above to resend the confirmation link.');
      return;
    }
    setResendingVerification(true);
    setVerificationResentMsg('');
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (resendErr) throw resendErr;
      setVerificationResentMsg('Verification email resent! Please check your Inbox and Spam folder.');
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('rate limit') || err?.code === 'over_email_send_rate_limit') {
        setVerificationResentMsg('Supabase email limit reached (3-4/hr on free tier). Please wait a few minutes.');
      } else {
        setVerificationResentMsg(err?.message || 'Could not resend email. Please try again.');
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (forgotEmail || email).trim().toLowerCase();
    if (!targetEmail || !validateEmail(targetEmail)) {
      setForgotMsg('Please enter a valid email address.');
      setForgotStatus('error');
      return;
    }
    setForgotStatus('sending');
    setForgotMsg('');
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetErr) throw resetErr;
      setForgotStatus('sent');
      setForgotMsg('Password reset link sent! Check your Inbox and Spam folder.');
    } catch (err: any) {
      setForgotStatus('error');
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('rate limit') || err?.code === 'over_email_send_rate_limit') {
        setForgotMsg('Supabase email limit reached. Please wait a few minutes before requesting another reset.');
      } else {
        setForgotMsg(err?.message || 'Failed to send reset email.');
      }
    }
  };

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

        // After successful auth, record user ID
        localStorage.setItem('supabaseUserId', data.user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, has_onboarded, lives')
          .eq('id', data.user.id)
          .single();

        if (!profile || profileError) {
          // If profile row is missing, create a default profile so the user isn't locked out
          const username = data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user';
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            full_name: data.user.user_metadata?.full_name || '',
            lives: 3,
            has_onboarded: true,
          });
          localStorage.setItem(`isEliminated_${data.user.id}`, 'false');
          navigate('/');
          return;
        }

        if (profile.lives !== undefined && profile.lives !== null && profile.lives <= 0) {
          // User is currently eliminated - do NOT sign them out; allow access to settings/eliminated screen
          localStorage.setItem(`isEliminated_${data.user.id}`, 'true');
          navigate('/');
          return;
        }

        // User is active and has lives
        localStorage.setItem(`isEliminated_${data.user.id}`, 'false');
        if (profile.has_onboarded) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during log in.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-6 py-12 relative overflow-y-auto">
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

          {error && error.toLowerCase().includes('email not confirmed') && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-2 animate-in fade-in">
              <p className="font-semibold text-amber-900">
                Your email has not been confirmed yet.
              </p>
              <p className="text-amber-700 leading-relaxed">
                Check your Inbox, Spam, or Junk folders for the Supabase confirmation link. Or click below to get a new one.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {resendingVerification ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Resend Verification Email</span>
                )}
              </button>
            </div>
          )}

          {verificationResentMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${verificationResentMsg.includes('resent') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {verificationResentMsg}
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
                className={`w-full bg-zinc-50 border rounded-2xl py-4 pl-12 pr-4 font-medium outline-none transition-all placeholder:text-zinc-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-zinc-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
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
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setShowForgotModal(true);
                setForgotMsg('');
                setForgotStatus('idle');
              }}
              className="text-sm font-bold text-zinc-400 hover:text-purple-600 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-24 transition-all duration-300 active:scale-95 hover:scale-105 mt-4 relative ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="mt-8 text-center space-y-4">
          <p className="text-zinc-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-red-600 font-bold hover:text-red-700 transition-colors">
              Create Account
            </Link>
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('supabaseUserId', 'guest-user');
                const guestProfile = {
                  username: 'guest_survivor',
                  fullName: 'Guest Survivor',
                  bio: 'Exploring RipIt ⚡',
                  avatar: '/custom-empty-profile.png',
                  website: ''
                };
                localStorage.setItem('userProfile', JSON.stringify(guestProfile));
                localStorage.setItem('profile_v2_guest-user', JSON.stringify(guestProfile));
                window.location.href = '/?preview=true';
              }}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 uppercase tracking-widest px-5 py-2.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all shadow-sm active:scale-95"
            >
              👀 Explore App (Guest Mode)
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-zinc-100">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-900 text-lg">Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xl font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter your account email to receive a password reset link. Check your Inbox and Spam folder.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="text"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotMsg('');
                }}
                placeholder="Enter your email"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-purple-500"
                required
              />
              {forgotMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${forgotStatus === 'sent' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {forgotMsg}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotStatus === 'sending'}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {forgotStatus === 'sending' ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
