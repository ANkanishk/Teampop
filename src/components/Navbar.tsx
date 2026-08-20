import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, 
  ShieldCheck, 
  Gamepad2, 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut, 
  Lock, 
  Flame, 
  HelpCircle, 
  History, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Sun, 
  Moon, 
  Receipt, 
  Crown, 
  Volume2, 
  VolumeX, 
  Key,
  Send,
  Wallet
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from './NotificationCenter';
import { soundFx } from '../lib/soundEffects';
import { BgmPlayerWidget } from './BgmPlayerWidget';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenTrackModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenTrackModal,
  onOpenLoginModal,
}) => {
  const { currentUser, customUser, isAdmin, logout, settings, registrations, matches, language, setLanguage, t, getUserWalletStats } = useTournaments();
  const { theme, isLight, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  // Prevent background scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isLoggedIn = Boolean(customUser || currentUser);
  const activeUid = customUser?.uid || currentUser?.uid;
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();
  const walletStats = isLoggedIn ? getUserWalletStats(activeUid, activeEmail) : null;

  const userActivePasses = isLoggedIn
    ? registrations.filter((r) => {
        const isUser =
          (activeUid && r.userId === activeUid) ||
          (activeEmail && r.captainEmail?.toLowerCase() === activeEmail);
        const match = matches.find((m) => m.id === r.matchId);
        return isUser && match && match.status !== 'COMPLETED' && match.status !== 'CANCELLED';
      })
    : [];

  const navItems = [
    { id: 'home', label: t.home, icon: Flame },
    { id: 'tournaments', label: t.tournaments, icon: Trophy },
    { id: 'orders', label: t.myOrders, icon: Key, badge: userActivePasses.length > 0 ? userActivePasses.length : null },
    { id: 'leaderboard', label: t.leaderboard, icon: Crown },
    { id: 'championship', label: t.championship, icon: Sparkles },
    { id: 'results', label: t.results, icon: History },
    { id: 'rules', label: t.rules, icon: HelpCircle },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  const toggleLanguage = () => {
    soundFx.playClick();
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const activeAnnouncement = settings.announcements?.find(a => a.active);

  const handleMobileNavClick = (tabId: string) => {
    soundFx.playClick();
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[100] bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 w-full max-w-full">
      {/* Top Ticker / Notification */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-1 px-3 text-xs font-semibold text-white shadow-inner w-full max-w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 overflow-hidden">
          <span className="inline-block w-2 h-2 rounded-full bg-white shrink-0 animate-pulse"></span>
          <div className="overflow-hidden relative w-full text-center">
            <p className="truncate text-[11px] sm:text-xs tracking-wide">
              {activeAnnouncement
                ? `📢 ${activeAnnouncement.title}: ${activeAnnouncement.message}`
                : settings.announcementTicker || '🔥 POP GAMING SEASON 9: ₹10,000+ Prize Pool Championship Registration Open! Daily Rooms Every 30 Mins.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1.5 sm:gap-4">
          {/* Logo & Brand */}
          <div 
            id="nav-logo" 
            onClick={() => {
              soundFx.playClick();
              setCurrentTab('home');
            }} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 max-w-[60%] sm:max-w-none truncate"
          >
            {settings.appLogo ? (
              <img
                src={settings.appLogo}
                alt="POP Gaming Logo"
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl object-contain shadow-lg shadow-orange-500/20 group-hover:scale-105 transition duration-200 border border-orange-400/40 bg-neutral-900 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition duration-200 border border-orange-400/40 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col justify-center truncate">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
                <span className="text-base sm:text-2xl font-black tracking-wider text-white whitespace-nowrap">
                  POP<span className="text-orange-500">GAMING</span>
                </span>
                <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-neutral-800 text-orange-400 border border-orange-500/30 rounded whitespace-nowrap">
                  ESPORTS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium tracking-tight -mt-0.5 hidden sm:block whitespace-nowrap">
                Free Fire MAX Competitive Arena
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentTab(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                    isActive
                      ? 'bg-neutral-800/90 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[9px] font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Background Music Player Widget */}
            <BgmPlayerWidget compact />

            {/* Language Switcher Button */}
            <button
              id="btn-lang-toggle"
              type="button"
              onClick={toggleLanguage}
              title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold transition cursor-pointer"
            >
              <span>{language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
            </button>

            {/* Esports Audio SFX Toggle */}
            <button
              id="btn-sound-toggle"
              type="button"
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Esports Sound FX'}
              aria-label={soundEnabled ? 'Mute Sound FX' : 'Enable Esports Sound FX'}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:text-orange-400 transition cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-orange-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* Theme Mode Toggle */}
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={() => {
                soundFx.playClick();
                toggleTheme();
              }}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to High-Contrast Light Mode'}
              aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-sm'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800 hover:text-amber-400'
              }`}
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-600" />
              ) : (
                <Moon className="w-4 h-4 text-orange-400" />
              )}
            </button>

            {/* Telegram Channel Link Button */}
            {settings.telegramUrl && (
              <a
                id="btn-nav-telegram"
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick()}
                title={`Join ${settings.telegramChannelName || 'Official Telegram Channel'}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 transition cursor-pointer group shadow-sm shadow-cyan-500/10"
              >
                <Send className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden lg:inline-block">Telegram</span>
              </a>
            )}

            {/* Track Registration Button */}
            <button
              id="btn-track-registration"
              onClick={() => {
                soundFx.playClick();
                onOpenTrackModal();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>{t.track}</span>
            </button>

            {/* In-App Notifications Center Bell */}
            <NotificationCenter onNavigate={(tab) => {
              soundFx.playClick();
              setCurrentTab(tab);
            }} />

            {/* Profile & Wallet Button */}
            <button
              id="btn-nav-profile-wallet"
              onClick={() => {
                soundFx.playClick();
                setCurrentTab('profile');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                currentTab === 'profile'
                  ? 'bg-neutral-800 text-orange-400 border-orange-500/40 shadow-sm'
                  : 'bg-neutral-900 text-neutral-200 hover:text-white border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <User className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline-block">{t.profile}</span>
            </button>

            {/* Admin or User Button */}
            {isAdmin ? (
              <button
                id="btn-nav-admin"
                onClick={() => {
                  soundFx.playClick();
                  setCurrentTab('admin');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:brightness-110 shadow-md shadow-orange-600/20'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            ) : currentUser || customUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-logout"
                  onClick={() => {
                    soundFx.playClick();
                    logout();
                  }}
                  title="Logout"
                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => {
                  soundFx.playClick();
                  onOpenLoginModal();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition cursor-pointer shadow-md shadow-orange-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Actions (Language, Track & Hamburger) */}
          <div className="flex xl:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={toggleLanguage}
              className="px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 whitespace-nowrap"
            >
              {language === 'hi' ? '🇮🇳 HI' : '🇬🇧 EN'}
            </button>
            <button
              id="btn-mobile-track"
              onClick={() => {
                soundFx.playClick();
                onOpenTrackModal();
              }}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg bg-neutral-900 text-orange-400 border border-neutral-800 cursor-pointer whitespace-nowrap"
            >
              {t.track}
            </button>
            <button
              id="btn-mobile-toggle"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center shrink-0 ${
                mobileMenuOpen 
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30' 
                  : 'bg-neutral-900 text-neutral-200 hover:text-white border-neutral-800'
              }`}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* PORTALED MOBILE FULL-SCREEN NAVIGATION DRAWER (Renders directly into document.body to avoid any stacking context clipping) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div 
          id="mobile-nav-portal-drawer" 
          className="fixed inset-0 z-[9999999] w-screen h-screen bg-neutral-950 flex flex-col overflow-hidden text-neutral-100"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              {settings.appLogo ? (
                <img
                  src={settings.appLogo}
                  alt="POP Gaming Logo"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-contain border border-orange-400/40 bg-neutral-950 p-0.5"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center border border-orange-400/40 shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white">
                    POP<span className="text-orange-500">GAMING</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-neutral-800 text-orange-400 border border-orange-500/30 rounded">
                    ESPORTS
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Free Fire Tournament Menu</span>
              </div>
            </div>

            <button
              id="mobile-drawer-close-btn"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white border border-orange-400 shadow-md shadow-orange-600/30 cursor-pointer flex items-center justify-center"
              aria-label="Close Mobile Navigation"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* SCROLLABLE DRAWER CONTENT */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            
            {/* USER PROFILE & WALLET QUICK CARD */}
            {isLoggedIn ? (
              <div 
                onClick={() => handleMobileNavClick('profile')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-850 border border-orange-500/30 shadow-md cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {(customUser?.name || currentUser?.displayName || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {customUser?.name || currentUser?.displayName || 'Free Fire Player'}
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono">
                      UID: {customUser?.gameUid || 'Not Set'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">POP Wallet</span>
                  <span className="text-sm font-black text-emerald-400">
                    ₹{walletStats?.totalBalance?.toFixed(0) || '0'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register for Tournaments</span>
              </button>
            )}

            {/* QUICK ACTIONS ROW: LANGUAGE, TRACK, SOUND */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  onOpenTrackModal();
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-orange-400 hover:text-white transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>{t.track} Match</span>
              </button>

              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition cursor-pointer"
              >
                <span>🌐 {language === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}</span>
              </button>
            </div>

            {/* NAVIGATION MENU ITEMS */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 px-1 pt-1">
                Esports Categories
              </p>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-drawer-link-${item.id}`}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/20 text-orange-400 border border-orange-500/50 font-bold shadow-md shadow-orange-500/10'
                        : 'text-neutral-200 hover:bg-neutral-900 bg-neutral-900/60 border border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-neutral-800 text-neutral-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-xs font-black animate-pulse shadow-sm">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* CONTROLS & UTILITIES */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 px-1">
                App Settings
              </p>

              {/* Sound FX Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-neutral-200 border border-neutral-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                  <span>Esports Audio Sound FX</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${soundEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'}`}>
                  {soundEnabled ? 'ENABLED' : 'MUTED'}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-neutral-200 border border-neutral-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-orange-400" />}
                  <span>Display Theme</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-300">
                  {isLight ? 'LIGHT MODE' : 'DARK ESPORTS'}
                </span>
              </button>

              {/* Telegram Channel Button */}
              {settings.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 cursor-pointer shadow-sm shadow-cyan-500/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Join Official Telegram ({settings.telegramChannelName || 'POP Community'})</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              )}

              {/* Admin Portal Button */}
              {isAdmin && (
                <button
                  onClick={() => handleMobileNavClick('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Open Referee Admin Portal</span>
                </button>
              )}

              {/* Sign Out Button */}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-neutral-800 font-bold text-xs cursor-pointer mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              )}
            </div>

            {/* Extra padding at bottom for easy thumb reach */}
            <div className="h-10"></div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

