import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Sun, Palette, Layers, FileText, Lock, MessageCircle, Info, ChevronRight, LogOut, ChevronLeft, Check } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, language, setLanguage, theme, setTheme, t, isEliminated, setIsEliminated, userProfile, setUserLivesForUser } = useChallenge();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('settings_image_errors');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const handleImageError = (id: string) => {
    setImageErrors(prev => {
      const next = { ...prev, [id]: true };
      try { localStorage.setItem('settings_image_errors', JSON.stringify(next)); } catch { }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ja': return '日本語';
      case 'fr': return 'Français';
      case 'hi': return 'हिंदी';
      case 'zh': return '中文 (简体)';
      case 'de': return 'Deutsch';
      case 'uk': return 'Українська';
      case 'ru': return 'Русский';
      case 'ar': return 'العربية';
      case 'id': return 'Indonesia';
      case 'ur': return 'اردو';
      case 'fa': return 'فارسی';
      case 'es': return 'Español';
      case 'pt': return 'Português';
      case 'it': return 'Italiano';
      case 'vi': return 'Tiếng Việt';
      case 'th': return 'ไทย';
      case 'tl': return 'Tagalog';
      case 'ko': return '한국어';
      default: return 'English';
    }
  };

  const getThemeName = (code: string) => {
    switch (code) {
      case 'light': return t('theme_light');
      case 'system': return t('theme_system');
      default: return t('theme_system');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100 bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-900 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/settings-title.png"
            alt={t('settings')}
            className="h-7 w-auto object-contain"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* APP Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">{t('app')}</h3>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-sm">
            <div
              onClick={() => setShowContactModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['contact_icon'] ? (
                    <img
                      src="/contact-icon.png"
                      alt=""
                      onError={() => handleImageError('contact_icon')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <MessageCircle size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['be_part_header'] ? (
                  <img
                    src="/be-part.png"
                    alt={t('be_part_of_it')}
                    onError={() => handleImageError('be_part_header')}
                    className="h-5 w-auto object-contain ml-0"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="font-bold text-zinc-900 -ml-2">{t('be_part_of_it')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['lang_icon'] ? (
                    <img src="/language-icon.png" alt="" onError={() => handleImageError('lang_icon')} className="w-full h-full object-contain" />
                  ) : (
                    <Globe size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['lang_header'] ? (
                  <img src="/language-header.png" alt={t('language')} onError={() => handleImageError('lang_header')} className="h-6 w-auto object-contain -ml-2" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                ) : (
                  <span className="font-bold text-zinc-900 -ml-2">{t('language')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">{getLanguageName(language)}</span>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>

            <div
              onClick={() => setShowThemeModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['theme_icon'] ? (
                    <img src="/theme-icon.png" alt="" onError={() => handleImageError('theme_icon')} className="w-full h-full object-contain" />
                  ) : (
                    <Sun size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['theme_header'] ? (
                  <img src="/theme-header.png" alt={t('theme')} onError={() => handleImageError('theme_header')} className="h-6 w-auto object-contain -ml-2" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                ) : (
                  <span className="font-bold text-zinc-900 -ml-2">{t('theme')}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">{getThemeName(theme)}</span>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>

            <div
              onClick={() => setShowPersonalizationModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['pers_icon'] ? (
                    <img src="/personalization-icon.png" alt="" onError={() => handleImageError('pers_icon')} className="w-full h-full object-contain" />
                  ) : (
                    <Palette size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['pers_header'] ? (
                  <img src="/personalization-header.png" alt={t('personalization')} onError={() => handleImageError('pers_header')} className="h-6 w-auto object-contain" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                ) : (
                  <span className="font-bold text-zinc-900">{t('personalization')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* ABOUT Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">{t('about')}</h3>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-sm">
            <div
              onClick={() => setShowModelModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['model_icon'] ? (
                    <img
                      src="/model-icon.png"
                      alt=""
                      onError={() => handleImageError('model_icon')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Layers size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['model_header'] ? (
                  <img
                    src="/model-header.png"
                    alt={t('model')}
                    onError={() => handleImageError('model_header')}
                    className="h-6 w-auto object-contain -ml-2"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="font-bold text-zinc-900 -ml-2">{t('model')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div
              onClick={() => setShowTermsModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['terms_icon'] ? (
                    <img
                      src="/terms-icon.png"
                      alt=""
                      onError={() => handleImageError('terms_icon')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FileText size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['terms_header'] ? (
                  <img
                    src="/terms-header.png"
                    alt={t('terms')}
                    onError={() => handleImageError('terms_header')}
                    className="h-11 w-auto object-contain"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="font-bold text-zinc-900">{t('terms')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['privacy_icon'] ? (
                    <img
                      src="/privacy-icon.png"
                      alt=""
                      onError={() => handleImageError('privacy_icon')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Lock size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['privacy_header'] ? (
                  <img
                    src="/privacy-header.png"
                    alt={t('privacy')}
                    onError={() => handleImageError('privacy_header')}
                    className="h-9 w-auto object-contain"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="font-bold text-zinc-900">{t('privacy')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div
              onClick={() => setShowAboutModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {!imageErrors['about_icon'] ? (
                    <img
                      src="/about-icon.png"
                      alt=""
                      onError={() => handleImageError('about_icon')}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Info size={24} className="text-zinc-500" />
                  )}
                </div>
                {!imageErrors['about_header'] ? (
                  <img
                    src="/about-header.png"
                    alt={t('about')}
                    onError={() => handleImageError('about_header')}
                    className="h-7 w-auto object-contain -ml-4"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <span className="font-bold text-zinc-900 -ml-4">{t('about')}</span>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>
        </div>



        {/* Account Status / Revive Section */}
        {isEliminated && (
          <div className="pb-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <span className="text-2xl select-none">❤️‍🩹</span>
              <div>
                <h4 className="font-black text-rose-900 text-sm">Account is currently in Eliminated State</h4>
                <p className="text-xs text-rose-600 font-medium mt-0.5">
                  Your lives reached 0 in a challenge round. You can restore your account to continue playing.
                </p>
              </div>
              <button
                onClick={async () => {
                  setIsEliminated(false);
                  const userId = localStorage.getItem('supabaseUserId');
                  if (userId) {
                    localStorage.removeItem(`isEliminated_${userId}`);
                    localStorage.setItem(`isEliminated_${userId}`, 'false');
                    try {
                      await supabase.from('profiles').update({ lives: 3 }).eq('id', userId);
                    } catch (e) {
                      console.error('Failed to update DB lives:', e);
                    }
                  }
                  if (userProfile?.username) {
                    localStorage.removeItem(`user_eliminated_${userProfile.username}`);
                    setUserLivesForUser(userProfile.username, 3);
                  }
                  alert('Account restored! You have 3 lives remaining.');
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
              >
                Revive Account (Restore 3 Lives)
              </button>
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="pb-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {!imageErrors['logout_icon'] ? (
                  <img
                    src="/logout-icon.png"
                    alt=""
                    onError={() => handleImageError('logout_icon')}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <LogOut size={24} className="text-red-500" />
                )}
              </div>
              {!imageErrors['logout_header'] ? (
                <img
                  src="/logout-header.png"
                  alt={t('logout')}
                  onError={() => handleImageError('logout_header')}
                  className="h-6 w-auto object-contain ml-4"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-red-600 ml-4 uppercase tracking-tighter">{t('logout')}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_about_icon'] ? (
                  <img src="/about-icon.png" alt="" onError={() => handleImageError('modal_about_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Info size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_about_header'] ? (
                <img
                  src="/about-header.png"
                  alt={t('about')}
                  onError={() => handleImageError('modal_about_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('about')}</span>
              )}
            </div>

            <div className="space-y-6 text-xs text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              <div className="space-y-1">
                <p className="font-bold text-zinc-800">{t('about_tagline')}</p>
              </div>

              <p>{t('about_desc1')}</p>

              <div className="space-y-3">
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block mb-1">{t('about_pley_title')}</span>
                  <p>{t('about_pley_desc')}</p>
                </div>

                {/* Second Mode info if it exists in translations */}
                {t('about_Pley_title') !== 'about_Pley_title' && (
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <span className="font-bold text-zinc-900 block mb-1">{t('about_Pley_title')}</span>
                    <p>{t('about_Pley_desc')}</p>
                  </div>
                )}
              </div>

              <p>{t('about_desc2')}</p>

              <p className="font-medium text-zinc-800 italic">{t('about_footer')}</p>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-2 sticky bottom-0 shrink-0"
            >
              {!imageErrors['btn_close_about'] ? (
                <img
                  src="/btn-close.png"
                  alt={t('close')}
                  onError={() => handleImageError('btn_close_about')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-bold">{t('close')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_be_part_icon'] ? (
                  <img src="/contact-icon.png" alt="" onError={() => handleImageError('modal_be_part_icon')} className="w-full h-full object-contain" />
                ) : (
                  <MessageCircle size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_be_part_header'] ? (
                <img
                  src="/be-part.png"
                  alt={t('be_part_of_it')}
                  onError={() => handleImageError('modal_be_part_header')}
                  className="h-8 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('be_part_of_it')}</span>
              )}
            </div>

            <div className="space-y-5 text-xs text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              {/* Utility of TAMIYANOIA CAT Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide border-b border-zinc-100 pb-1">
                  {t('partnership_title')}
                </h4>
                <p className="leading-relaxed text-zinc-700 font-medium bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {t('partnership_desc')}
                </p>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block pt-1.5">
                    Official Token & Ecosystem
                  </span>
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/90 rounded-2xl border border-amber-200 shadow-sm">
                    <img
                      src="/tanmi.png"
                      alt="TAMIYANOIA CAT"
                      className="w-12 h-12 rounded-xl object-contain flex-shrink-0 mt-0.5 shadow-sm border border-amber-200/60 bg-white"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                    />
                    <div className="flex flex-col min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-zinc-900 text-sm tracking-tight">TAMIYANOIA CAT</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">$TAMIYANOIA</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-orange-200/80 text-orange-900 px-2 py-0.5 rounded-full">BNB Chain</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-700">
                        From Africa to the World. 🌍🐱
                      </p>
                      <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                        A community-driven Web3 ecosystem built around culture, creativity, entertainment, and decentralized participation.
                      </p>
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <a
                          href="https://www.tamiyanoiacat.fun/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all group"
                        >
                          <span>Whitepaper</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </a>
                        <a
                          href="https://x.com/TAMIYANOIA_Cat"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                          <span>@TAMIYANOIA_Cat</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact/Feedback Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide border-b border-zinc-100 pb-1">
                  {t('contact_title')}
                </h4>
                <p className="font-medium text-zinc-800">{t('contact_desc')}</p>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <img src="/gmail.png" className="w-5 h-5 object-contain flex-shrink-0" alt="" />
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{t('contact_email_label')}</span>
                    <a href="mailto:tamiyanoiacat01@gmail.com" className="text-blue-600 hover:underline break-all font-semibold">tamiyanoiacat01@gmail.com</a>
                  </div>
                </div>
              </div>

              <p className="italic text-zinc-500 text-center mt-4">{t('contact_footer')}</p>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-4 shrink-0"
            >
              {!imageErrors['btn_close_contact'] ? (
                <img
                  src="/btn-close.png"
                  alt={t('close')}
                  onError={() => handleImageError('btn_close_contact')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-bold">{t('close')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_lang_icon'] ? (
                  <img src="/language-icon.png" alt="" onError={() => handleImageError('modal_lang_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Globe size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_lang_header'] ? (
                <img
                  src="/language-header.png"
                  alt={t('language')}
                  onError={() => handleImageError('modal_lang_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('language')}</span>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
              {[
                { code: 'en', label: 'English' },
                { code: 'ja', label: '日本語' },
                { code: 'fr', label: 'Français' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'zh', label: '中文 (简体)' },
                { code: 'de', label: 'Deutsch' },
                { code: 'uk', label: 'Українська' },
                { code: 'ru', label: 'Русский' },
                { code: 'ar', label: 'العربية' },
                { code: 'id', label: 'Indonesia' },
                { code: 'ur', label: 'اردو' },
                { code: 'fa', label: 'فارسی' },
                { code: 'es', label: 'Español' },
                { code: 'pt', label: 'Português' },
                { code: 'it', label: 'Italiano' },
                { code: 'vi', label: 'Tiếng Việt' },
                { code: 'th', label: 'ไทย' },
                { code: 'tl', label: 'Tagalog' },
                { code: 'ko', label: '한국어' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all font-medium shrink-0",
                    language === lang.code
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 shrink-0"
            >
              {!imageErrors['btn_cancel_lang'] ? (
                <img
                  src="/btn-cancel.png"
                  alt={t('cancel')}
                  onError={() => handleImageError('btn_cancel_lang')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-100 text-zinc-900 px-8 py-2 rounded-full font-bold">{t('cancel')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_theme_icon'] ? (
                  <img src="/theme-icon.png" alt="" onError={() => handleImageError('modal_theme_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Sun size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_theme_header'] ? (
                <img
                  src="/theme-header.png"
                  alt={t('theme')}
                  onError={() => handleImageError('modal_theme_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('theme')}</span>
              )}
            </div>

            <div className="space-y-2">
              {[
                { code: 'light', label: t('theme_light') },
                { code: 'system', label: t('theme_system') }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setTheme(item.code);
                    setShowThemeModal(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all font-medium",
                    theme === item.code
                      ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                      : "border-zinc-100 text-zinc-900 hover:border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  <span>{item.label}</span>
                  {theme === item.code && <Check size={18} />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105"
            >
              {!imageErrors['btn_cancel_theme'] ? (
                <img
                  src="/btn-cancel-red.png"
                  alt={t('cancel')}
                  onError={() => handleImageError('btn_cancel_theme')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-red-50 text-red-600 px-8 py-2 rounded-full font-bold border border-red-100">{t('cancel')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Personalization Modal */}
      {showPersonalizationModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_pers_icon'] ? (
                  <img src="/personalization-icon.png" alt="" onError={() => handleImageError('modal_pers_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Palette size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_pers_header'] ? (
                <img
                  src="/personalization-header.png"
                  alt={t('personalization')}
                  onError={() => handleImageError('modal_pers_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('personalization')}</span>
              )}
            </div>

            <div className="space-y-4 text-xs text-zinc-600">
              <p className="font-medium text-zinc-800">{t('pers_subtitle')}</p>
              <p>{t('pers_desc')}</p>

              <ul className="space-y-2 list-disc list-inside marker:text-pink-500">
                <li>{t('pers_item1')}</li>
                <li>{t('pers_item2')}</li>
                <li>{t('pers_item3')}</li>
                <li>{t('pers_item4')}</li>
              </ul>

              <p className="font-medium text-zinc-800">{t('pers_footer1')}</p>
              <p className="italic text-zinc-500">{t('pers_footer2')}</p>
            </div>

            <button
              onClick={() => setShowPersonalizationModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-4"
            >
              {!imageErrors['btn_got_it'] ? (
                <img
                  src="/btn-got-it.png"
                  alt={t('got_it')}
                  onError={() => handleImageError('btn_got_it')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-bold">{t('got_it')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_privacy_icon'] ? (
                  <img src="/privacy-icon.png" alt="" onError={() => handleImageError('modal_privacy_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Lock size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_privacy_header'] ? (
                <img
                  src="/privacy-header.png"
                  alt={t('privacy')}
                  onError={() => handleImageError('modal_privacy_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('privacy')}</span>
              )}
            </div>

            <div className="space-y-6 text-xs text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              <div className="space-y-1">
                <p className="font-bold text-zinc-800">{t('priv_subtitle')}</p>
                <p className="text-xs text-zinc-500">{t('priv_effective')}</p>
              </div>
              <p>{t('priv_intro')}</p>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s1_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li><span className="font-medium">{t('priv_s1_i1')}</span></li>
                  <li><span className="font-medium">{t('priv_s1_i2')}</span></li>
                  <li><span className="font-medium">{t('priv_s1_i3')}</span></li>
                  <li><span className="font-medium">{t('priv_s1_i4')}</span></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s2_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('priv_s2_i1')}</li>
                  <li>{t('priv_s2_i2')}</li>
                  <li>{t('priv_s2_i3')}</li>
                  <li>{t('priv_s2_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s3_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('priv_s3_i1')}</li>
                  <li>{t('priv_s3_i2')}</li>
                  <li>{t('priv_s3_i3')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s4_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('priv_s4_i1')}</li>
                  <li>{t('priv_s4_i2')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s5_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('priv_s5_i1')}</li>
                  <li>{t('priv_s5_i2')}</li>
                  <li>{t('priv_s5_i3')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('priv_s6_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('priv_s6_i1')}</li>
                  <li>{t('priv_s6_i2')}</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-2 sticky bottom-0 shrink-0"
            >
              {!imageErrors['btn_close_privacy'] ? (
                <img
                  src="/btn-close.png"
                  alt={t('close')}
                  onError={() => handleImageError('btn_close_privacy')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-bold">{t('close')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_terms_icon'] ? (
                  <img src="/terms-icon.png" alt="" onError={() => handleImageError('modal_terms_icon')} className="w-full h-full object-contain" />
                ) : (
                  <FileText size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_terms_header'] ? (
                <img
                  src="/terms-header.png"
                  alt={t('terms')}
                  onError={() => handleImageError('modal_terms_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('terms')}</span>
              )}
            </div>

            <div className="space-y-6 text-xs text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              <div className="space-y-1">
                <p className="font-bold text-zinc-800">{t('terms_tagline')}</p>
                <p className="text-xs text-zinc-500">{t('terms_effective')}</p>
              </div>
              <p>{t('terms_intro')}</p>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s1_title')}</h4>
                <p>{t('terms_s1_desc')}</p>
                <p>{t('terms_s1_list_title')}</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s1_i1')}</li>
                  <li>{t('terms_s1_i2')}</li>
                  <li>{t('terms_s1_i3')}</li>
                </ul>
                <p className="text-xs italic">{t('terms_s1_disclaimer')}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s2_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s2_i1')}</li>
                  <li>{t('terms_s2_i2')}</li>
                  <li>{t('terms_s2_i3')}</li>
                  <li>{t('terms_s2_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s3_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s3_i1')}</li>
                  <li>{t('terms_s3_i2')}</li>
                  <li>{t('terms_s3_i3')}</li>
                  <li>{t('terms_s3_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s4_title')}</h4>
                <p>{t('terms_s4_intro')}</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s4_i1')}</li>
                  <li>{t('terms_s4_i2')}</li>
                  <li>{t('terms_s4_i3')}</li>
                  <li>{t('terms_s4_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s5_title')}</h4>
                <p>{t('terms_s5_intro')}</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s5_i1')}</li>
                  <li>{t('terms_s5_i2')}</li>
                  <li>{t('terms_s5_i3')}</li>
                  <li>{t('terms_s5_i4')}</li>
                </ul>
                <p>{t('terms_s5_footer')}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s6_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s6_i1')}</li>
                  <li>{t('terms_s6_i2')}</li>
                  <li>{t('terms_s6_i3')}</li>
                  <li>{t('terms_s6_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s7_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s7_i1')}</li>
                  <li>{t('terms_s7_i2')}</li>
                  <li>{t('terms_s7_i3')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s8_title')}</h4>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>{t('terms_s8_i1')}</li>
                  <li>{t('terms_s8_i2')}</li>
                  <li>{t('terms_s8_i3')}</li>
                  <li>{t('terms_s8_i4')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s9_title')}</h4>
                <p>{t('terms_s9_desc')}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900">{t('terms_s10_title')}</h4>
                <p>{t('terms_s10_desc')}</p>
                <p className="font-medium text-blue-600">{t('terms_s10_email')}</p>
              </div>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-2 sticky bottom-0 shrink-0"
            >
              {!imageErrors['btn_cancel_terms'] ? (
                <img
                  src="/btn-cancel-red-solid.png"
                  alt={t('cancel')}
                  onError={() => handleImageError('btn_cancel_terms')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-red-600 text-white px-8 py-2 rounded-full font-bold">{t('cancel')}</div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex flex-col items-center border-b border-zinc-100 pb-4 shrink-0 gap-2">
              <div className="w-12 h-12 flex-shrink-0">
                {!imageErrors['modal_model_icon'] ? (
                  <img src="/model-icon.png" alt="" onError={() => handleImageError('modal_model_icon')} className="w-full h-full object-contain" />
                ) : (
                  <Layers size={32} className="text-zinc-500" />
                )}
              </div>
              {!imageErrors['modal_model_header'] ? (
                <img
                  src="/model-header.png"
                  alt={t('model')}
                  onError={() => handleImageError('modal_model_header')}
                  className="h-16 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <span className="font-bold text-zinc-900 text-2xl tracking-tighter uppercase">{t('model')}</span>
              )}
            </div>

            <div className="space-y-6 text-xs text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              {/* Core Concept */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm">{t('model_concept_title')}</h4>
                <p>
                  {t('model_concept_desc')}
                </p>
              </div>

              {/* Modes */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-900 text-sm">{t('model_modes_title')}</h4>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block mb-1">{t('model_pley_title')}</span>
                  <ul className="space-y-1 list-disc list-inside marker:text-blue-500">
                    <li>{t('model_pley_item1')}</li>
                    <li>{t('model_pley_item2')}</li>
                    <li>{t('model_pley_item3')}</li>
                    <li>{t('model_pley_item4')}</li>
                  </ul>
                </div>

                {/* Second Mode info if it exists in translations */}
                {t('model_Pley_title') !== 'model_Pley_title' && (
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <span className="font-bold text-zinc-900 block mb-1">{t('model_Pley_title')}</span>
                    <ul className="space-y-1 list-disc list-inside marker:text-red-500">
                      <li>{t('model_Pley_item1')}</li>
                      <li>{t('model_Pley_item2')}</li>
                      <li>{t('model_Pley_item3')}</li>
                      <li>{t('model_Pley_item4')}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Personalization */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 text-sm">{t('model_pers_title')}</h4>
                <ul className="space-y-1 list-disc list-inside marker:text-pink-500">
                  <li>{t('model_pers_item1')}</li>
                  <li>{t('model_pers_item2')}</li>
                  <li>{t('model_pers_item3')}</li>
                  <li>{t('model_pers_item4')}</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowModelModal(false)}
              className="w-full flex justify-center transition-all active:scale-95 hover:scale-105 mt-2 sticky bottom-0 shrink-0"
            >
              {!imageErrors['btn_close_model'] ? (
                <img
                  src="/btn-close.png"
                  alt={t('close')}
                  onError={() => handleImageError('btn_close_model')}
                  className="h-10 w-auto object-contain"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-bold">{t('close')}</div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
