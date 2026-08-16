import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Send, 
  User, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  History,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { WalletTransactionType } from '../types';

export const AdminUserWalletsManager: React.FC = () => {
  const { 
    walletTransactions, 
    registrations, 
    withdrawals, 
    registeredUsers,
    adminAdjustUserWallet 
  } = useTournaments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserUid, setSelectedUserUid] = useState('');
  
  // Modal / Form state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustType, setAdjustType] = useState<WalletTransactionType>('ADMIN_CREDIT');
  const [adjustReason, setAdjustReason] = useState('Special Tournament Bonus / Verification Credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Extract unique players from registrations and wallet transactions
  const userMap = new Map<string, {
    email: string;
    name: string;
    phone: string;
    gameUid: string;
    totalDeposits: number;
    totalWinnings: number;
    totalWithdrawn: number;
    adjustmentCount: number;
  }>();

  // Add all registered player accounts
  registeredUsers.forEach((user) => {
    const email = (user.email || '').toLowerCase();
    if (!email) return;
    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        name: user.displayName || user.name || 'Player',
        phone: user.phone || '',
        gameUid: user.gameUid || '',
        totalDeposits: 0,
        totalWinnings: 0,
        totalWithdrawn: 0,
        adjustmentCount: 0,
      });
    }
  });

  // Add players from registrations
  registrations.forEach((r) => {
    const email = (r.captainEmail || `${r.captainPhone}@popgaming.com`).toLowerCase();
    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        name: r.captainName || 'Player',
        phone: r.captainPhone || '',
        gameUid: r.players?.[0]?.gameUid || r.captainName || '',
        totalDeposits: 0,
        totalWinnings: 0,
        totalWithdrawn: 0,
        adjustmentCount: 0,
      });
    }
    const u = userMap.get(email)!;
    if (r.status === 'APPROVED') {
      u.totalDeposits += r.entryFee;
    }
  });

  // Add info from wallet transactions
  walletTransactions.forEach((tx) => {
    const email = (tx.userEmail || '').toLowerCase();
    if (!email) return;
    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        name: tx.userName || 'Player',
        phone: '',
        gameUid: '',
        totalDeposits: 0,
        totalWinnings: 0,
        totalWithdrawn: 0,
        adjustmentCount: 0,
      });
    }
    const u = userMap.get(email)!;
    if (tx.type === 'PRIZE_WON' || tx.type === 'BONUS') {
      u.totalWinnings += tx.amount;
    } else if (tx.type === 'DEPOSIT') {
      u.totalDeposits += tx.amount;
    } else if (tx.type === 'ADMIN_CREDIT') {
      u.totalWinnings += tx.amount;
      u.adjustmentCount += 1;
    } else if (tx.type === 'ADMIN_DEBIT' || tx.type === 'PENALTY') {
      u.totalWinnings = Math.max(0, u.totalWinnings - tx.amount);
      u.adjustmentCount += 1;
    }
  });

  // Add info from withdrawals
  withdrawals.forEach((w) => {
    const email = (w.userEmail || '').toLowerCase();
    if (userMap.has(email) && (w.status === 'PROCESSED' || w.status === 'APPROVED')) {
      userMap.get(email)!.totalWithdrawn += w.amount;
    }
  });

  const usersList = Array.from(userMap.values());

  const filteredUsers = usersList.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.gameUid.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjust = (email: string, name: string, gameUid: string) => {
    setSelectedUserEmail(email);
    setSelectedUserName(name);
    setSelectedUserUid(gameUid);
    setAdjustAmount('100');
    setAdjustType('ADMIN_CREDIT');
    setAdjustReason('Admin Verification / Balance Update');
    setShowAdjustModal(true);
    setActionSuccess(null);
    setActionError(null);
  };

  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail) {
      setActionError('User email or identifier is required.');
      return;
    }

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Please enter a valid amount greater than 0.');
      return;
    }

    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    const isDebit = adjustType === 'ADMIN_DEBIT' || adjustType === 'PENALTY';
    const categoryType: 'PRIZE_WON' | 'DEPOSIT' | 'BONUS' | 'MANUAL_ADJUSTMENT' | 'PENALTY' = 
      adjustType === 'BONUS' ? 'BONUS' : adjustType === 'PENALTY' ? 'PENALTY' : 'MANUAL_ADJUSTMENT';

    const res = await adminAdjustUserWallet({
      userId: selectedUserEmail,
      userEmail: selectedUserEmail,
      userName: selectedUserName || 'Esports Player',
      amount: amt,
      actionType: isDebit ? 'DEBIT' : 'CREDIT',
      category: categoryType,
      description: adjustReason.trim() || 'Admin manual balance adjustment',
    });

    setIsProcessing(false);

    if (res.success) {
      setActionSuccess(`Successfully updated ${selectedUserEmail} wallet (+/- ₹${amt}). Instant confirmation email sent to user and admin!`);
      setTimeout(() => {
        setShowAdjustModal(false);
        setActionSuccess(null);
      }, 2500);
    } else {
      setActionError(res.message || 'Failed to update user wallet.');
    }
  };

  return (
    <div id="admin-user-wallets-manager" className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Active Esports Players</span>
            <div className="text-2xl font-black text-white">{usersList.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Hourly Withdrawal Limit</span>
            <div className="text-2xl font-black text-amber-400">₹500 / Hr</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Deposit Limit Per Tx</span>
            <div className="text-2xl font-black text-emerald-400">₹1,000</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Total Wallet Adjustments</span>
            <div className="text-2xl font-black text-cyan-400">
              {walletTransactions.filter(t => t.type === 'ADMIN_CREDIT' || t.type === 'ADMIN_DEBIT' || t.type === 'MANUAL_ADJUSTMENT' || t.type === 'BONUS').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Player Name, Email, Phone, or Free Fire UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          onClick={() => {
            setSelectedUserEmail('');
            setSelectedUserName('');
            setSelectedUserUid('');
            setShowAdjustModal(true);
            setActionSuccess(null);
            setActionError(null);
          }}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Balance Update</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-orange-400" />
            <span>Registered Players & Wallet Status</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Showing {filteredUsers.length} players
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-2">
            <User className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold text-neutral-400">No players found</p>
            <p className="text-xs">Try searching with a different keyword or create a manual transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 font-black uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Player / Account</th>
                  <th className="p-3.5">Game UID</th>
                  <th className="p-3.5 text-right">Total Deposits</th>
                  <th className="p-3.5 text-right">Winnings Balance</th>
                  <th className="p-3.5 text-right">Cashout Paid</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-medium">
                {filteredUsers.map((u) => {
                  const netBalance = u.totalWinnings + u.totalDeposits - u.totalWithdrawn;
                  return (
                    <tr key={u.email} className="hover:bg-neutral-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{u.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-neutral-500">{u.phone}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 font-mono text-orange-400 font-bold">
                          {u.gameUid || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-cyan-400">
                        ₹{u.totalDeposits}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        ₹{u.totalWinnings}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                        ₹{u.totalWithdrawn}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenAdjust(u.email, u.name, u.gameUid)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/30 text-orange-400 font-bold text-xs border border-orange-500/30 transition cursor-pointer"
                        >
                          Adjust Balance
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Ledger History */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-orange-400" />
          <span>Real-Time Wallet Transactions & Audit Trail</span>
        </h3>

        {walletTransactions.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">No wallet audit records yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {walletTransactions.slice(0, 15).map((tx) => (
              <div 
                key={tx.id} 
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      tx.type === 'PRIZE_WON' || tx.type === 'ADMIN_CREDIT' || tx.type === 'BONUS'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tx.type === 'DEPOSIT'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="font-bold text-white">{tx.userName || tx.userEmail || 'Player'}</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">{tx.description}</p>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-black text-sm ${
                    tx.type === 'PRIZE_WON' || tx.type === 'ADMIN_CREDIT' || tx.type === 'BONUS' || tx.type === 'DEPOSIT'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {tx.type === 'PRIZE_WON' || tx.type === 'ADMIN_CREDIT' || tx.type === 'BONUS' || tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADJUST WALLET MODAL */}
      {showAdjustModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdjustModal(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
            <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Update Player Wallet</h3>
                    <p className="text-xs text-neutral-400">Direct Admin Balance Modification</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {actionSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-bold">{actionSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleExecuteAdjustment} className="space-y-4">
                  {actionError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Target User Email / Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. player@gmail.com or 9876543210@popgaming.com"
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Adjustment Action</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as WalletTransactionType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                    >
                      <option value="ADMIN_CREDIT">➕ Credit Cash / Winnings Balance</option>
                      <option value="BONUS">🎁 Bonus Reward Credit</option>
                      <option value="ADMIN_DEBIT">➖ Debit / Deduct Balance</option>
                      <option value="PENALTY">⚠️ Fairplay Violation Penalty</option>
                      <option value="MANUAL_ADJUSTMENT">🔧 Correction Adjustment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Remarks / Reason (Emailed to user)</label>
                    <textarea
                      rows={2}
                      required
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="e.g. Tournament Match #101 Kill Bounties credited by Admin"
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>An instant email alert will be automatically dispatched to the user and admin.</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdjustModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-600/20 disabled:opacity-50"
                    >
                      {isProcessing ? 'Updating...' : 'Confirm & Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
