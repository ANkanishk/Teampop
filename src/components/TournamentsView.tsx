import React, { useState } from 'react';
import { 
  Trophy, 
  Filter, 
  Search, 
  Clock, 
  Users, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Gamepad2,
  Eye,
  Sparkles
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { Match, GameModeId } from '../types';
import { getPerKillReward, calculateBRPlacementRewards } from '../data/tournamentData';
import { TournamentListSkeleton } from './SkeletonLoaders';
import { LiveLobbyModal } from './LiveLobbyModal';
import { soundFx } from '../lib/soundEffects';

interface TournamentsViewProps {
  onSelectMatch: (match: Match) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({ onSelectMatch }) => {
  const { matches } = useTournaments();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEntryRange, setSelectedEntryRange] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lobbyMatchModal, setLobbyMatchModal] = useState<Match | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Modes' },
    { id: 'BR', label: 'Battle Royale' },
    { id: 'CS', label: 'Clash Squad' },
    { id: 'SPECIAL', label: '1v1 / Lone Wolf' },
  ];

  const entryRanges = [
    { id: 'ALL', label: 'Any Entry' },
    { id: 'LOW', label: '₹20 - ₹50' },
    { id: 'MID', label: '₹100 - ₹300' },
    { id: 'HIGH', label: '₹400+' },
  ];

  const filteredMatches = matches.filter((match) => {
    // Category filter
    if (selectedCategory === 'BR' && !match.gameMode.includes('br')) return false;
    if (selectedCategory === 'CS' && !match.gameMode.includes('cs')) return false;
    if (
      selectedCategory === 'SPECIAL' &&
      !match.gameMode.includes('lone-wolf') &&
      !match.gameMode.includes('headshot')
    )
      return false;

    // Entry fee filter
    if (selectedEntryRange === 'LOW' && (match.entryFee < 20 || match.entryFee > 50)) return false;
    if (selectedEntryRange === 'MID' && (match.entryFee < 100 || match.entryFee > 300)) return false;
    if (selectedEntryRange === 'HIGH' && match.entryFee < 400) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = match.title.toLowerCase();
      const modeName = match.gameModeName.toLowerCase();
      const code = match.matchCode.toLowerCase();
      if (!matchTitle.includes(q) && !modeName.includes(q) && !code.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div id="tournaments-view" className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-widest inline-block">
            Verified Esports Rooms
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Daily Free Fire MAX Tournaments
          </h1>
          <p className="text-sm text-neutral-300">
            Select an active match room below. Room ID and private credentials are automatically released 15 minutes before the match start time.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Entry Fee & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {entryRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedEntryRange(range.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedEntryRange === range.id
                    ? 'bg-neutral-700 text-orange-400 border border-orange-500/40'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-700/80 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {matches.length === 0 ? (
        <TournamentListSkeleton count={6} />
      ) : filteredMatches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Gamepad2 className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No matches found</h3>
          <p className="text-xs text-neutral-400">
            No rooms match your active search filters. Try adjusting category or price range.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const placementPrizes = calculateBRPlacementRewards(match.entryFee);
            const killBounty = getPerKillReward(match.entryFee);
            const fillPercentage = Math.round((match.approvedCount / match.maxPlayers) * 100);

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="group rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/50 transition duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={match.bannerImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                    {/* Entry Badge */}
                    <div className="absolute top-3 right-3 bg-neutral-950/90 border border-orange-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Entry</p>
                      <p className="text-base font-black text-orange-400 leading-none">₹{match.entryFee}</p>
                    </div>

                    <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-700 text-neutral-200 text-[11px] font-bold uppercase tracking-wider">
                        {match.matchCode}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${
                          match.status === 'ALMOST_FULL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : match.status === 'FULL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : match.status === 'COMPLETED'
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {match.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                        {match.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {match.scheduledStart}
                        </span>
                        <span>•</span>
                        <span>{match.mapName}</span>
                      </div>
                    </div>

                    {/* Reward Breakdown */}
                    <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 text-xs">
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-semibold uppercase">1st Prize</span>
                        <span className="font-extrabold text-emerald-400 text-sm">
                          ₹{match.rewardConfig.fixedWinnerPrize || placementPrizes.first}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Kill Bounty</span>
                        <span className="font-extrabold text-orange-400 text-sm">
                          {killBounty > 0 ? `₹${killBounty} / kill` : 'Format Fixed'}
                        </span>
                      </div>
                    </div>

                    {/* Capacity & View Lobby */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-neutral-500" />
                          Confirmed Slots
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white">
                            {match.approvedCount} / {match.maxPlayers}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playClick();
                              setLobbyMatchModal(match);
                            }}
                            className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Lobby</span>
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fillPercentage >= 80 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, fillPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    id={`btn-select-match-${match.id}`}
                    disabled={match.status === 'FULL' || match.status === 'COMPLETED'}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectMatch(match);
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                      match.status === 'FULL' || match.status === 'COMPLETED'
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20'
                    }`}
                  >
                    <span>{match.status === 'COMPLETED' ? 'Match Finished' : match.status === 'FULL' ? 'Room Full' : 'Register Slot'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Lobby Roster Modal */}
      {lobbyMatchModal && (
        <LiveLobbyModal
          match={lobbyMatchModal}
          onClose={() => setLobbyMatchModal(null)}
          onRegisterClick={() => {
            onSelectMatch(lobbyMatchModal);
          }}
        />
      )}
    </div>
  );
};
