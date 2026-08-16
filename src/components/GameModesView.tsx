import React, { useState } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2,
  Crosshair,
  Flame
} from 'lucide-react';
import { GAME_MODES } from '../data/tournamentData';
import { GameModeId, Match } from '../types';
import { useTournaments } from '../context/TournamentContext';

interface GameModesViewProps {
  onSelectMode: (modeId: GameModeId) => void;
  onSelectMatch: (match: Match) => void;
}

export const GameModesView: React.FC<GameModesViewProps> = ({
  onSelectMode,
  onSelectMatch,
}) => {
  const { matches } = useTournaments();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Battle Royale',
    'Clash Squad',
    'Special & Duel',
    'Flagship Championship',
  ];

  const filteredModes = GAME_MODES.filter((mode) => {
    if (activeCategory === 'ALL') return true;
    return mode.category === activeCategory;
  });

  return (
    <div id="game-modes-view" className="space-y-8 pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-widest inline-block">
            Free Fire MAX Formats
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Official Competitive Game Modes
          </h1>
          <p className="text-sm text-neutral-300">
            From classic Bermuda 48-player Battle Royale to tactical 1v1 Iron Cage duels. Check format rules and active entry tiers below.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModes.map((mode) => {
          const activeMatchCount = matches.filter((m) => m.gameMode === mode.id).length;

          return (
            <div
              key={mode.id}
              id={`game-mode-card-${mode.id}`}
              className="rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/50 transition duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Banner */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={mode.image}
                    alt={mode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                  <div className="absolute top-3 right-3 bg-neutral-950/90 border border-orange-500/40 backdrop-blur-md px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">Starting at</span>
                    <span className="text-sm font-black text-orange-400">₹{mode.defaultEntryFee}</span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-extrabold uppercase tracking-wider">
                      {mode.badge}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{mode.title}</h3>
                    <p className="text-xs font-semibold text-orange-400">{mode.tagline}</p>
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{mode.description}</p>
                  </div>

                  {/* Rules list */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Core Competitive Rules:
                    </span>
                    <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                      {mode.rulesSummary.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectMode(mode.id)}
                  className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Browse {activeMatchCount} Active Rooms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
