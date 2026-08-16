import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Target, 
  ShieldCheck, 
  Award, 
  Medal, 
  Users, 
  Sparkles,
  Zap,
  TrendingUp,
  Search
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

interface LeaderboardPlayer {
  rank: number;
  name: string;
  uid: string;
  clan: string;
  totalEarnings: number;
  totalKills: number;
  booyahs: number;
  winRate: string;
  avatarBg: string;
}

const LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  {
    rank: 1,
    name: '⚡POPGOD_AMAN⚡',
    uid: '2849182391',
    clan: 'POP_ELITE',
    totalEarnings: 14850,
    totalKills: 214,
    booyahs: 42,
    winRate: '68.5%',
    avatarBg: 'from-amber-400 to-orange-600',
  },
  {
    rank: 2,
    name: '亗VIKRAM_YT亗',
    uid: '3948291048',
    clan: 'TOTAL_GAMING',
    totalEarnings: 11400,
    totalKills: 178,
    booyahs: 31,
    winRate: '54.2%',
    avatarBg: 'from-slate-300 to-slate-500',
  },
  {
    rank: 3,
    name: '★_ROHIT_FF_★',
    uid: '1948294012',
    clan: 'GODLIKE_ESPORTS',
    totalEarnings: 9650,
    totalKills: 152,
    booyahs: 26,
    winRate: '49.0%',
    avatarBg: 'from-amber-700 to-amber-900',
  },
  {
    rank: 4,
    name: 'IND_RAHUL_99',
    uid: '4839201948',
    clan: 'TEAM_MAVERICK',
    totalEarnings: 7800,
    totalKills: 134,
    booyahs: 19,
    winRate: '44.8%',
    avatarBg: 'from-neutral-800 to-neutral-900',
  },
  {
    rank: 5,
    name: '★DEVIL_SNIPER★',
    uid: '5938201948',
    clan: 'HEADSHOT_KINGS',
    totalEarnings: 6950,
    totalKills: 122,
    booyahs: 17,
    winRate: '41.2%',
    avatarBg: 'from-neutral-800 to-neutral-900',
  },
  {
    rank: 6,
    name: '꧁༒KABIR_PRO༒꧂',
    uid: '8492018492',
    clan: 'POP_ELITE',
    totalEarnings: 5600,
    totalKills: 98,
    booyahs: 14,
    winRate: '38.0%',
    avatarBg: 'from-neutral-800 to-neutral-900',
  },
  {
    rank: 7,
    name: '⚡_PRIYA_GAMER_⚡',
    uid: '9382019481',
    clan: 'FEMALE_WARRIORS',
    totalEarnings: 4900,
    totalKills: 89,
    booyahs: 12,
    winRate: '36.5%',
    avatarBg: 'from-neutral-800 to-neutral-900',
  },
];

export const GlobalLeaderboardView: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'EARNINGS' | 'KILLS' | 'BOOYAHS'>('EARNINGS');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedPlayers = [...LEADERBOARD_PLAYERS].sort((a, b) => {
    if (filterMode === 'KILLS') return b.totalKills - a.totalKills;
    if (filterMode === 'BOOYAHS') return b.booyahs - a.booyahs;
    return b.totalEarnings - a.totalEarnings;
  });

  const filtered = sortedPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.uid.includes(searchQuery)
  );

  const top3 = sortedPlayers.slice(0, 3);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black tracking-wider uppercase border border-orange-500/40 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>SEASON 9 HALL OF FAME</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Esports Leaderboard & Top Fraggers
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              India's best Free Fire MAX champions ranked by verified tournament earnings, placement Booyahs, and official per-kill bounties.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button
              onClick={() => {
                soundFx.playClick();
                setFilterMode('EARNINGS');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterMode === 'EARNINGS'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              💰 Top Earnings (₹)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setFilterMode('KILLS');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterMode === 'KILLS'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🎯 Top Fraggers
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setFilterMode('BOOYAHS');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterMode === 'BOOYAHS'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🏆 Most Booyahs
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="p-6 rounded-3xl bg-neutral-900 border border-slate-700/60 flex flex-col items-center text-center space-y-3 relative order-2 md:order-1 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-500 text-neutral-950 font-black text-xl flex items-center justify-center shadow-lg">
              #2
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SILVER MEDALIST</span>
              <h3 className="text-base font-black text-white">{top3[1].name}</h3>
              <p className="text-xs text-neutral-400 font-mono">UID: {top3[1].uid} | {top3[1].clan}</p>
            </div>
            <div className="w-full pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Earnings</span>
                <span className="font-black text-white">₹{top3[1].totalEarnings.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Total Kills</span>
                <span className="font-black text-orange-400">{top3[1].totalKills}</span>
              </div>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {top3[0] && (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-500/10 via-neutral-900 to-neutral-950 border-2 border-amber-500/50 flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 shadow-2xl scale-100 md:-translate-y-2">
            <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>MVP OF SEASON 9</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-neutral-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 mt-2">
              🏆
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">GRAND CHAMPION</span>
              <h3 className="text-lg font-black text-white">{top3[0].name}</h3>
              <p className="text-xs text-neutral-400 font-mono">UID: {top3[0].uid} | Clan: {top3[0].clan}</p>
            </div>

            <div className="w-full pt-3 border-t border-neutral-800 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Won Cash</span>
                <span className="font-black text-emerald-400 text-sm">₹{top3[0].totalEarnings.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Kills</span>
                <span className="font-black text-orange-400 text-sm">{top3[0].totalKills}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Booyahs</span>
                <span className="font-black text-amber-400 text-sm">{top3[0].booyahs}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-800/60 flex flex-col items-center text-center space-y-3 relative order-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-black text-xl flex items-center justify-center shadow-lg">
              #3
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">BRONZE MEDALIST</span>
              <h3 className="text-base font-black text-white">{top3[2].name}</h3>
              <p className="text-xs text-neutral-400 font-mono">UID: {top3[2].uid} | {top3[2].clan}</p>
            </div>
            <div className="w-full pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Earnings</span>
                <span className="font-black text-white">₹{top3[2].totalEarnings.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Total Kills</span>
                <span className="font-black text-orange-400">{top3[2].totalKills}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              All Ranked Players (Top 100 Roster)
            </h2>
            <p className="text-xs text-neutral-400">Updated automatically after every official match scorecard declaration</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search IGN, UID, or Clan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Player & Clan</th>
                <th className="py-3 px-3 font-mono">Free Fire UID</th>
                <th className="py-3 px-3 text-right">Total Kills</th>
                <th className="py-3 px-3 text-right">Booyahs</th>
                <th className="py-3 px-3 text-right">Win Rate</th>
                <th className="py-3 px-3 text-right">Total Winnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((player, idx) => (
                <tr key={player.uid} className="hover:bg-neutral-800/40 transition">
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                        : idx === 2
                        ? 'bg-amber-800/20 text-amber-600 border border-amber-800/40'
                        : 'text-neutral-400 font-mono'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs">
                        {player.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{player.name}</span>
                        <span className="text-[10px] text-orange-400 font-semibold">{player.clan}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-neutral-400">
                    {player.uid}
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-orange-400">
                    {player.totalKills}
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-amber-400">
                    {player.booyahs}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-neutral-300">
                    {player.winRate}
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-emerald-400 text-sm">
                    ₹{player.totalEarnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
