import React, { useState } from 'react';
import { 
  Trophy, 
  History, 
  Search, 
  ShieldCheck, 
  Users, 
  ExternalLink,
  Flame,
  Clock,
  Medal
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { MatchResult } from '../types';
import { LeaderboardListSkeleton } from './SkeletonLoaders';

export const ResultsView: React.FC = () => {
  const { results } = useTournaments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = results.filter((res) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      res.matchTitle.toLowerCase().includes(q) ||
      res.firstPlace.teamOrPlayerName.toLowerCase().includes(q) ||
      res.firstPlace.uids.some((uid) => uid.includes(q))
    );
  });

  return (
    <div id="results-view" className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest inline-block">
            Verified Public Ledger
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Official Match Results & Prize Payouts
          </h1>
          <p className="text-sm text-neutral-300">
            Every completed match on POP Gaming is verified and published by our tournament referees with transparent kill tallies and UPI payout distributions.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex justify-between items-center bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by winner name, match title, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">
          Showing {filteredResults.length} Verified Results
        </span>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <LeaderboardListSkeleton count={4} />
      ) : filteredResults.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <History className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No results found</h3>
          <p className="text-xs text-neutral-400">
            No match results match your search term. Try another player name or match title.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredResults.map((result) => (
          <div
            key={result.id}
            id={`result-item-${result.id}`}
            className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5 shadow-xl"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                  {result.gameMode.toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-white">{result.matchTitle}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Completed: {new Date(result.completedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Ref: {result.publishedBy}</span>
                </div>
              </div>

              <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800 text-right">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Match Payout</span>
                <span className="text-base font-black text-emerald-400">₹{result.totalPayout}</span>
              </div>
            </div>

            {/* Podium Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1st Place */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-amber-500/15 via-neutral-950 to-neutral-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Medal className="w-4 h-4" />
                    <span>1st Place (Booyah)</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">₹{result.firstPlace.totalPrize}</span>
                </div>
                <p className="font-extrabold text-sm text-white truncate">{result.firstPlace.teamOrPlayerName}</p>
                <div className="flex justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 pt-2">
                  <span>Kills: <strong className="text-white">{result.firstPlace.kills}</strong></span>
                  <span>Placement: ₹{result.firstPlace.placementPrize}</span>
                  <span>Kill Bounty: ₹{result.firstPlace.killPrize}</span>
                </div>
              </div>

              {/* 2nd Place */}
              {result.secondPlace && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300">2nd Place</span>
                    <span className="text-xs font-extrabold text-emerald-400">₹{result.secondPlace.totalPrize}</span>
                  </div>
                  <p className="font-extrabold text-sm text-white truncate">{result.secondPlace.teamOrPlayerName}</p>
                  <div className="flex justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 pt-2">
                    <span>Kills: <strong className="text-white">{result.secondPlace.kills}</strong></span>
                    <span>Placement: ₹{result.secondPlace.placementPrize}</span>
                    <span>Kill Bounty: ₹{result.secondPlace.killPrize}</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {result.thirdPlace && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300">3rd Place</span>
                    <span className="text-xs font-extrabold text-emerald-400">₹{result.thirdPlace.totalPrize}</span>
                  </div>
                  <p className="font-extrabold text-sm text-white truncate">{result.thirdPlace.teamOrPlayerName}</p>
                  <div className="flex justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 pt-2">
                    <span>Kills: <strong className="text-white">{result.thirdPlace.kills}</strong></span>
                    <span>Placement: ₹{result.thirdPlace.placementPrize}</span>
                    <span>Kill Bounty: ₹{result.thirdPlace.killPrize}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
