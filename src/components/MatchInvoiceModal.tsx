import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Gamepad2, 
  Trophy, 
  Key, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Registration, Match } from '../types';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

interface MatchInvoiceModalProps {
  registration: Registration;
  match?: Match;
  onClose: () => void;
}

export const MatchInvoiceModal: React.FC<MatchInvoiceModalProps> = ({
  registration,
  match,
  onClose,
}) => {
  const { settings } = useTournaments();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const isRoomUnlocked = match?.roomId && match.status !== 'REGISTRATION_OPEN';

  const handleCopyOrderId = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(registration.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyRoomId = () => {
    if (!match?.roomId) return;
    soundFx.playClick();
    navigator.clipboard.writeText(match.roomId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!match?.roomPassword) return;
    soundFx.playClick();
    navigator.clipboard.writeText(match.roomPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          
          {/* Header Actions Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-neutral-950 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Official Match Entry Pass & Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Pass Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white">
          
          {/* Brand Header */}
          <div className="flex items-start justify-between border-b border-neutral-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-wider text-white">
                  POP<span className="text-orange-500">GAMING</span> ESPORTS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                India's Verified Free Fire MAX Tournament Arena
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                registration.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : registration.status === 'REJECTED'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
              }`}>
                {registration.status === 'APPROVED' ? '✓ VERIFIED ENTRY PASS' : registration.status}
              </span>
              <p className="text-[10px] font-mono text-neutral-400">
                Issued: {new Date(registration.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Ticket Barcode / Pass ID Strip */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                Official Order / Registration ID
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-black text-orange-400 tracking-wider">
                  {registration.id}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold">
                UTR: {registration.utrNumber}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs font-bold">
                ₹{registration.totalPayable} PAID
              </div>
            </div>
          </div>

          {/* Match & Room Info Card */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                {registration.matchTitle}
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold">
                Mode: {registration.gameMode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] uppercase font-semibold">Match Schedule</span>
                <p className="font-bold text-neutral-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>{match?.scheduledStart || 'Check Schedule'}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] uppercase font-semibold">Map</span>
                <p className="font-bold text-neutral-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{match?.mapName || 'Bermuda'}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[10px] uppercase font-semibold">Booyah Prize</span>
                <p className="font-black text-emerald-400">
                  ₹{match?.rewardConfig?.fixedWinnerPrize || (match ? match.entryFee * 2 : 'Top Rank Payout')}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Room Unlock Banner (When Approved) */}
          {registration.status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-950 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Free Fire Custom Room Credentials</span>
                </span>
                {isRoomUnlocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-neutral-950 font-extrabold animate-pulse">
                    LIVE UNLOCKED
                  </span>
                )}
              </div>

              {isRoomUnlocked ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Room ID</span>
                      <span className="font-mono text-base font-black text-white">{match?.roomId}</span>
                    </div>
                    <button
                      onClick={handleCopyRoomId}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedRoom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Password</span>
                      <span className="font-mono text-base font-black text-orange-400">{match?.roomPassword}</span>
                    </div>
                    <button
                      onClick={handleCopyPassword}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-300">
                  ⏳ Room ID & Password will be published 15 minutes before the match start time. Keep this pass open or check the Track Match page.
                </p>
              )}
            </div>
          )}

          {/* Player & Team Roster */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>Registered Squad / Player Roster:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {registration.players.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                      Player #{idx + 1} {idx === 0 && '(Captain)'}
                    </span>
                    <p className="font-black text-white">{p.inGameName || 'Player'}</p>
                  </div>
                  <span className="font-mono text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                    UID: {p.gameUid}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Contact Verification Footnote */}
          <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
            <div>
              <span>Helpline: <strong className="text-emerald-400 font-mono">{settings.supportWhatsApp}</strong></span>
              <span className="mx-2">•</span>
              <span>Admin: <strong className="text-neutral-300 font-mono">wepopearn@gmail.com</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Esports Entry</span>
            </div>
          </div>

        </div>
        </div>

      </div>
    </div>
  );
};
