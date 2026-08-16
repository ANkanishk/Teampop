import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  MapPin, 
  Gamepad2, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { Match, Registration } from '../types';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

interface LiveLobbyModalProps {
  match: Match;
  onClose: () => void;
  onRegisterClick: () => void;
}

export const LiveLobbyModal: React.FC<LiveLobbyModalProps> = ({
  match,
  onClose,
  onRegisterClick,
}) => {
  const { registrations } = useTournaments();
  const [searchRoster, setSearchRoster] = useState('');

  const matchRegistrations = registrations.filter((r) => r.matchId === match.id);
  const totalOccupiedSlots = matchRegistrations.reduce((acc, r) => acc + (r.players?.length || 1), 0);

  const filteredRegistrations = matchRegistrations.filter((r) =>
    r.captainName.toLowerCase().includes(searchRoster.toLowerCase()) ||
    r.players.some((p) =>
      p.inGameName.toLowerCase().includes(searchRoster.toLowerCase()) ||
      p.gameUid.includes(searchRoster)
    )
  );

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Live Tournament Lobby & Squad Roster
              </h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                {match.title}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Match Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Lobby Capacity</span>
              <p className="text-lg font-black text-white">
                {match.approvedCount || totalOccupiedSlots} / {match.maxPlayers} Slots
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Prize Pool</span>
              <p className="text-lg font-black text-emerald-400">
                ₹{match.rewardConfig.fixedWinnerPrize || match.entryFee * 2}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Per Kill Bounty</span>
              <p className="text-lg font-black text-orange-400">
                ₹{match.rewardConfig.perKillReward || 0}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Match Time</span>
              <p className="text-sm font-black text-white flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{match.scheduledStart}</span>
              </p>
            </div>
          </div>

          {/* Slots Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-400">Lobby Slots Filled</span>
              <span className="text-orange-400 font-mono">
                {Math.round(((match.approvedCount || totalOccupiedSlots) / (match.maxPlayers || 48)) * 100)}% Full
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, ((match.approvedCount || totalOccupiedSlots) / (match.maxPlayers || 48)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Roster Search */}
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
              Confirmed Squads & Players ({matchRegistrations.length})
            </h4>

            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search player/IGN..."
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Registered Players List */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-500">
              No registered squads found in this lobby yet. Be the first team to claim slot #1!
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRegistrations.map((reg, slotIndex) => (
                <div
                  key={reg.id}
                  className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-black text-orange-400 shrink-0">
                      #{slotIndex + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{reg.captainName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {reg.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-neutral-400 text-[11px] mt-0.5">
                        {reg.players.map((p, idx) => (
                          <span key={idx} className="font-mono">
                            <strong className="text-orange-400 font-bold">{p.inGameName}</strong> (UID: {p.gameUid})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-neutral-500">
                      Pass: {reg.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">
              Entry: <strong className="text-white font-bold">₹{match.entryFee}</strong>
            </span>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
                onRegisterClick();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              Join Tournament Room Now
            </button>
          </div>

        </div>
        </div>

      </div>
    </div>
  );
};
