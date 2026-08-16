import React, { useState } from 'react';
import { 
  Search, 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Lock, 
  Users, 
  AlertCircle, 
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { Registration, Match } from '../types';

interface TrackMatchModalProps {
  initialRegId?: string;
  onClose: () => void;
}

export const TrackMatchModal: React.FC<TrackMatchModalProps> = ({
  initialRegId = '',
  onClose,
}) => {
  const { registrations, matches, settings } = useTournaments();
  const [searchId, setSearchId] = useState(initialRegId);
  const [searchedReg, setSearchedReg] = useState<Registration | null>(() => {
    if (initialRegId) {
      return registrations.find((r) => r.id === initialRegId) || null;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialRegId));
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    const found = registrations.find(
      (r) =>
        r.id.toUpperCase() === query ||
        r.utrNumber === query ||
        r.captainPhone === query ||
        r.players.some((p) => p.gameUid === query || p.inGameName.toUpperCase() === query)
    );
    setSearchedReg(found || null);
    setHasSearched(true);
  };

  const matchedMatch: Match | undefined = searchedReg
    ? matches.find((m) => m.id === searchedReg.matchId)
    : undefined;

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div 
      id="modal-track-match" 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                Track Registration & Room Pass
              </h2>
              <p className="text-xs text-neutral-400">
                Check approval status, verified slot & private room credentials.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Reg ID (e.g. POP-...), Phone or Game UID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Search
            </button>
          </form>

          {/* Search Results */}
          {hasSearched && !searchedReg && (
            <div className="p-8 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Registration Found</h3>
              <p className="text-xs text-neutral-400">
                We could not find any registration matching "{searchId}". Please check your Registration ID or WhatsApp phone number.
              </p>
            </div>
          )}

          {searchedReg && (
            <div className="space-y-4">
              {/* Status Header Banner */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Registration ID</span>
                    <p className="font-mono text-sm font-black text-white">{searchedReg.id}</p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                      searchedReg.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : searchedReg.status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {searchedReg.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {searchedReg.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                    {searchedReg.status === 'PENDING' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                    <span>{searchedReg.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-neutral-800/80 pt-3">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Tournament:</span>
                    <strong className="text-neutral-200">{searchedReg.matchTitle}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Paid Entry:</span>
                    <strong className="text-orange-400 font-bold">₹{searchedReg.entryFee}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Captain / Contact:</span>
                    <span className="text-neutral-300">{searchedReg.captainName} ({searchedReg.captainPhone})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">UTR Reference:</span>
                    <span className="font-mono text-neutral-300">{searchedReg.utrNumber}</span>
                  </div>
                </div>

                {searchedReg.adminNotes && (
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                    <strong className="text-neutral-400">Admin Note: </strong>
                    {searchedReg.adminNotes}
                  </div>
                )}
              </div>

              {/* Roster Information */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Registered Player Roster ({searchedReg.players.length})
                </h4>
                <div className="space-y-1.5">
                  {searchedReg.players.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-neutral-900 border border-neutral-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] flex items-center justify-center font-bold text-neutral-400">
                          {idx + 1}
                        </span>
                        <strong className="text-white">{player.inGameName}</strong>
                      </div>
                      <span className="font-mono text-neutral-400 text-[11px]">UID: {player.gameUid}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROOM ID & PASSWORD SECTION */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/30 via-neutral-950 to-neutral-950 border border-orange-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                  <Key className="w-4 h-4" />
                  <span>Custom Room Access Credentials</span>
                </div>

                {searchedReg.status === 'APPROVED' ? (
                  matchedMatch?.credentialsReleased && matchedMatch.roomId ? (
                    <div className="space-y-2.5 bg-neutral-900 p-3.5 rounded-xl border border-neutral-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Free Fire Room ID:</span>
                          <p className="font-mono text-base font-black text-emerald-400">{matchedMatch.roomId}</p>
                        </div>
                        <button
                          onClick={() => handleCopyCredentials(matchedMatch.roomId || '')}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center border-t border-neutral-800 pt-2">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Room Password:</span>
                          <p className="font-mono text-sm font-bold text-white">{matchedMatch.roomPassword || '1234'}</p>
                        </div>
                        <span className="text-xs text-neutral-400">Slot #{matchedMatch.roomSlotNumber || 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>
                        Your seat is <strong>APPROVED</strong>! Room ID & password will be revealed here 15 minutes before the match start time.
                      </span>
                    </div>
                  )
                ) : searchedReg.status === 'REJECTED' ? (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                    This registration was rejected. Please contact our support team on WhatsApp for payment reconciliation.
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>
                      Room credentials unlock automatically once your payment UTR is verified by Admin.
                    </span>
                  </div>
                )}
              </div>

              {/* Support Ping Button */}
              <a
                href={`https://wa.me/${settings.supportWhatsApp.replace('+', '')}?text=${encodeURIComponent(
                  `Hi POP Gaming Team, my Reg ID is ${searchedReg.id}. I am inquiring about match ${searchedReg.matchTitle}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Contact Admin on WhatsApp</span>
              </a>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
