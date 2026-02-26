import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Sun, Palette, Layers, FileText, Lock, MessageCircle, Info, ChevronRight, LogOut, ChevronLeft, Check } from 'lucide-react';
import { useChallenge } from '../contexts/ChallengeContext';
import { cn } from '../utils';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, language, setLanguage, theme, setTheme, t } = useChallenge();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
        <h2 className="font-bold text-lg">{t('settings')}</h2>
        <div className="w-10" /> {/* Spacer */}
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* APP Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{t('app')}</h3>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-sm">
            <div 
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Globe size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 font-medium">{getLanguageName(language)}</span>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => setShowThemeModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <Sun size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('theme')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 font-medium">{getThemeName(theme)}</span>
                <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => setShowPersonalizationModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                  <Palette size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('personalization')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* ABOUT Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{t('about')}</h3>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-sm">
            <div 
              onClick={() => setShowModelModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <Layers size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('model')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div 
              onClick={() => setShowTermsModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                  <FileText size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('terms')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div 
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                  <Lock size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('privacy')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>

            <div 
              onClick={() => setShowAboutModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Info size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('about')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Contact & Logout Section */}
        <div className="space-y-2 pb-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-sm">
            <div 
              onClick={() => setShowContactModal(true)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <MessageCircle size={18} />
                </div>
                <span className="font-semibold text-zinc-900">{t('contact')}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm mt-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-bold text-red-600">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-zinc-900 sticky top-0 bg-white pb-2 border-b border-zinc-100">{t('about_title')}</h3>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            
            <div className="space-y-6 text-sm text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
                <div className="space-y-1">
                    <p className="font-bold text-zinc-800">{t('about_tagline')}</p>
                </div>
                
                <p>{t('about_desc1')}</p>

                <div className="space-y-3">
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <span className="font-bold text-zinc-900 block mb-1">{t('about_pley_title')}</span>
                        <p>{t('about_pley_desc')}</p>
                    </div>

                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <span className="font-bold text-zinc-900 block mb-1">{t('about_vause_title')}</span>
                        <p>{t('about_vause_desc')}</p>
                    </div>

                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <span className="font-bold text-zinc-900 block mb-1">{t('about_kight_title')}</span>
                        <p>{t('about_kight_desc')}</p>
                    </div>
                </div>

                <p>{t('about_desc2')}</p>
                
                <p className="font-medium text-zinc-800 italic">{t('about_footer')}</p>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-2 sticky bottom-0 shadow-lg shrink-0"
            >
              {t('about_close')}
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-900">{t('contact_title')}</h3>
            
            <div className="space-y-4 text-sm text-zinc-600">
              <p className="font-medium text-zinc-800">{t('contact_desc')}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-xl">📧</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{t('contact_email_label')}</span>
                    <a href="mailto:casperthefriendlyghost90210@gmail.com" className="text-blue-600 hover:underline break-all">casperthefriendlyghost90210@gmail.com</a>
                    <span className="text-xs text-zinc-400 my-0.5">{t('contact_email_or')}</span>
                    <a href="mailto:manbirdglobal@gmail.com" className="text-blue-600 hover:underline break-all">manbirdglobal@gmail.com</a>
                  </div>
                </div>
              </div>

              <p className="italic text-zinc-500 text-center mt-4">{t('contact_footer')}</p>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-4"
            >
              {t('contact_close')}
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-zinc-900">{t('language')}</h3>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
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
              className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-600 font-bold hover:bg-zinc-200 transition-colors shrink-0"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-900">{t('theme')}</h3>
            
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
              className="w-full py-3 rounded-xl bg-zinc-50 text-blue-600 font-bold hover:bg-zinc-100 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Personalization Modal */}
      {showPersonalizationModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-900">{t('pers_title')}</h3>
            
            <div className="space-y-4 text-sm text-zinc-600">
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
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-4"
            >
              {t('pers_button')}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-zinc-900 sticky top-0 bg-white pb-2 border-b border-zinc-100">{t('privacy')}</h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            
            <div className="space-y-6 text-sm text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
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

                <div className="space-y-2">
                    <h4 className="font-bold text-zinc-900">{t('priv_s7_title')}</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>{t('priv_s7_i1')}</li>
                        <li>{t('priv_s7_i2')}</li>
                    </ul>
                </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-2 sticky bottom-0 shadow-lg shrink-0"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-zinc-900 sticky top-0 bg-white pb-2 border-b border-zinc-100">{t('terms')}</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            
            <div className="space-y-6 text-sm text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
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
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-2 sticky bottom-0 shadow-lg shrink-0"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-zinc-900 sticky top-0 bg-white pb-2 border-b border-zinc-100">{t('model_title')}</h3>
              <button 
                onClick={() => setShowModelModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            
            <div className="space-y-6 text-sm text-zinc-600 overflow-y-auto flex-1 min-h-0 pr-1">
              {/* Core Concept */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 text-base">{t('model_concept_title')}</h4>
                <p>
                  {t('model_concept_desc')}
                </p>
              </div>

              {/* Modes */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-900 text-base">{t('model_modes_title')}</h4>
                
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block mb-1">{t('model_pley_title')}</span>
                  <ul className="space-y-1 list-disc list-inside marker:text-blue-500">
                    <li>{t('model_pley_item1')}</li>
                    <li>{t('model_pley_item2')}</li>
                    <li>{t('model_pley_item3')}</li>
                    <li>{t('model_pley_item4')}</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block mb-1">{t('model_vause_title')}</span>
                  <ul className="space-y-1 list-disc list-inside marker:text-purple-500">
                    <li>{t('model_vause_item1')}</li>
                    <li>{t('model_vause_item2')}</li>
                    <li>{t('model_vause_item3')}</li>
                    <li>{t('model_vause_item4')}</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block mb-1">{t('model_kight_title')}</span>
                  <ul className="space-y-1 list-disc list-inside marker:text-red-500">
                    <li>{t('model_kight_item1')}</li>
                    <li>{t('model_kight_item2')}</li>
                    <li>{t('model_kight_item3')}</li>
                    <li>{t('model_kight_item4')}</li>
                  </ul>
                </div>
              </div>

              {/* Personalization */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 text-base">{t('model_pers_title')}</h4>
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
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors mt-2 sticky bottom-0 shadow-lg shrink-0"
            >
              {t('model_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
