import React, { useState } from 'react';
import { 
  History, 
  Receipt, 
  ShieldCheck, 
  Key, 
  Clock, 
  Copy, 
  Check, 
  Trophy, 
  Flame, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Eye, 
  Search, 
  Filter, 
  QrCode,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { Registration, Match, WalletTransaction } from '../types';
import { MatchInvoiceModal } from './MatchInvoiceModal';
import { EsportsPlayerIdCard } from './EsportsPlayerIdCard';
import { soundFx } from '../lib/soundEffects';

interface MyOrdersHistoryViewProps {
  onOpenLoginModal?: () => void;
}

export const MyOrdersHistoryView: React.FC<MyOrdersHistoryViewProps> = ({ onOpenLoginModal }) => {
  const { 
    currentUser, 
    customUser, 
    registrations, 
    matches, 
    results, 
    withdrawals, 
    walletTransactions,
    getUserWalletStats 
  } = useTournaments();

  const [activeTab, setActiveTab] = useState<'ACTIVE_PASSES' | 'ORDERS' | 'BOUNTY_HISTORY' | 'PAYOUT_TRACKER'>('ACTIVE_PASSES');
  const [selectedRegForInvoice, setSelectedRegForInvoice] = useState<Registration | null>(null);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const stats = getUserWalletStats();

  const isLoggedIn = Boolean(customUser || currentUser);
  const activeUid = customUser?.uid || currentUser?.uid;
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();

  // Filter user's registrations
  const userRegistrations = isLoggedIn
    ? registrations.filter(
        (r) =>
          (activeUid && r.userId === activeUid) ||
          (activeEmail && r.captainEmail?.toLowerCase() === activeEmail)
      )
    : searchTerm.trim()
    ? registrations.filter(
        (r) =>
          r.id.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          r.utrNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          (r.captainPhone && r.captainPhone.includes(searchTerm.trim()))
      )
    : [];

  // Active matches where user has registered
  const activeRegistrations = userRegistrations.filter((r) => {
    const targetMatch = matches.find((m) => m.id === r.matchId);
    return targetMatch && targetMatch.status !== 'COMPLETED' && targetMatch.status !== 'CANCELLED';
  });

  // User's withdrawal requests
  const userWithdrawals = isLoggedIn
    ? withdrawals.filter(
        (w) =>
          (activeUid && w.userId === activeUid) ||
          (activeEmail && w.userEmail?.toLowerCase() === activeEmail)
      )
    : [];

  const handleCopyRoom = (id: string, text: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedRoomId(id);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleCopyPass = (id: string, text: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedPassword(id);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const handleOpenInvoice = (reg: Registration) => {
    soundFx.playClick();
    setSelectedRegForInvoice(reg);
  };

  // Filtered orders list
  const filteredOrders = userRegistrations.filter((reg) => {
    const matchesSearch = 
      reg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.matchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.utrNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'ALL' || reg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div id="orders-history-container" className="space-y-6 pb-16">
      
      {/* Player Identity Passport Card */}
      <EsportsPlayerIdCard />

      {/* Main Order & History Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ACTIVE_PASSES');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ACTIVE_PASSES'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Active Passes & Room Unlocks ({activeRegistrations.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ORDERS');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Order History & Invoices ({userRegistrations.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('BOUNTY_HISTORY');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'BOUNTY_HISTORY'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bounty Wins & Match Scores</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('PAYOUT_TRACKER');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'PAYOUT_TRACKER'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Withdrawal Trackers ({userWithdrawals.length})</span>
          </button>
        </div>
      </div>

      {/* 1. ACTIVE MATCH PASSES & LIVE ROOM UNLOCK TAB */}
      {activeTab === 'ACTIVE_PASSES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-400" />
                <span>Active Tournament Passes & Live Room Unlocks</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Approved custom room credentials and live countdown before match starts
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
              ● Live Auto-Sync Active
            </span>
          </div>

          {activeRegistrations.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-2">
              <Key className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="font-bold text-neutral-300">No active tournament passes right now.</p>
              <p className="text-neutral-500">Join any daily tournament or championship room to receive your instant match pass!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRegistrations.map((reg) => {
                const match = matches.find((m) => m.id === reg.matchId);
                const hasRoomCredentials = match?.roomId && match.status !== 'REGISTRATION_OPEN';

                return (
                  <div
                    key={reg.id}
                    className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-orange-500/40 transition shadow-xl space-y-4 relative overflow-hidden"
                  >
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-orange-400">{reg.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          reg.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}>
                          {reg.status === 'APPROVED' ? '✓ VERIFIED PASS' : 'APPROVAL PENDING'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenInvoice(reg)}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-orange-400 transition cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Pass Receipt</span>
                      </button>
                    </div>

                    {/* Match Info */}
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white">{reg.matchTitle}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                        <span>Schedule: <strong className="text-neutral-200">{match?.scheduledStart || 'Scheduled Soon'}</strong></span>
                        <span>•</span>
                        <span>Map: <strong className="text-neutral-200">{match?.mapName || 'Bermuda'}</strong></span>
                        <span>•</span>
                        <span>Entry: <strong className="text-emerald-400">₹{reg.entryFee}</strong></span>
                      </div>
                    </div>

                    {/* Live Room Credentials Box */}
                    {reg.status === 'APPROVED' ? (
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-orange-400" />
                            <span>Free Fire Custom Room Credentials</span>
                          </span>
                          {hasRoomCredentials && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-neutral-950 font-black animate-pulse">
                              UNLOCKED
                            </span>
                          )}
                        </div>

                        {hasRoomCredentials ? (
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-neutral-500 font-bold uppercase block">Room ID</span>
                                <span className="font-mono text-sm font-black text-white">{match?.roomId}</span>
                              </div>
                              <button
                                onClick={() => handleCopyRoom(reg.id, match?.roomId || '')}
                                className="p-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                              >
                                {copiedRoomId === reg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-neutral-500 font-bold uppercase block">Password</span>
                                <span className="font-mono text-sm font-black text-orange-400">{match?.roomPassword}</span>
                              </div>
                              <button
                                onClick={() => handleCopyPass(reg.id, match?.roomPassword || '')}
                                className="p-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                              >
                                {copiedPassword === reg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Room ID & Password will unlock 15 minutes before the match start time!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                        <span className="text-amber-400 font-bold block">Payment Under Verification:</span>
                        <p>Your UTR #{reg.utrNumber} is being verified by the POP referee team. Your slot will be confirmed shortly.</p>
                      </div>
                    )}

                    {/* Captain & Roster Preview */}
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800/60">
                      <span>IGN: <strong className="text-white">{reg.players[0]?.inGameName}</strong> (UID: {reg.players[0]?.gameUid})</span>
                      <button
                        onClick={() => handleOpenInvoice(reg)}
                        className="px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        View Pass & Invoice
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ORDER HISTORY & INVOICES TAB */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <span>My Tournament Orders & Payment Receipts</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Detailed transaction records, UTR verification status, and printable invoices
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search UTR / ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
              No matching orders found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-orange-400">{reg.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        reg.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : reg.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {reg.status}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {new Date(reg.createdAt).toLocaleDateString()} at {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate">{reg.matchTitle}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                      <span>UTR: <strong className="font-mono text-neutral-300">{reg.utrNumber}</strong></span>
                      <span>•</span>
                      <span>Payment Method: <strong className="text-neutral-300">{reg.paymentMethod || 'UPI / QR'}</strong></span>
                      <span>•</span>
                      <span>Captain: <strong className="text-neutral-200">{reg.captainName}</strong> ({reg.players[0]?.inGameName})</span>
                    </div>

                    {reg.adminNotes && (
                      <p className="text-xs text-neutral-300 italic pt-0.5">
                        Admin Note: {reg.adminNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                    <span className="text-lg font-black text-emerald-400">
                      ₹{reg.totalPayable}
                    </span>

                    <button
                      onClick={() => handleOpenInvoice(reg)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer border border-neutral-700"
                    >
                      <Receipt className="w-3.5 h-3.5 text-orange-400" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BOUNTY WINS & MATCH RESULTS HISTORY */}
      {activeTab === 'BOUNTY_HISTORY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>My Career Bounty Wins & Match Scorecards</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Prize money won from Booyah placement and verified per-kill bounties
              </p>
            </div>
            <span className="text-base font-black text-orange-400">
              Total Won: ₹{stats.totalWonAmount}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
              No completed match results recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block font-mono">{res.id}</span>
                      <h3 className="text-sm font-black text-white">{res.matchTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        Total Payout: ₹{res.totalPayout}
                      </span>
                    </div>
                  </div>

                  {/* Podium Winners */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">🏆 1st Champion</span>
                        <span className="font-black text-amber-400">₹{res.firstPlace.totalPrize}</span>
                      </div>
                      <p className="font-bold text-white">{res.firstPlace.teamOrPlayerName}</p>
                      <span className="text-[10px] text-neutral-400 block">{res.firstPlace.kills} Kills</span>
                    </div>

                    {res.secondPlace && (
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">🥈 2nd Place</span>
                          <span className="font-black text-neutral-200">₹{res.secondPlace.totalPrize}</span>
                        </div>
                        <p className="font-bold text-white">{res.secondPlace.teamOrPlayerName}</p>
                        <span className="text-[10px] text-neutral-400 block">{res.secondPlace.kills} Kills</span>
                      </div>
                    )}

                    {res.thirdPlace && (
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">🥉 3rd Place</span>
                          <span className="font-black text-neutral-200">₹{res.thirdPlace.totalPrize}</span>
                        </div>
                        <p className="font-bold text-white">{res.thirdPlace.teamOrPlayerName}</p>
                        <span className="text-[10px] text-neutral-400 block">{res.thirdPlace.kills} Kills</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. WITHDRAWAL STATUS TRACKER TAB */}
      {activeTab === 'PAYOUT_TRACKER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Instant Withdrawal & UPI Payout Progress Trackers</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Real-time 4-step live pipeline for all UPI and Bank account withdrawals
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
              ⚡ 15-Minute Guaranteed Payout
            </span>
          </div>

          {userWithdrawals.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
              No withdrawal requests submitted yet. Withdraw your winnings directly to your UPI ID or Bank account.
            </div>
          ) : (
            <div className="space-y-4">
              {userWithdrawals.map((w) => {
                const isCompleted = w.status === 'APPROVED';
                const isRejected = w.status === 'REJECTED';
                const isPending = w.status === 'PENDING';

                return (
                  <div
                    key={w.id}
                    className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 font-bold block">{w.id}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg font-black text-white">₹{w.amount}</span>
                          <span className="text-xs text-neutral-400">via {w.payoutMethod} ({w.upiId || w.bankDetails?.accountNumber || 'Direct Payout'})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isRejected
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse'
                        }`}>
                          {w.status === 'APPROVED' ? 'TRANSFERRED' : w.status}
                        </span>
                        <p className="text-[10px] font-mono text-neutral-500 mt-1">
                          {new Date(w.requestedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Visual 4-Step Pipeline Tracker */}
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      <div className="space-y-1">
                        <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 block">1. Submitted</span>
                      </div>

                      <div className="space-y-1">
                        <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 block">2. Referee Audit</span>
                      </div>

                      <div className="space-y-1">
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                          isCompleted ? 'bg-emerald-500 text-neutral-950' : 'bg-blue-500 text-white animate-pulse'
                        }`}>
                          {isCompleted ? '✓' : '3'}
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 block">3. Payout Sent</span>
                      </div>

                      <div className="space-y-1">
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                          isCompleted ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          {isCompleted ? '✓' : '4'}
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 block">4. UTR Cleared</span>
                      </div>
                    </div>

                    {/* Admin Transfer Proof / Note */}
                    {(w.adminRemarks || w.adminTransactionRef) && (
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                        <strong className="text-orange-400">Admin Transfer Reference: </strong> {w.adminTransactionRef || w.adminRemarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Official Invoice Modal */}
      {selectedRegForInvoice && (
        <MatchInvoiceModal
          registration={selectedRegForInvoice}
          match={matches.find((m) => m.id === selectedRegForInvoice.matchId)}
          onClose={() => setSelectedRegForInvoice(null)}
        />
      )}

    </div>
  );
};
