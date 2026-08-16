import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Clock, 
  Zap, 
  ArrowRight,
  Flame,
  Bot
} from 'lucide-react';
import { PromoBanner, Match, GameModeId } from '../types';
import { PROMO_BANNERS } from '../data/tournamentData';
import { useTournaments } from '../context/TournamentContext';

interface PromoCarouselProps {
  onSelectPromoMatch: (gameMode: GameModeId, entryFee: number, title: string) => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ onSelectPromoMatch }) => {
  const { settings } = useTournaments();
  const banners = settings.promoBanners && settings.promoBanners.length > 0 
    ? settings.promoBanners 
    : PROMO_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const activeIndex = currentIndex < banners.length ? currentIndex : 0;
  const currentBanner = banners[activeIndex] || banners[0];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section 
      id="promo-carousel-section" 
      className="space-y-4"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Featured Special Tournaments
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-bold text-orange-400 normal-case tracking-normal">
                <Bot className="w-3 h-3" /> AI Curated Banners
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              High-multiplier special rules, one-tap duels, and guaranteed prize pools
            </p>
          </div>
        </div>

        {/* Slide Counter & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-mono font-bold text-neutral-500">
            0{currentIndex + 1} / 0{PROMO_BANNERS.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              id="btn-promo-prev"
              onClick={handlePrev}
              aria-label="Previous promo banner"
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-promo-next"
              onClick={handleNext}
              aria-label="Next promo banner"
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Banner Container */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl transition-all duration-500">
        <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center">
          {/* Background Image with Fallback and no-referrer */}
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Dynamic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent" />

          {/* Content Box */}
          <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4">
            {/* Tag / Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
                {currentBanner.badge}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-300 font-semibold bg-neutral-950/80 px-2.5 py-1 rounded-lg border border-neutral-800">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {currentBanner.scheduleText}
              </span>
            </div>

            {/* Title & Tagline */}
            <div>
              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                {currentBanner.title}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-orange-400 uppercase tracking-wide mt-1">
                {currentBanner.tagline}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              {currentBanner.description}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {currentBanner.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {feat}
                </span>
              ))}
            </div>

            {/* Pricing & CTA */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3 bg-neutral-950/90 border border-neutral-800 px-4 py-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Entry Fee</span>
                  <span className="text-base font-black text-white">₹{currentBanner.entryFee}</span>
                </div>
                <div className="w-px h-8 bg-neutral-800" />
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Prize Guarantee</span>
                  <span className="text-base font-black text-emerald-400">{currentBanner.prizePool}</span>
                </div>
              </div>

              <button
                id={`btn-join-promo-${currentBanner.id}`}
                onClick={() =>
                  onSelectPromoMatch(
                    currentBanner.gameMode,
                    currentBanner.entryFee,
                    currentBanner.title
                  )
                }
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
              >
                <span>Join Special Event</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Progress Bar */}
        <div className="flex bg-neutral-950 h-1.5 w-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`flex-1 transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? 'bg-orange-500' : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
