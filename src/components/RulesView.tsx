import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ShieldAlert, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  ChevronDown, 
  Smartphone,
  AlertTriangle,
  FileText,
  Search,
  DollarSign,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PER_KILL_DEFAULTS } from '../data/tournamentData';

interface FaqItem {
  id: string;
  category: 'rewards' | 'rooms' | 'anticheat' | 'payments' | 'disputes';
  categoryLabel: string;
  question: string;
  answer: string;
  highlightBadge?: string;
  keyPoints?: string[];
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Layers, count: 12 },
  { id: 'rewards', label: 'Rewards & Bounties', icon: Trophy, count: 3 },
  { id: 'rooms', label: 'Room Access & Timing', icon: KeyRound, count: 2 },
  { id: 'anticheat', label: 'Fair Play & Anti-Cheat', icon: ShieldCheck, count: 2 },
  { id: 'payments', label: 'UPI Payouts & Wallet', icon: CreditCard, count: 3 },
  { id: 'disputes', label: 'Screenshots & Disputes', icon: Camera, count: 2 },
];

const ALL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'rewards',
    categoryLabel: 'Rewards & Bounties',
    question: 'How are Battle Royale placement rewards calculated?',
    highlightBadge: 'Booyah 2.0x',
    answer: 'In all Battle Royale Solo, Duo, and Squad tournaments, the entry fee pool is transparently multiplied based on placement:',
    keyPoints: [
      '1st Place (Booyah): 100% Entry Return + 100% Cash Bonus (2.0x Total Entry)',
      '2nd Place: 100% Entry Return + 30% Cash Bonus (1.3x Total Entry)',
      '3rd Place: 100% Entry Return + 20% Cash Bonus (1.2x Total Entry)',
      'All placement bonuses are credited on top of individual kill bounties.'
    ]
  },
  {
    id: 'faq-2',
    category: 'rewards',
    categoryLabel: 'Rewards & Bounties',
    question: 'How does the per-kill cash bounty work?',
    highlightBadge: '₹7 - ₹100 / Kill',
    answer: 'Every elimination you secure in Battle Royale rooms awards an instant cash bounty regardless of your final survival position.',
    keyPoints: [
      '₹20 Entry Room: ₹7 per confirmed elimination',
      '₹50 Entry Room: ₹17 per confirmed elimination',
      '₹100 Entry Room: ₹34 per confirmed elimination',
      '₹500+ High-Roller Rooms: ₹100 per confirmed elimination',
      'Kill bounties are calculated and paid directly from the official referee scorecard.'
    ]
  },
  {
    id: 'faq-3',
    category: 'rewards',
    categoryLabel: 'Rewards & Bounties',
    question: 'How do 1v1 Lone Wolf & Clash Squad Duels pay out?',
    highlightBadge: 'Winner Takes 1.8x',
    answer: 'In 1v1 Clash Squad and Lone Wolf duels, the winner takes 1.8x the total combined entry fee (e.g. ₹50 vs ₹50 = ₹90 winner prize). The remaining 10% is platform referee & server maintenance fee.',
    keyPoints: [
      'Fast 7-round or 9-round official tournament room settings.',
      'Headshots and clutch highlights can be submitted for weekly creator bonuses.'
    ]
  },
  {
    id: 'faq-4',
    category: 'rooms',
    categoryLabel: 'Room Access & Timing',
    question: 'When and where do I receive the Custom Room ID & Password?',
    highlightBadge: 'T-15 Mins Unlock',
    answer: 'Room credentials unlock automatically inside the "Track Match" modal on the homepage exactly 15 minutes before the match start time.',
    keyPoints: [
      'Only players whose payment UTR has been APPROVED by the referee will be able to view the Room ID & Password.',
      'A 1-tap "Copy Room ID" and "Copy Password" button is provided for quick Free Fire client paste.',
      'Room credentials will also be broadcast to registered team captains via WhatsApp.'
    ]
  },
  {
    id: 'faq-5',
    category: 'rooms',
    categoryLabel: 'Room Access & Timing',
    question: 'What happens if I enter the wrong slot or arrive late?',
    highlightBadge: 'Important',
    answer: 'Custom rooms start strictly on time. Players must enter the room and occupy their allocated squad slot at least 5 minutes prior to start time.',
    keyPoints: [
      'Sitting in another registered squad’s slot may result in a kick by the room referee.',
      'Late arrivals after match start cannot be refunded as the room slot is reserved.'
    ]
  },
  {
    id: 'faq-6',
    category: 'anticheat',
    categoryLabel: 'Fair Play & Anti-Cheat',
    question: 'Are PC / Emulator players allowed in tournaments?',
    highlightBadge: 'Mobile Only',
    answer: 'No. All standard POP Gaming daily tournaments are strictly mobile-only (iOS / Android phones and tablets).',
    keyPoints: [
      'Using BlueStacks, LDPlayer, MSI App Player, or external controllers is strictly prohibited.',
      'Emulator detection is enabled on all custom rooms; violations lead to permanent UID ban.'
    ]
  },
  {
    id: 'faq-7',
    category: 'anticheat',
    categoryLabel: 'Fair Play & Anti-Cheat',
    question: 'What is the penalty for teaming or third-party hacks?',
    highlightBadge: 'Zero Tolerance',
    answer: 'Official POP Gaming referees spectate and record all tournament rooms. We enforce a strict zero-tolerance policy against cheats and teaming.',
    keyPoints: [
      'Teaming in Solo/Duo matches results in immediate match disqualification and 30-day account blacklist.',
      'Aimbots, speed hacks, wall hacks, or modified OBB files lead to lifetime UID bans and legal reporting.',
      'Any prize money won during a fraudulent match is forfeited.'
    ]
  },
  {
    id: 'faq-8',
    category: 'payments',
    categoryLabel: 'UPI Payouts & Wallet',
    question: 'How fast are UPI winning prizes processed?',
    highlightBadge: '15 Mins Settlement',
    answer: 'Within 15 minutes of match conclusion, the official match referee validates end-game kill logs and processes direct payouts.',
    keyPoints: [
      'Prizes are transferred directly to your registered UPI ID (Google Pay, PhonePe, Paytm, BHIM, Cred).',
      'You can also opt to credit winnings directly to your POP Gaming Wallet for instant future match registration.',
      'Zero withdrawal fee on all tournament winnings.'
    ]
  },
  {
    id: 'faq-9',
    category: 'payments',
    categoryLabel: 'UPI Payouts & Wallet',
    question: 'How does UTR Payment Verification work for registration?',
    highlightBadge: 'Instant 1-Tap UPI',
    answer: 'When registering for any tournament, tap any of the 4 UPI Apps (POP, PhonePe, Paytm, Google Pay) or the Universal Phone UPI button to pre-fill the exact entry fee.',
    keyPoints: [
      'After completing payment in your UPI app, copy the 12-digit UTR / Reference ID.',
      'Paste the UTR number into the registration form and upload a screenshot.',
      'Admin approves valid transactions within 3–5 minutes.'
    ]
  },
  {
    id: 'faq-10',
    category: 'payments',
    categoryLabel: 'UPI Payouts & Wallet',
    question: 'What is the minimum withdrawal limit from POP Wallet?',
    highlightBadge: 'Min ₹50 Payout',
    answer: 'The minimum withdrawal limit is just ₹50. You can request a withdrawal anytime from your "Profile & Wallet" tab to receive instant funds via UPI or Bank Transfer.',
    keyPoints: [
      'Instant automated processing between 9:00 AM – 11:30 PM IST.',
      'Transaction receipt and UTR reference provided for every withdrawal.'
    ]
  },
  {
    id: 'faq-11',
    category: 'disputes',
    categoryLabel: 'Screenshots & Disputes',
    question: 'Why should I capture an end-of-match screenshot?',
    highlightBadge: 'Mandatory',
    answer: 'We strongly recommend all players take a screenshot of their final match stats screen showing placement and total eliminations.',
    keyPoints: [
      'In case of any kill dispute or tie, the screenshot serves as undeniable proof.',
      'For 1v1 Clash Squad duels, screen recording is recommended from round 1.'
    ]
  },
  {
    id: 'faq-12',
    category: 'disputes',
    categoryLabel: 'Screenshots & Disputes',
    question: 'How do I raise a dispute or contact the referee?',
    highlightBadge: '10-Min Window',
    answer: 'Disputes must be reported within 10 minutes of match completion via the official WhatsApp Support Desk or Track Match tab.',
    keyPoints: [
      'Provide your Match Code, Registered Game UID, and clear screenshot/video proof.',
      'Referees review spectator replays and resolve disputes within 20 minutes.'
    ]
  }
];

export const RulesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set(['faq-1', 'faq-4', 'faq-8']));
  
  // Interactive Calculator State
  const [calcEntryFee, setCalcEntryFee] = useState<number>(50);
  const [calcKills, setCalcKills] = useState<number>(3);

  const entrySlabs = [20, 40, 50, 100, 200, 300, 400, 500, 600, 1000, 1500];

  const handleToggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenFaqIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const handleCollapseAll = () => {
    setOpenFaqIds(new Set());
  };

  const filteredFaqs = useMemo(() => {
    return ALL_FAQS.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        faq.question.toLowerCase().includes(q) || 
        faq.answer.toLowerCase().includes(q) ||
        faq.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Calculator calculations
  const perKillBounty = PER_KILL_DEFAULTS[calcEntryFee] || Math.round(calcEntryFee * 0.35);
  const booyahPlacement = Math.round(calcEntryFee * 2.0);
  const secondPlacement = Math.round(calcEntryFee * 1.3);
  const thirdPlacement = Math.round(calcEntryFee * 1.2);
  const totalKillPrize = calcKills * perKillBounty;
  const totalBooyahTakeaway = booyahPlacement + totalKillPrize;

  return (
    <div id="rules-view" className="space-y-10 pb-20">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/40 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Official Esports Rulebook & Knowledge Base
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              Fair Play Verified 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
            Tournament Rules, Mathematical Formulas & FAQ
          </h1>
          
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Everything you need to know about Free Fire MAX prize calculations, per-kill bounties, room credential releases, and zero-tolerance anti-cheat protocols.
          </p>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </motion.div>

      {/* Interactive Live Prize & Bounty Calculator Simulator */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Interactive Prize & Bounty Calculator</span>
                <span className="text-[10px] bg-orange-500 text-black font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Live Preview
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Select your match entry fee and estimated kills to calculate your total estimated earnings.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">
                1. Select Match Entry Fee (₹)
              </label>
              <div className="flex flex-wrap gap-2">
                {entrySlabs.map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => setCalcEntryFee(fee)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                      calcEntryFee === fee
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105 border border-orange-400'
                        : 'bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    ₹{fee}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-300">
                  2. Estimated Eliminations (Kills)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcKills(Math.max(0, calcKills - 1))}
                    className="p-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-orange-400 text-sm w-6 text-center">
                    {calcKills}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalcKills(Math.min(25, calcKills + 1))}
                    className="p-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={calcKills}
                onChange={(e) => setCalcKills(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>0 kills</span>
                <span>5 kills</span>
                <span>10 kills</span>
                <span>15 kills</span>
                <span>20 kills</span>
              </div>
            </div>
          </div>

          {/* Results Outcome Card */}
          <div className="lg:col-span-5 bg-neutral-950 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">Kill Bounty Rate:</span>
                <span className="font-mono font-extrabold text-orange-400 text-sm">
                  +₹{perKillBounty} / kill
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">Total Kill Bounty ({calcKills} kills):</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{totalKillPrize}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-800 pt-2 text-xs">
                <span className="text-neutral-400">2nd Place Total (1.3x + Kills):</span>
                <span className="font-mono font-bold text-neutral-200">₹{secondPlacement + totalKillPrize}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">3rd Place Total (1.2x + Kills):</span>
                <span className="font-mono font-bold text-neutral-200">₹{thirdPlacement + totalKillPrize}</span>
              </div>
            </div>

            {/* Highlighted Booyah Takeaway */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/40 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                👑 1st Place (Booyah) Total Takeaway
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center justify-center gap-1">
                <span>₹{totalBooyahTakeaway}</span>
                <span className="text-xs text-emerald-400 font-bold font-sans">
                  ({((totalBooyahTakeaway / calcEntryFee) * 100).toFixed(0)}% ROI)
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Placement: ₹{booyahPlacement} (2.0x) + Kills Bounty: ₹{totalKillPrize}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Official Slabs Table (Expandable / Scrollable) */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-400" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Official Battle Royale Reward Multipliers Table
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            Placement Reward + (Eliminations × Rate)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-bold uppercase">
                <th className="p-3">Entry Fee</th>
                <th className="p-3 text-emerald-400">1st Place (2.0x)</th>
                <th className="p-3 text-neutral-300">2nd Place (1.3x)</th>
                <th className="p-3 text-neutral-300">3rd Place (1.2x)</th>
                <th className="p-3 text-orange-400">Per-Kill Bounty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
              {entrySlabs.map((fee) => {
                const first = Math.round(fee * 2.0);
                const second = Math.round(fee * 1.3);
                const third = Math.round(fee * 1.2);
                const kill = PER_KILL_DEFAULTS[fee] || 100;
                return (
                  <tr key={fee} className="hover:bg-neutral-800/40 transition">
                    <td className="p-3 font-black text-white">₹{fee}</td>
                    <td className="p-3 text-emerald-400 font-bold">₹{first}</td>
                    <td className="p-3 text-neutral-200">₹{second}</td>
                    <td className="p-3 text-neutral-200">₹{third}</td>
                    <td className="p-3 text-orange-400 font-extrabold">+₹{kill} / kill</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fair Play & Anti-Cheat Code of Conduct Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-black text-white uppercase">
              Zero Tolerance Violations (Instant Ban)
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">Teaming in Solo / Duo:</strong> Disqualification of all colluding participants and forfeiture of any earned kill prize.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">PC Emulators & External Tools:</strong> Strict mobile-only rooms. Hardware & UID blacklist for BlueStacks, LDPlayer, and macro tools.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">Fake UTR / Payment Receipts:</strong> Immediate permanent ban across all POP Gaming tournament seasons.
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white uppercase">
              Proof & Recording Guidelines
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">End-of-Match Screenshot:</strong> Always capture your final in-game stats screen displaying kills and placement rank.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">1v1 Clash Squad Recordings:</strong> Full screen recordings are encouraged to resolve round-by-round disputes instantly.
              </span>
            </li>
            <li className="flex items-start gap-2.5 bg-neutral-950 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">10-Minute Dispute Window:</strong> WhatsApp referee desk is active 24/7 for fast match log investigations.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CATEGORIZED FAQ ACCORDION SECTION (MOBILE-FIRST REFACTORED) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Frequently Asked Questions (FAQ)
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Filter by category or search key terms to find instant answers for mobile players.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. room password, per-kill bounty, UPI refund, emulator ban, timing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Chips Carousel / Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List with Motion Animations */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-sm font-bold text-white">No questions found matching "{searchQuery}"</p>
              <p className="text-xs text-neutral-500">Try searching for keywords like "bounty", "password", or "UPI".</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIds.has(faq.id);

              return (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'bg-neutral-950 border-orange-500/50 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/30'
                      : 'bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-950'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 text-orange-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/50 transition">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            {faq.categoryLabel}
                          </span>
                          {faq.highlightBadge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                              {faq.highlightBadge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-orange-400 transition leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                        isOpen ? 'bg-orange-500/20 text-orange-400' : 'bg-neutral-900 text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 text-xs text-neutral-300 border-t border-neutral-900 space-y-3 leading-relaxed">
                          <p className="font-medium text-neutral-200">{faq.answer}</p>
                          
                          {faq.keyPoints && faq.keyPoints.length > 0 && (
                            <ul className="space-y-1.5 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800/80">
                              {faq.keyPoints.map((point, ptIdx) => (
                                <li key={ptIdx} className="flex items-start gap-2 text-neutral-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Support Helpline Footer */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-black text-white">Still have a specific query or need help?</h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            Our referee desk and player support team are available on WhatsApp 24/7.
          </p>
        </div>
        <a
          href="https://wa.me/919999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 flex-shrink-0 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
