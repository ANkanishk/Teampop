import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  QrCode, 
  Copy, 
  Check, 
  Building2, 
  Smartphone, 
  IndianRupee, 
  Trophy, 
  History, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

export const WalletSection: React.FC = () => {
  const { 
    currentUser, 
    customUser,
    settings, 
    withdrawals, 
    walletTransactions, 
    registrations, 
    results, 
    requestWithdrawal, 
    submitDirectDeposit,
    getHourlyWithdrawalUsage,
    getUserWalletStats 
  } = useTournaments();

  const [activeTab, setActiveTab] = useState<'WITHDRAWALS' | 'DEPOSITS' | 'WINNINGS' | 'ALL_TXS'>('WITHDRAWALS');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const activeUid = customUser?.uid || currentUser?.uid;
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('150');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolderName: customUser?.name || currentUser?.displayName || '',
    bankName: '',
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Quick Deposit Form State
  const [depositUtr, setDepositUtr] = useState('');
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const stats = getUserWalletStats();
  const hourlyWithdrawalStats = getHourlyWithdrawalUsage();

  const userWithdrawals = withdrawals.filter(
    (w) =>
      (activeUid && w.userId === activeUid) ||
      (activeEmail && w.userEmail?.toLowerCase() === activeEmail)
  );

  const userRegistrations = registrations.filter(
    (r) =>
      (activeUid && r.userId === activeUid) ||
      (activeEmail && r.captainEmail?.toLowerCase() === activeEmail)
  );

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId || 'wepopearn@oksbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawLoading(true);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 50) {
      setWithdrawError('Minimum withdrawal amount is ₹50.');
      setWithdrawLoading(false);
      return;
    }

    if (amountNum > 500) {
      setWithdrawError('Maximum withdrawal per request is ₹500 (1-hour limit: ₹500).');
      setWithdrawLoading(false);
      return;
    }

    if (hourlyWithdrawalStats.usedAmount + amountNum > hourlyWithdrawalStats.maxHourlyLimit) {
      setWithdrawError(
        `Hourly limit exceeded! You have already withdrawn ₹${hourlyWithdrawalStats.usedAmount} in the last 1 hour. Remaining limit: ₹${hourlyWithdrawalStats.remainingLimit}.`
      );
      setWithdrawLoading(false);
      return;
    }

    if (amountNum > stats.winningsBalance) {
      setWithdrawError(`Amount exceeds available winnings balance (₹${stats.winningsBalance}).`);
      setWithdrawLoading(false);
      return;
    }

    if (payoutMethod === 'BANK_TRANSFER') {
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        setWithdrawError('Account numbers do not match.');
        setWithdrawLoading(false);
        return;
      }
    }

    const res = await requestWithdrawal({
      amount: amountNum,
      payoutMethod,
      upiId: payoutMethod === 'UPI' ? upiId : undefined,
      bankDetails: payoutMethod === 'BANK_TRANSFER' ? bankDetails : undefined,
    });

    setWithdrawLoading(false);

    if (res.success) {
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
      }, 2000);
    } else {
      setWithdrawError(res.error || 'Failed to submit withdrawal request.');
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setDepositLoading(true);

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 10) {
      setDepositError('Minimum deposit is ₹10.');
      setDepositLoading(false);
      return;
    }
    if (amt > 1000) {
      setDepositError('Maximum deposit is ₹1,000 per transaction.');
      setDepositLoading(false);
      return;
    }
    if (!depositUtr || depositUtr.trim().length < 8) {
      setDepositError('Please enter a valid 12-digit UTR number from your payment app.');
      setDepositLoading(false);
      return;
    }

    const res = await submitDirectDeposit({
      amount: amt,
      utrNumber: depositUtr.trim(),
      note: 'Match Credit Top-up',
    });

    setDepositLoading(false);
    if (res.success) {
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setDepositModalOpen(false);
        setDepositUtr('');
      }, 2000);
    } else {
      setDepositError(res.error || 'Failed to submit deposit.');
    }
  };

  return (
    <div id="wallet-section-container" className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 sm:p-8 shadow-2xl">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                POP Gaming Esports Wallet
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                100% SECURE & VERIFIED
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                ₹{stats.totalBalance}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-400">
                Total Wallet Value
              </span>
            </div>

            <p className="text-xs text-neutral-400 max-w-md">
              Tournament winnings can be withdrawn directly to your UPI / Bank Account. Deposits are credited towards match entry passes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <button
              id="btn-open-withdraw-modal"
              onClick={() => setWithdrawModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Winnings</span>
            </button>

            <button
              id="btn-open-deposit-modal"
              onClick={() => setDepositModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm border border-neutral-700 transition cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Deposit / Top-up</span>
            </button>
          </div>
        </div>

        {/* Breakdown Sub-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-neutral-800/80">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                Available Winnings (Cashout)
              </span>
              <span className="text-xl font-black text-emerald-400">
                ₹{stats.winningsBalance}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                Pending Withdrawals
              </span>
              <span className="text-xl font-black text-amber-400">
                ₹{stats.pendingWithdrawalsAmount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">
                Total Match Deposits Paid
              </span>
              <span className="text-xl font-black text-cyan-400">
                ₹{stats.depositBalance}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet History Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-withdrawals"
              onClick={() => setActiveTab('WITHDRAWALS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'WITHDRAWALS'
                  ? 'bg-neutral-800 text-orange-400 border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdrawals ({userWithdrawals.length})</span>
            </button>

            <button
              id="tab-deposits"
              onClick={() => setActiveTab('DEPOSITS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DEPOSITS'
                  ? 'bg-neutral-800 text-orange-400 border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Match Deposits ({userRegistrations.length})</span>
            </button>

            <button
              id="tab-winnings"
              onClick={() => setActiveTab('WINNINGS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'WINNINGS'
                  ? 'bg-neutral-800 text-orange-400 border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Tournament Rewards</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline-block">
            Auto-synced with POP Gaming Ledger
          </span>
        </div>

        {/* Tab 1: Withdrawals List */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="space-y-3">
            {userWithdrawals.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-3">
                <ArrowUpRight className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-sm font-semibold text-neutral-300">No withdrawal requests yet</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Win tournament rooms to earn cash prizes and request instant transfers to your UPI or Bank.
                </p>
              </div>
            ) : (
              userWithdrawals.map((wth) => (
                <div
                  key={wth.id}
                  id={`withdrawal-item-${wth.id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-orange-400">{wth.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          wth.status === 'PROCESSED' || wth.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : wth.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {wth.status === 'PROCESSED' ? 'TRANSFERRED / PAID' : wth.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-neutral-200">
                      <span>Payout to:</span>
                      {wth.payoutMethod === 'UPI' ? (
                        <span className="font-mono font-bold text-white flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                          {wth.upiId}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          {wth.bankDetails?.accountHolderName} ({wth.bankDetails?.accountNumber?.slice(-4)} IFSC: {wth.bankDetails?.ifscCode})
                        </span>
                      )}
                    </div>

                    {wth.adminTransactionRef && (
                      <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ref / UTR: {wth.adminTransactionRef}
                      </p>
                    )}

                    {wth.adminRemarks && (
                      <p className="text-xs text-neutral-400 italic">
                        Note: {wth.adminRemarks}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-end sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                    <span className="text-xl font-black text-white">
                      ₹{wth.amount}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(wth.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Deposits (Match Registrations) */}
        {activeTab === 'DEPOSITS' && (
          <div className="space-y-3">
            {userRegistrations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
                No match entry deposits found. Join a tournament room to register.
              </div>
            ) : (
              userRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-orange-400">{reg.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          reg.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : reg.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {reg.status === 'APPROVED' ? 'SLOT VERIFIED' : reg.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{reg.matchTitle}</p>
                    <p className="text-xs text-neutral-400">
                      Payment via UPI • UTR: <span className="font-mono text-neutral-300 font-bold">{reg.utrNumber}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-cyan-400 block">
                      -₹{reg.entryFee}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Tournament Rewards */}
        {activeTab === 'WINNINGS' && (
          <div className="space-y-3">
            {walletTransactions.filter((tx) => tx.type === 'PRIZE_WON').length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-amber-500/40" />
                <p className="text-sm font-semibold text-neutral-300">No tournament prizes credited yet</p>
                <p className="text-xs text-neutral-500">
                  When admins publish match results with your UID, placement & kill rewards will appear here instantly!
                </p>
              </div>
            ) : (
              walletTransactions
                .filter((tx) => tx.type === 'PRIZE_WON')
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> BOOYAH REWARD
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{tx.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-400 block">
                        +₹{tx.amount}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase">
                        CREDITED TO WALLET
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWithdrawModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
            <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">Withdraw Tournament Winnings</h3>
                    <p className="text-xs text-neutral-400">
                      Available balance: <span className="font-bold text-emerald-400 font-mono">₹{stats.winningsBalance}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawModalOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">Withdrawal Request Submitted!</h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Our admin team will verify and transfer ₹{withdrawAmount} via {payoutMethod} within 15 to 30 minutes. You will receive an in-app confirmation notification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    Withdrawal Amount (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="number"
                      required
                      min={50}
                      max={stats.winningsBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold text-base focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Quick Select Chips */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[50, 100, 150, 200, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt.toString())}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 cursor-pointer"
                      >
                        ₹{amt}
                      </button>
                    ))}
                    {stats.winningsBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(stats.winningsBalance.toString())}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono cursor-pointer"
                      >
                        MAX (₹{stats.winningsBalance})
                      </button>
                    )}
                  </div>
                </div>

                {/* Payout Method Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Payout Transfer Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('UPI')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition ${
                        payoutMethod === 'UPI'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Instant UPI ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('BANK_TRANSFER')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition ${
                        payoutMethod === 'BANK_TRANSFER'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Bank Account</span>
                    </button>
                  </div>
                </div>

                {/* UPI ID Input */}
                {payoutMethod === 'UPI' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">
                      Your UPI ID (GPay / PhonePe / Paytm / BHIM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210@paytm or yourname@oksbi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-[11px] text-neutral-500">
                      Payment is sent directly to this UPI address via IMPS.
                    </p>
                  </div>
                )}

                {/* Bank Details Inputs */}
                {payoutMethod === 'BANK_TRANSFER' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Account Holder Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="As per bank passbook"
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block mb-1">
                          Account Number
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Bank A/C Number"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block mb-1">
                          Confirm A/C Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Re-enter A/C Number"
                          value={bankDetails.confirmAccountNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block mb-1">
                        Bank IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SBIN0001234"
                        value={bankDetails.ifscCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-400" /> Hourly Withdrawal Limit
                    </span>
                    <span className="font-mono font-bold text-white">
                      ₹{hourlyWithdrawalStats.usedAmount} / ₹{hourlyWithdrawalStats.maxHourlyLimit}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${hourlyWithdrawalStats.remainingLimit === 0 ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(100, (hourlyWithdrawalStats.usedAmount / hourlyWithdrawalStats.maxHourlyLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Remaining limit for this hour: <strong className="text-emerald-400">₹{hourlyWithdrawalStats.remainingLimit}</strong> (Max ₹500 allowed every 60 minutes).
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={withdrawLoading || stats.winningsBalance < 50 || hourlyWithdrawalStats.remainingLimit === 0}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition cursor-pointer disabled:opacity-50"
                  >
                    {withdrawLoading ? 'Submitting...' : 'Submit Withdrawal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </div>
      )}

      {/* TOP-UP / QUICK DEPOSIT MODAL */}
      {depositModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDepositModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
            <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-5 sm:p-8 shadow-2xl space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Deposit Match Credits</h3>
                    <p className="text-xs text-neutral-400">Scan official POP Gaming UPI QR</p>
                  </div>
                </div>
                <button
                  onClick={() => setDepositModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {depositSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-white">Deposit Submitted Successfully!</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    ₹{depositAmount} has been credited to your match deposit balance. Verification alert has been dispatched to admin.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  {depositError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{depositError}</span>
                    </div>
                  )}

                  {/* QR Image Box */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
                    <img
                      src={settings.qrCodeImageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'}
                      alt="UPI Payment QR"
                      className="w-44 h-44 object-cover mx-auto rounded-xl border border-neutral-700 shadow-lg"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-xs font-black text-orange-400">
                        {settings.upiId || 'wepopearn@oksbi'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Name: <span className="text-white font-bold">{settings.upiName || 'POP Gaming Esports'}</span>
                    </p>
                  </div>

                  {/* Deposit Amount Input with max 1000 limit */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300">Deposit Amount (₹)</label>
                      <span className="text-[11px] text-amber-400 font-bold">Max Limit: ₹1,000</span>
                    </div>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="number"
                        required
                        min={10}
                        max={1000}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono font-bold text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[50, 100, 200, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt.toString())}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 cursor-pointer"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">12-Digit UPI UTR / Ref Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 429104829104"
                      value={depositUtr}
                      onChange={(e) => setDepositUtr(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={depositLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {depositLoading ? 'Verifying...' : 'Submit Deposit Payment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
