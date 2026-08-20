import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { soundFx } from '../lib/soundEffects';

export const ReferralSection: React.FC = () => {
  const { 
    currentUser, 
    customUser, 
    settings, 
    walletTransactions,
    registeredUsers 
  } = useTournaments();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeUid = customUser?.uid || currentUser?.uid || '';
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();
  const displayName = customUser?.displayName || currentUser?.displayName || 'Player';

  // Generate a clean deterministic referral code based on user profile if not present
  const userRefCode = customUser?.referralCode || (
    displayName ? `${displayName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5)}${activeUid.slice(-3).toUpperCase()}` : `POP${activeUid.slice(-5).toUpperCase()}`
  );

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${encodeURIComponent(userRefCode)}` : `https://popgaming.in/?ref=${encodeURIComponent(userRefCode)}`;

  const rewardAmount = settings.referralRewardAmount ?? 25;
  const signupBonus = settings.signupBonusAmount ?? 20;
  const unlockTarget = settings.bonusUnlockWinningTarget ?? 200;

  // Find users referred by this player
  const myReferredUsers = registeredUsers.filter(
    (u) => u.referredBy && (
      u.referredBy.toLowerCase() === userRefCode.toLowerCase() ||
      u.referredBy.toLowerCase() === activeUid.toLowerCase() ||
      (activeEmail && u.referredBy.toLowerCase() === activeEmail)
    )
  );

  // Find referral earnings from transactions
  const referralTxs = walletTransactions.filter(
    (tx) => tx.userId === activeUid && (tx.type === 'REFERRAL_BONUS' || tx.description.toLowerCase().includes('referral'))
  );
  const totalEarned = referralTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRefCode);
    setCopiedCode(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    soundFx.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 *Play Free Fire Tournaments on POP Gaming & Win Real Cash!*\n\n` +
      `🎁 Register with my link and get *₹${signupBonus} Instant Welcome Bonus* on your 1st match!\n\n` +
      `👉 *Click here to join:* ${referralLink}\n\n` +
      `🔑 *My Referral Code:* ${userRefCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div id="referral-section" className="space-y-6 animate-in fade-in duration-200">
      {/* Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-orange-950/30 to-neutral-950 border border-orange-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-wider border border-orange-500/30">
            <Gift className="w-3.5 h-3.5" />
            <span>Refer & Earn Unlimited Cash</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Earn <span className="text-orange-400">₹{rewardAmount}</span> for every friend you refer!
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              Share your referral link with friends. They get a <span className="text-amber-400 font-bold">₹{signupBonus} Welcome Bonus</span> for their first match, and you receive <span className="text-emerald-400 font-bold">₹{rewardAmount} cash</span> in your wallet when they deposit or play their first tournament!
            </p>
          </div>

          {/* Referral Code & Share Link Controls */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Referral Code */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Your Unique Referral Code
              </span>
              <div className="flex items-center justify-between gap-2 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                <span className="font-mono text-lg font-black text-orange-400 tracking-wider px-1">
                  {userRefCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs font-bold transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Box 2: Quick Share Options */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Quick Share Link
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-bold transition cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-neutral-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Total Referred</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white">{myReferredUsers.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Qualified Friends</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {myReferredUsers.filter((u) => u.hasPlayedMatch || u.hasDeposited).length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Total Earned</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">₹{totalEarned}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-semibold">Per Referral Reward</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">₹{rewardAmount}</p>
        </div>
      </div>

      {/* How it Works Step by Step */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-400" />
          <span>How Referral & Welcome Bonus Works</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center border border-orange-500/30">
              1
            </span>
            <h4 className="text-xs font-bold text-white">Share Your Link</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Send your referral link or code to your Free Fire squad and gaming friends via WhatsApp, Telegram, or Instagram.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
              2
            </span>
            <h4 className="text-xs font-bold text-white">Friend Registers & Gets ₹{signupBonus}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your friend signs up and gets ₹{signupBonus} instant Welcome Bonus in their wallet to join their first match.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2 relative">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
              3
            </span>
            <h4 className="text-xs font-bold text-white">You Get ₹{rewardAmount} Cash</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Once your referred friend deposits funds or plays their first tournament, ₹{rewardAmount} is credited instantly to your wallet!
            </p>
          </div>
        </div>

        {/* Bonus Unlock Terms Note */}
        <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-200/90 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-orange-300">Welcome Bonus Rules:</strong> The ₹{signupBonus} signup bonus is added directly to wallet and can be used to pay match entry fees. To cash out this bonus, the player must deposit their own funds, play matches, and achieve ₹{unlockTarget}+ in match winnings (Total ₹{unlockTarget + signupBonus}+ withdrawable).
          </p>
        </div>
      </div>

      {/* Referred Friends Table */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span>Referred Players History ({myReferredUsers.length})</span>
          </h3>
        </div>

        {myReferredUsers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800 text-neutral-400 space-y-3">
            <Gift className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium">No referred friends yet</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Share your link above with friends to start earning ₹{rewardAmount} for every player who joins!
            </p>
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition shadow-lg shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Invite Friends on WhatsApp</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Player</th>
                  <th className="pb-3 font-semibold">Joined On</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold">Referral Status</th>
                  <th className="pb-3 font-semibold text-right">Your Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {myReferredUsers.map((friend) => {
                  const isQualified = friend.hasPlayedMatch || friend.hasDeposited;
                  return (
                    <tr key={friend.uid} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3 font-bold text-white">
                        {friend.displayName || friend.name || 'Gamer'}
                      </td>
                      <td className="py-3 text-neutral-400 font-mono">
                        {new Date(friend.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3">
                        {friend.hasPlayedMatch ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Played Match
                          </span>
                        ) : friend.hasDeposited ? (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            Deposited
                          </span>
                        ) : (
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Registered
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {isQualified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 uppercase">
                            Reward Credited
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/30 uppercase">
                            Waiting 1st Match
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-black">
                        {isQualified ? (
                          <span className="text-emerald-400">₹{rewardAmount}</span>
                        ) : (
                          <span className="text-neutral-500">₹0 (Pending)</span>
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
    </div>
  );
};
