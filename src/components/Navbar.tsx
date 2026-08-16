import React, { useState } from 'react';
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
  Send
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from './NotificationCenter';
import { soundFx } from '../lib/soundEffects';

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
  const { currentUser, customUser, isAdmin, logout, settings, registrations, matches } = useTournaments();
  const { theme, isLight, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  const isLoggedIn = Boolean(customUser || currentUser);
  const activeUid = customUser?.uid || currentUser?.uid;
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();

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
    { id: 'home', label: 'Home Lobby', icon: Flame },
    { id: 'tournaments', label: 'Daily Tournaments', icon: Trophy },
    { id: 'orders', label: 'My Passes & Orders', icon: Key, badge: userActivePasses.length > 0 ? userActivePasses.length : null },
    { id: 'leaderboard', label: 'Hall of Fame', icon: Crown },
    { id: 'championship', label: 'Grand Championship', icon: Sparkles },
    { id: 'results', label: 'Winners & Results', icon: History },
    { id: 'rules', label: 'Rules & FAQ', icon: HelpCircle },
  ];

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  const activeAnnouncement = settings.announcements?.find(a => a.active);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      {/* Top Ticker / Notification */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-1.5 px-4 text-xs font-semibold text-white text-center flex items-center justify-center gap-2 tracking-wide shadow-inner">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>
          {activeAnnouncement
            ? `📢 ${activeAnnouncement.title}: ${activeAnnouncement.message}`
            : settings.announcementTicker || '🔥 POP GAMING SEASON 9: ₹10,000+ Prize Pool Championship Registration Open! Daily Rooms Every 30 Mins.'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            id="nav-logo" 
            onClick={() => {
              soundFx.playClick();
              setCurrentTab('home');
            }} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            {settings.appLogo ? (
              <img
                src={settings.appLogo}
                alt="POP Gaming Logo"
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-contain shadow-lg shadow-orange-500/20 group-hover:scale-105 transition duration-200 border border-orange-400/40 bg-neutral-900 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition duration-200 border border-orange-400/40 shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="text-lg sm:text-2xl font-black tracking-wider text-white whitespace-nowrap">
                  POP<span className="text-orange-500">GAMING</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-neutral-800 text-orange-400 border border-orange-500/30 rounded whitespace-nowrap">
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

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
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
              <span>Track Match</span>
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
              <span className="hidden md:inline-block">Profile & Wallet</span>
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
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Actions (Track & Hamburger) */}
          <div className="flex xl:hidden items-center gap-2 shrink-0">
            <button
              id="btn-mobile-track"
              onClick={() => {
                soundFx.playClick();
                onOpenTrackModal();
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-orange-400 border border-neutral-800 cursor-pointer"
            >
              Track
            </button>
            <button
              id="btn-mobile-toggle"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Full height scrollable overlay) */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu-drawer" 
          className="xl:hidden fixed inset-x-0 top-full h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] bg-neutral-950/98 backdrop-blur-2xl border-b border-neutral-800 px-4 pt-3 pb-32 space-y-2 overflow-y-auto overscroll-contain shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="space-y-1.5 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-orange-400 border border-orange-500/30 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-xs font-bold">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2.5 pb-8">
            {/* Mobile Sound FX Toggle */}
            <button
              id="mobile-drawer-sound-toggle"
              type="button"
              onClick={handleToggleSound}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-neutral-900 text-neutral-200 border border-neutral-800 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-orange-400" /> : <VolumeX className="w-5 h-5 text-neutral-500" />}
                <span>Esports Game Sound Effects</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Mobile Theme Switch Button */}
            <button
              id="mobile-drawer-theme-toggle"
              type="button"
              onClick={() => {
                soundFx.playClick();
                toggleTheme();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border transition cursor-pointer ${
                isLight
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:text-amber-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {isLight ? (
                  <Sun className="w-5 h-5 text-amber-600 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5 text-orange-400" />
                )}
                <span>{isLight ? 'Light Mode' : 'Dark Esports Mode'}</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {isLight ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Mobile Telegram Channel Button */}
            {settings.telegramUrl && (
              <a
                id="mobile-drawer-telegram-btn"
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 cursor-pointer shadow-sm shadow-cyan-500/10"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-cyan-400" />
                  <span>Join Official Telegram</span>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>
            )}

            {isAdmin && (
              <button
                id="mobile-btn-admin"
                onClick={() => {
                  soundFx.playClick();
                  setCurrentTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Open Admin Portal</span>
              </button>
            )}

            {!currentUser && !customUser && !isAdmin ? (
              <button
                id="mobile-btn-login"
                onClick={() => {
                  soundFx.playClick();
                  onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 cursor-pointer active:scale-98 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Player Login / Admin Access</span>
              </button>
            ) : (
              <button
                id="mobile-btn-logout"
                onClick={() => {
                  soundFx.playClick();
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 font-medium text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

