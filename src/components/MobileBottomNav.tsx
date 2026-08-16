import React from 'react';
import { 
  Flame, 
  Trophy, 
  Receipt, 
  Crown, 
  User, 
  Wallet,
  Sparkles,
  Key
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, customUser, registrations, matches } = useTournaments();

  const activeUid = customUser?.uid || currentUser?.uid;
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();

  const userActivePasses = activeUid || activeEmail ? registrations.filter((r) => {
    const isUser = 
      (activeUid && r.userId === activeUid) ||
      (activeEmail && r.captainEmail?.toLowerCase() === activeEmail);
    const match = matches.find((m) => m.id === r.matchId);
    return isUser && match && match.status !== 'COMPLETED' && match.status !== 'CANCELLED';
  }) : [];

  const navItems = [
    { id: 'home', label: 'Lobby', icon: Flame },
    { id: 'tournaments', label: 'Matches', icon: Trophy },
    { 
      id: 'orders', 
      label: 'My Passes', 
      icon: Key, 
      badge: userActivePasses.length > 0 ? userActivePasses.length : null 
    },
    { id: 'leaderboard', label: 'Hall of Fame', icon: Crown },
    { id: 'profile', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/90 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-dock-${item.id}`}
              onClick={() => {
                soundFx.playClick();
                setCurrentTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative cursor-pointer ${
                isActive
                  ? 'text-orange-400 bg-orange-500/10 font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition ${isActive ? 'text-orange-400 stroke-[2.5]' : 'text-neutral-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[60px] ${isActive ? 'text-orange-400 font-extrabold' : 'text-neutral-400'}`}>
                {item.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5 shadow-sm shadow-orange-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
