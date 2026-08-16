import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  Medal,
  Award
} from 'lucide-react';
import { Match } from '../types';
import { useTournaments } from '../context/TournamentContext';

interface ChampionshipViewProps {
  onSelectChampionshipMatch: (match: Match) => void;
}

export const ChampionshipView: React.FC<ChampionshipViewProps> = ({
  onSelectChampionshipMatch,
}) => {
  const { matches } = useTournaments();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEDULE' | 'POINTS_TABLE' | 'PRIZES'>('OVERVIEW');

  // Simulated championship match object for instant registration
  const monthlyMatch: Match = {
    id: 'match-champ-monthly-01',
    matchCode: 'POP-CHAMP-M9',
    title: 'POP Gaming Season 9 Grand Championship',
    gameMode: 'monthly-championship',
    gameModeName: 'Monthly Grand Championship',
    entryFee: 1000,
    maxPlayers: 96,
    minPlayers: 48,
    approvedCount: 64,
    status: 'REGISTRATION_OPEN',
    scheduledStart: 'This Sunday at 7:00 PM IST',
    mapName: '6-Map Circuit (Bermuda + Purgatory + Kalahari)',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Squad (4 Players + 1 Sub)',
      revivesAllowed: false,
      gunAttributes: true,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: '6 consecutive official maps. Official points table. Live casted.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 5.0,
      secondPlaceMultiplier: 2.5,
      thirdPlaceMultiplier: 1.5,
      perKillReward: 0,
      fixedWinnerPrize: 5000,
      fixedRunnerUpPrize: 2500,
      fixedThirdPrize: 1500,
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
  };

  const pointsSystem = [
    { rank: '1st Place (Booyah)', pts: '12 Points' },
    { rank: '2nd Place', pts: '9 Points' },
    { rank: '3rd Place', pts: '8 Points' },
    { rank: '4th Place', pts: '7 Points' },
    { rank: '5th Place', pts: '6 Points' },
    { rank: '6th Place', pts: '5 Points' },
    { rank: '7th - 10th', pts: '2 Points' },
    { rank: 'Each Confirmed Kill', pts: '+1 Point' },
  ];

  const currentLeaderboard = [
    { rank: 1, team: 'TEAM MAFIA ESPORTS', kills: 34, placementPts: 48, total: 82 },
    { rank: 2, team: 'GODLIKE FREE FIRE', kills: 30, placementPts: 42, total: 72 },
    { rank: 3, team: 'TSM INDIA CLAN', kills: 27, placementPts: 36, total: 63 },
    { rank: 4, team: 'TOTAL WARRIORS', kills: 22, placementPts: 30, total: 52 },
    { rank: 5, team: 'RASTAR ARMY ELITE', kills: 25, placementPts: 24, total: 49 },
  ];

  return (
    <div id="championship-view" className="space-y-8 pb-16">
      {/* Mega Event Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-amber-500/30 shadow-2xl p-6 sm:p-10">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${monthlyMatch.bannerImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/40" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASON 9 FLAGSHIP ESPORTS EVENT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            POP Gaming Grand Monthly Championship
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
            The pinnacle competitive arena for Free Fire MAX squads in India. 6 grueling maps, official tournament referees, live streaming, and a guaranteed <strong className="text-amber-400">₹10,000+ Prize Pool</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-300 pt-2">
            <div className="flex items-center gap-1.5 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>This Sunday, 7:00 PM</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Squad (4 + 1 Sub)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>₹10,000 Total Prize Pool</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSelectChampionshipMatch(monthlyMatch)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white font-extrabold text-sm uppercase tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Squad (₹1,000 Entry)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-neutral-800 gap-6 text-sm font-bold">
        {[
          { id: 'OVERVIEW', label: 'Championship Overview' },
          { id: 'POINTS_TABLE', label: 'Points System & Standings' },
          { id: 'PRIZES', label: 'Prize Distribution' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === t.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Tournament Format & Schedule
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Squads play a 6-map gauntlet across Bermuda, Purgatory, and Kalahari. Standings are computed continuously using the official Free Fire Esports scoring matrix with kills and placement weights.
            </p>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Match 1 & 2: Bermuda Classic Esports Layout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Match 3 & 4: Purgatory Strategic Zones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Match 5 & 6: Kalahari Final Clashes</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Eligibility & Rules
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              All players must be on Mobile devices (iOS / Android). Emulators and scripts are strictly monitored and banned with automated disqualification.
            </p>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li className="flex items-center gap-2">• Must submit all 4 active player UIDs during registration</li>
              <li className="flex items-center gap-2">• Team captain must be present in the official Discord / WhatsApp group</li>
              <li className="flex items-center gap-2">• 15-minute grace window for room lobby join</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'POINTS_TABLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points matrix */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Official Points System
            </h3>
            <div className="divide-y divide-neutral-800 text-xs">
              {pointsSystem.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-300 font-medium">{item.rank}</span>
                  <span className="font-extrabold text-amber-400">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standings */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Current Season 9 League Standings
            </h3>
            <div className="divide-y divide-neutral-800 text-xs">
              {currentLeaderboard.map((team) => (
                <div key={team.rank} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white">
                      {team.rank}
                    </span>
                    <div>
                      <strong className="text-white block">{team.team}</strong>
                      <span className="text-[10px] text-neutral-400">{team.kills} Total Kills</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-400">{team.total} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PRIZES' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/20 to-neutral-900 border border-amber-500/40 text-center space-y-3">
            <Medal className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">1st Place Champion</h4>
            <p className="text-3xl font-black text-amber-400">₹5,000</p>
            <p className="text-xs text-neutral-300">+ Official Season 9 Trophy & Hall of Fame Badge</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 text-center space-y-3">
            <Award className="w-12 h-12 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">2nd Place Runner Up</h4>
            <p className="text-3xl font-black text-white">₹2,500</p>
            <p className="text-xs text-neutral-300">Direct Seed in Mega Invitational</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-900/30 to-neutral-900 border border-amber-900/50 text-center space-y-3">
            <Award className="w-12 h-12 text-amber-600 mx-auto" />
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">3rd Place Podium</h4>
            <p className="text-3xl font-black text-amber-500">₹1,500</p>
            <p className="text-xs text-neutral-300">Cash Settlement + Podium Honors</p>
          </div>
        </div>
      )}
    </div>
  );
};
