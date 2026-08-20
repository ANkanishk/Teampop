import React, { useState } from 'react';
import { 
  Gift, 
  Settings, 
  Users, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  Search, 
  Flame, 
  Share2,
  TrendingUp,
  AlertCircle,
  Award,
  RefreshCw
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

export const AdminReferralsManager: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    registeredUsers, 
    walletTransactions,
    referrals,
    manualRewardReferral,
    adminAdjustUserWallet
  } = useTournaments();

  const [referralReward, setReferralReward] = useState<number>(settings.referralRewardAmount ?? 25);
  const [signupBonus, setSignupBonus] = useState<number>(settings.signupBonusAmount ?? 20);
  const [unlockTarget, setUnlockTarget] = useState<number>(settings.bonusUnlockWinningTarget ?? 200);
  const [minDeposit, setMinDeposit] = useState<number>(settings.minDepositAmount ?? 20);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardingId, setRewardingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'SUCCESS' | 'ERROR' } | null>(null);

  // List all users who registered through a referral
  const referredUsers = registeredUsers.filter((u) => Boolean(u.referredBy));

  // Find all referral bonus transactions in ledger
  const referralTxs = walletTransactions.filter(
    (tx) => tx.type === 'REFERRAL_BONUS' || tx.description.toLowerCase().includes('referral')
  );
  const totalDisbursed = referralTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateSettings({
      referralRewardAmount: referralReward,
      signupBonusAmount: signupBonus,
      bonusUnlockWinningTarget: unlockTarget,
      minDepositAmount: minDeposit,
    });
    soundFx.playSuccess();
    setSaveSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApproveReward = async (refId: string) => {
    setRewardingId(refId);
    setActionMsg(null);
    try {
      const res = await manualRewardReferral(refId);
      if (res.success) {
        soundFx.playSuccess();
        setActionMsg({ text: res.message || 'Reward credited successfully!', type: 'SUCCESS' });
      } else {
        setActionMsg({ text: res.error || 'Failed to reward referral.', type: 'ERROR' });
      }
    } catch (e: any) {
      setActionMsg({ text: e.message || 'Error executing reward.', type: 'ERROR' });
    } finally {
      setRewardingId(null);
    }
  };

  const filteredReferredUsers = referredUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.referredBy?.toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-referrals-manager" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-400" />
            <span>Referral & Welcome Bonus Engine</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time tracking of all player referrals, reference code registrations, ₹20 signup bonuses, and reward approvals.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
          actionMsg.type === 'SUCCESS' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionMsg.text}</span>
          </div>
          <button 
            onClick={() => setActionMsg(null)}
            className="text-neutral-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Total Referred Users</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white">{referredUsers.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Active Referrals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {referrals.length > 0 ? referrals.length : referredUsers.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Total Referral Cash Paid</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">₹{totalDisbursed}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Active Reward Rate</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">₹{referralReward}</p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-400" />
            <span>Reward Economics & Payout Settings</span>
          </h3>
          {saveSuccess && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Referral Cash Reward (₹)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={referralReward}
                onChange={(e) => setReferralReward(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 block">
                Credited to referrer once friend joins or plays.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                1st-Time Signup Bonus (₹)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={signupBonus}
                onChange={(e) => setSignupBonus(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 block">
                Instant ₹20 bonus added to new user wallet.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Bonus Unlock Win Target (₹)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                value={unlockTarget}
                onChange={(e) => setUnlockTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 block">
                Target winnings (₹200+) to cashout ₹220 total.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Min Deposit Amount (₹)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 block">
                Minimum deposit required to qualify.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Reward Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Direct Referrals Log */}
      {referrals && referrals.length > 0 && (
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Referral Attribution & Reward Dispatch Log ({referrals.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Referrer (Inviter)</th>
                  <th className="pb-3 font-semibold">Referred Player</th>
                  <th className="pb-3 font-semibold">Reward</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-white block">{ref.referrerName}</span>
                        <span className="text-[11px] text-orange-400 font-mono">{ref.referrerPhone || ref.referrerUid}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-neutral-200 block">{ref.referredUserName}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{ref.referredUserPhone}</span>
                      </div>
                    </td>
                    <td className="py-3 font-extrabold text-amber-400">
                      ₹{ref.rewardAmount || referralReward}
                    </td>
                    <td className="py-3 text-neutral-400 font-mono text-[11px]">
                      {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3">
                      {ref.status === 'REWARDED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                          ✓ REWARDED
                        </span>
                      ) : ref.status === 'QUALIFIED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px] border border-cyan-500/30">
                          QUALIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                          REGISTERED
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {ref.status !== 'REWARDED' ? (
                        <button
                          onClick={() => handleApproveReward(ref.id)}
                          disabled={rewardingId === ref.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase transition cursor-pointer shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {rewardingId === ref.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Coins className="w-3 h-3" />}
                          <span>Credit ₹{ref.rewardAmount || referralReward}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Credited
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referral Tracking Table */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span>Referred Players Ledger ({referredUsers.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredReferredUsers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800 text-neutral-400">
            <p className="text-xs">No referral records match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">New Player</th>
                  <th className="pb-3 font-semibold">Referred By (Code/User)</th>
                  <th className="pb-3 font-semibold">Joined At</th>
                  <th className="pb-3 font-semibold">Activity Status</th>
                  <th className="pb-3 font-semibold">Referral Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredReferredUsers.map((user) => {
                  const isQualified = user.hasPlayedMatch || user.hasDeposited;
                  return (
                    <tr key={user.uid} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3">
                        <div>
                          <span className="font-bold text-white block">
                            {user.displayName || user.name || 'Gamer'}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {user.email || user.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-mono font-bold text-orange-400">
                        {user.referredBy}
                      </td>
                      <td className="py-3 text-neutral-400 font-mono">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3">
                        {user.hasPlayedMatch ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Played Tournament
                          </span>
                        ) : user.hasDeposited ? (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            Deposited Funds
                          </span>
                        ) : (
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Joined (Pending)
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {isQualified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 uppercase">
                            Reward Credited (₹{referralReward})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/30 uppercase">
                            Pending Match Play
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete User Referral Codes & Invite Directory */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>All Registered Players & Referral Codes Directory ({registeredUsers.length})</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Each user's unique reference code, referral counts, and accumulated earnings.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Player</th>
                <th className="pb-3 font-semibold">Their Referral Code</th>
                <th className="pb-3 font-semibold">Referred By</th>
                <th className="pb-3 font-semibold">Friends Invited</th>
                <th className="pb-3 font-semibold">Referral Earnings</th>
                <th className="pb-3 font-semibold text-right">Quick Wallet Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {registeredUsers.map((user) => {
                const userRefCode = user.referralCode || `POP${(user.phone || '').slice(-4) || user.uid.slice(-4)}`.toUpperCase();
                return (
                  <tr key={user.uid} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-white block">
                          {user.displayName || user.name || 'Gamer'}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {user.phone || user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-black text-xs">
                        <span>{userRefCode}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(userRefCode);
                            soundFx.playClick();
                            setActionMsg({ text: `Copied referral code ${userRefCode}!`, type: 'SUCCESS' });
                          }}
                          title="Copy Code"
                          className="hover:text-white transition cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[11px]">
                      {user.referredBy ? (
                        <span className="text-amber-400 font-bold">{user.referredBy}</span>
                      ) : (
                        <span className="text-neutral-500">Direct Signup</span>
                      )}
                    </td>
                    <td className="py-3 font-bold text-white">
                      {user.referralsCount || registeredUsers.filter(u => u.referredBy?.toUpperCase() === userRefCode || u.referredBy?.toUpperCase() === user.uid.toUpperCase()).length} Users
                    </td>
                    <td className="py-3 font-extrabold text-amber-400">
                      ₹{user.referralEarnings ?? 0}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={async () => {
                          const res = await adminAdjustUserWallet({
                            userId: user.uid,
                            userEmail: user.email,
                            userName: user.displayName,
                            amount: referralReward,
                            actionType: 'CREDIT',
                            category: 'BONUS',
                            description: `🎉 Admin Referral Bonus Reward for ${user.displayName}`,
                          });
                          if (res.success) {
                            soundFx.playSuccess();
                            setActionMsg({ text: `Credited ₹${referralReward} referral reward to ${user.displayName}!`, type: 'SUCCESS' });
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-white font-bold text-[11px] transition cursor-pointer border border-neutral-700 inline-flex items-center gap-1"
                      >
                        <Coins className="w-3 h-3" />
                        <span>+₹{referralReward}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
