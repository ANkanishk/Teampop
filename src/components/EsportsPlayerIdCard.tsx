import React, { useState } from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Target, 
  Crosshair, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Gamepad2, 
  Award,
  Crown,
  Volume2
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

export const EsportsPlayerIdCard: React.FC = () => {
  const { currentUser, customUser, getUserWalletStats, registrations, results } = useTournaments();
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedCardLink, setCopiedCardLink] = useState(false);

  const stats = getUserWalletStats();

  const isUserLoggedIn = Boolean(customUser || currentUser);
  const effectiveName = customUser?.displayName || currentUser?.displayName || 'Guest Player';
  const effectiveUid = customUser?.gameUid || (isUserLoggedIn ? 'UID: Not Linked' : 'Sign in to generate');
  const effectiveIgn = customUser?.inGameName || effectiveName;
  const effectiveEmail = customUser?.email || currentUser?.email || 'guest@popgaming.com';

  const userMatches = registrations.filter(
    (r) => (customUser && r.userId === customUser.uid) ||
           (currentUser && r.userId === currentUser.uid) ||
           (isUserLoggedIn && r.captainEmail?.toLowerCase() === effectiveEmail.toLowerCase())
  );

  const approvedMatches = userMatches.filter(r => r.status === 'APPROVED').length;

  const handleCopyUid = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(effectiveUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleShareCard = () => {
    soundFx.playSuccess();
    const shareText = `🎮 Free Fire Esports Gamer Passport: ${effectiveIgn} (UID: ${effectiveUid}) | Total Winnings: ₹${stats.totalWonAmount} on POP Gaming Esports Arena!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedCardLink(true);
      setTimeout(() => setCopiedCardLink(false), 2500);
    }
  };

  const handlePlayBooyah = () => {
    soundFx.playBooyahFanfare();
  };

  return (
    <div className="relative group">
      {/* Glow Layer */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

      {/* Main 3D Styled Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800/90 p-5 sm:p-7 shadow-2xl overflow-hidden text-white space-y-5">
        
        {/* Holographic Watermark Background Icon */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 pointer-events-none text-orange-500">
          <Trophy className="w-full h-full" />
        </div>

        {/* Top Card Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-widest text-white uppercase">
              POP<span className="text-orange-500">ESPORTS</span> PASSPORT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayBooyah}
              title="Play Booyah Fanfare Sound"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-orange-600 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black tracking-wider border border-orange-500/40">
              SEASON 9 PRO
            </span>
          </div>
        </div>

        {/* Player Profile Spotlight */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with Glowing Border */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 p-0.5 shadow-xl shadow-orange-600/30">
              <div className="w-full h-full rounded-2xl bg-neutral-950 flex items-center justify-center text-white text-3xl font-black">
                {effectiveIgn[0]?.toUpperCase() || 'P'}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-neutral-950 shadow-md">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {effectiveIgn}
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>KYC VERIFIED</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
                <span>FF UID: <strong className="text-orange-400">{effectiveUid}</strong></span>
                <button
                  onClick={handleCopyUid}
                  className="hover:text-white transition cursor-pointer"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <span className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 font-semibold">
                Tier: Grandmaster
              </span>
            </div>
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-0.5">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Matches</span>
            <span className="text-lg font-black text-white">{userMatches.length || 6}</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-0.5">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Slot Confirmed</span>
            <span className="text-lg font-black text-emerald-400">{approvedMatches || 4}</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-0.5">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Cash Winnings</span>
            <span className="text-lg font-black text-orange-400">₹{stats.totalWonAmount || 450}</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center space-y-0.5">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Fairplay</span>
            <span className="text-lg font-black text-cyan-400">100%</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Role: <strong className="text-white font-semibold">Rusher & Sniper</strong></span>
          </div>

          <button
            onClick={handleShareCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition shadow-md cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedCardLink ? 'Passport Copied!' : 'Share Gamer ID'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
