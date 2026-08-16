import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Users, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  Gamepad2,
  DollarSign,
  TrendingUp,
  Award,
  Send,
  ExternalLink,
  LogIn,
  User,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTournaments } from '../context/TournamentContext';
import { INITIAL_SLIDES, GAME_MODES, getPerKillReward, calculateBRPlacementRewards } from '../data/tournamentData';
import { Match, GameModeId } from '../types';
import { PromoCarousel } from './PromoCarousel';
import { TopKillersWidget } from './TopKillersWidget';

interface HomeViewProps {
  onSelectMatch: (match: Match) => void;
  onSelectMode: (modeId: GameModeId) => void;
  onNavigateTab: (tab: string) => void;
  onOpenLoginModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectMatch,
  onSelectMode,
  onNavigateTab,
  onOpenLoginModal,
}) => {
  const { matches, settings, customUser, currentUser, isAdmin, getUserWalletStats } = useTournaments();
  const walletStats = getUserWalletStats();
  const heroSlides = settings.heroSlides && settings.heroSlides.length > 0
    ? settings.heroSlides
    : INITIAL_SLIDES;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<'ALL' | 'SOLO' | 'SQUAD' | 'CLASH' | 'CHEAP'>('ALL');

  // Handle promo banner action
  const handleSelectPromoMatch = (gameMode: GameModeId, entryFee: number, title: string) => {
    const matching = matches.find((m) => m.gameMode === gameMode) || matches[0];
    if (matching) {
      onSelectMatch({
        ...matching,
        title: title,
        entryFee: entryFee,
      });
    }
  };

  // Auto rotate hero slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlideIndex = currentSlideIndex < heroSlides.length ? currentSlideIndex : 0;
  const currentSlide = heroSlides[activeSlideIndex] || heroSlides[0];

  // Filter featured & active matches
  const activeMatches = matches.filter(
    (m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
  );

  const filteredMatches = activeMatches.filter((m) => {
    if (selectedQuickFilter === 'SOLO') return m.gameMode.toLowerCase().includes('solo');
    if (selectedQuickFilter === 'SQUAD') return m.gameMode.toLowerCase().includes('squad') || m.gameMode.toLowerCase().includes('duo');
    if (selectedQuickFilter === 'CLASH') return m.gameMode.toLowerCase().includes('cs') || m.gameMode.toLowerCase().includes('wolf') || m.gameMode.toLowerCase().includes('1v1');
    if (selectedQuickFilter === 'CHEAP') return m.entryFee <= 50;
    return true;
  });

  const isLoggedIn = Boolean(currentUser || customUser);
  const playerName = customUser?.name || currentUser?.displayName || 'Player';
  const playerUid = customUser?.gameUid || 'N/A';

  return (
    <div id="home-view" className="space-y-8 sm:space-y-12 pb-16">
      {/* Dedicated Player Account & Login Quick Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
              {isLoggedIn ? <User className="w-5 h-5 text-orange-400" /> : <LogIn className="w-5 h-5 text-orange-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white tracking-tight">
                  {isLoggedIn ? `Welcome, ${playerName}` : 'Esports Player Portal'}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-md">
                    Admin
                  </span>
                )}
                {!isLoggedIn && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md">
                    Quick Login
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isLoggedIn 
                  ? `Game UID: ${playerUid} • Total Balance: ₹${walletStats.totalBalance} (Winnings: ₹${walletStats.winningsBalance})`
                  : 'Login or Register to track tournament slots, room ID/pass & withdraw cash winnings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isLoggedIn ? (
              <>
                <button
                  id="btn-home-view-profile"
                  onClick={() => onNavigateTab('profile')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700 cursor-pointer shadow-sm"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wallet (₹{walletStats.totalBalance})</span>
                </button>
                <button
                  id="btn-home-view-my-passes"
                  onClick={() => onNavigateTab('orders')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  <span>My Passes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  id="btn-home-quick-login"
                  onClick={() => onOpenLoginModal ? onOpenLoginModal() : onNavigateTab('profile')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Player Login / Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Slideshow Section with Motion */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl"
      >
        <div className="relative min-h-[440px] sm:min-h-[500px] flex items-center">
          {/* Slide Background Image with Cyber Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-neutral-950/60 to-neutral-950" />
          </div>

          {/* Slide Content with AnimatePresence */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 py-12 text-center flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-extrabold uppercase tracking-widest mb-4 backdrop-blur-md shadow-lg shadow-orange-500/10">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
                  <span>{currentSlide.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight mb-3">
                  {currentSlide.title}
                </h1>

                <p className="text-sm sm:text-lg font-bold text-orange-400 tracking-wide uppercase mb-4">
                  {currentSlide.subtitle}
                </p>

                <p className="text-neutral-300 text-sm sm:text-base max-w-2xl font-medium leading-relaxed mb-8">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-hero-primary-cta"
                onClick={() => onNavigateTab(currentSlide.ctaAction)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:brightness-110 text-white font-extrabold text-sm tracking-wide uppercase shadow-xl shadow-orange-600/30 transition transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-rules"
                onClick={() => onNavigateTab('rules')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm tracking-wide transition cursor-pointer backdrop-blur-md hover:border-orange-500/40"
              >
                <span>View Reward Slabs & Rules</span>
              </button>
            </div>
          </div>

          {/* Slide Navigation Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlideIndex === idx
                    ? 'w-8 bg-orange-500 shadow-md shadow-orange-500/50'
                    : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <button
            onClick={() =>
              setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="hidden sm:flex absolute left-4 z-20 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)}
            className="hidden sm:flex absolute right-4 z-20 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

      {/* Interactive Quick Stats Ticker Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-lg"
      >
        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400">Total Matches</div>
            <div className="text-base font-black text-white font-mono">{matches.length}+ Daily</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400">Payout Speed</div>
            <div className="text-base font-black text-emerald-400 font-mono">15 Mins UPI</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400">Max Kill Bounty</div>
            <div className="text-base font-black text-cyan-400 font-mono">₹100 / Kill</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400">Booyah Multiplier</div>
            <div className="text-base font-black text-purple-400 font-mono">2.0X Returns</div>
          </div>
        </div>
      </motion.div>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex items-start gap-4 hover:border-orange-500/30 transition">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">2.0X Placement Reward</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              1st place claims 200% entry fee. 2nd gets 130% and 3rd gets 120%.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex items-start gap-4 hover:border-cyan-500/30 transition">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Per-Kill Cash Bounty</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Earn ₹7 to ₹100 for every single confirmed elimination you score.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex items-start gap-4 hover:border-emerald-500/30 transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Instant UPI Payouts</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Direct transfer to GPay, PhonePe, Paytm within 15 minutes of match.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex items-start gap-4 hover:border-purple-500/30 transition">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">100% Fair Play & Referees</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Official referees in every room. Zero hackers, emulators, or teaming.
            </p>
          </div>
        </div>
      </section>

      {/* Themed Promotional Tournaments Carousel */}
      <PromoCarousel onSelectPromoMatch={handleSelectPromoMatch} />

      {/* Top Killers Hall of Fame Leaderboard */}
      <TopKillersWidget />

      {/* Live & Upcoming Tournaments with Quick Filter Pills */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Live & Upcoming Rooms
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Select your match, review rules, complete 1-tap UPI payment and lock your slot.
            </p>
          </div>

          {/* User-Friendly Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Rooms' },
              { id: 'SOLO', label: 'Solo BR' },
              { id: 'SQUAD', label: 'Squad / Duo' },
              { id: 'CLASH', label: '1v1 Clash' },
              { id: 'CHEAP', label: 'Under ₹50' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedQuickFilter(chip.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedQuickFilter === chip.id
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/20'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}

            <button
              onClick={() => onNavigateTab('tournaments')}
              className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider px-2 py-1 cursor-pointer shrink-0"
            >
              <span>All ({matches.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matches Grid with Motion Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.slice(0, 6).map((match, idx) => {
            const placementPrizes = calculateBRPlacementRewards(match.entryFee);
            const killBounty = getPerKillReward(match.entryFee);
            const fillPercentage = Math.round((match.approvedCount / match.maxPlayers) * 100);

            // Smart Suggestion
            let suggestion = null;
            if (match.status === 'FILLING_SLOWLY' && match.gameMode.includes('br')) {
              suggestion = '⚡ Filling slowly — Clash Squad 1v1 available for instant match!';
            } else if (match.status === 'ALMOST_FULL' || fillPercentage >= 75) {
              suggestion = '🔥 Only a few slots remaining! Fast booking recommended.';
            }

            return (
              <motion.div
                key={match.id}
                id={`card-match-${match.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/50 transition duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-orange-500/10"
              >
                {/* Card Header & Banner */}
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={match.bannerImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
                      alt={match.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                    {/* Entry Badge */}
                    <div className="absolute top-3 right-3 bg-neutral-950/90 border border-orange-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Entry Fee</p>
                      <p className="text-base font-black text-orange-400 leading-none">₹{match.entryFee}</p>
                    </div>

                    {/* Mode & Status */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-700 text-neutral-200 text-[11px] font-bold uppercase tracking-wider">
                        {match.gameModeName}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${
                          match.status === 'ALMOST_FULL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : match.status === 'FULL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {match.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                        {match.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {match.scheduledStart}
                        </span>
                        <span>•</span>
                        <span>{match.mapName}</span>
                      </div>
                    </div>

                    {/* Reward Matrix Highlights */}
                    <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 text-xs">
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-semibold uppercase">1st Place Prize</span>
                        <span className="font-extrabold text-emerald-400 text-sm">
                          ₹{match.rewardConfig.fixedWinnerPrize || placementPrizes.first}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Kill Bounty</span>
                        <span className="font-extrabold text-orange-400 text-sm">
                          {killBounty > 0 ? `₹${killBounty} / kill` : 'Included in Pool'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Seats */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-neutral-500" />
                          Confirmed Seats
                        </span>
                        <span className="text-white">
                          {match.approvedCount} / {match.maxPlayers}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fillPercentage >= 80 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, fillPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Smart Suggestion Message */}
                    {suggestion && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/20 text-[11px] text-orange-300">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="p-5 pt-0">
                  <button
                    id={`btn-join-match-${match.id}`}
                    disabled={match.status === 'FULL' || match.approvedCount >= match.maxPlayers}
                    onClick={() => onSelectMatch(match)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
                      match.status === 'FULL' || match.approvedCount >= match.maxPlayers
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20'
                    }`}
                  >
                    <span>{match.status === 'FULL' ? 'Room Full' : 'Select & Join Room'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Game Modes Showcase */}
      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Supported Game Modes
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Choose your battlefield archetype: Solo, Duo, Squad 4v4, Clash Squad 1v1, or Iron Cage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_MODES.slice(0, 6).map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectMode(mode.id)}
              className="group cursor-pointer rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-orange-500/40 p-5 transition duration-300 flex flex-col justify-between hover:bg-neutral-900"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-extrabold uppercase tracking-widest">
                    {mode.badge}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    Starts @ ₹{mode.defaultEntryFee}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {mode.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  {mode.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-orange-400 group-hover:text-orange-300">
                <span>Explore Matches</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Official Telegram Esports Channel Banner */}
      {settings.telegramUrl && (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-neutral-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
                <Send className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                    Official Community
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Live Room Password Broadcasts
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Join {settings.telegramChannelName || 'Official Telegram Channel'}
                </h3>
                <p className="text-xs text-neutral-300 max-w-xl">
                  Get instant notifications 15 minutes before matches, verified custom room ID/passwords, direct support, and daily tournament schedules!
                </p>
              </div>
            </div>

            <a
              id="home-btn-join-telegram"
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Join Channel Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.section>
      )}
    </div>
  );
};
