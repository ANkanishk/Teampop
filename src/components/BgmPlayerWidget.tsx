import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { bgmService, BgmState } from '../lib/bgmAudioService';
import { useTournaments } from '../context/TournamentContext';

export const BgmPlayerWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { settings } = useTournaments();
  const [bgmState, setBgmState] = useState<BgmState>(bgmService.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState<boolean>(false);

  const bgmConfig = settings.bgmConfig;
  const isEnabled = bgmConfig?.enabled ?? true;

  useEffect(() => {
    const unsub = bgmService.subscribe((state) => {
      setBgmState(state);
      if (isEnabled && bgmConfig?.autoplay && !state.isPlaying && !state.isMuted) {
        setShowUnlockPrompt(true);
      } else {
        setShowUnlockPrompt(false);
      }
    });
    return () => unsub();
  }, [isEnabled, bgmConfig]);

  if (!isEnabled) return null;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    bgmService.togglePlay();
    setShowUnlockPrompt(false);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    bgmService.toggleMute();
    setShowUnlockPrompt(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    bgmService.setVolume(val);
    if (bgmState.isMuted) {
      bgmService.setMute(false);
    }
  };

  // Compact Header / Navbar Widget
  if (compact) {
    return (
      <div className="relative flex items-center">
        <button
          onClick={handleTogglePlay}
          title={bgmState.isPlaying ? 'Pause Background Music' : 'Play Background Music'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            bgmState.isPlaying
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {bgmState.isPlaying ? (
            <>
              {/* Equalizer animation */}
              <div className="flex items-end gap-0.5 h-3.5 w-3">
                <span className="w-0.5 h-full bg-amber-400 animate-pulse rounded-full" />
                <span className="w-0.5 h-2/3 bg-amber-400 animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-4/5 bg-amber-400 animate-pulse delay-150 rounded-full" />
              </div>
              <span className="hidden xl:inline text-[11px] font-mono font-medium">BGM</span>
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px] font-mono">BGM</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Floating Corner Player (Bottom-Right / Above Nav)
  return (
    <>
      {/* Tap to Unlock Audio Prompt (when browser blocks auto sound on cold start) */}
      {showUnlockPrompt && (
        <div 
          onClick={handleTogglePlay}
          className="fixed bottom-20 right-4 z-40 bg-neutral-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 text-amber-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 cursor-pointer backdrop-blur-md animate-bounce hover:bg-neutral-900"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Music className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px]">🎵 Tap anywhere to start background music</p>
            <p className="text-[10px] text-neutral-400">Playing in soft ambient volume</p>
          </div>
        </div>
      )}

      {/* Floating Mini Player Widget */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
        <div className="bg-neutral-950/90 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-200 overflow-hidden">
          {/* Main Bar */}
          <div className="flex items-center gap-2 p-2 px-3">
            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                bgmState.isPlaying
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
              title={bgmState.isPlaying ? 'Pause Music' : 'Play Background Music'}
            >
              {bgmState.isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Track Info & Animated Equalizer */}
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer flex items-center gap-2 pr-1"
            >
              <div className="max-w-[140px] truncate">
                <p className="text-[11px] font-semibold text-white truncate leading-tight">
                  {bgmState.activeTrackTitle || 'POP Esports Anthem'}
                </p>
                <div className="flex items-center gap-1.5">
                  {bgmState.isPlaying ? (
                    <div className="flex items-end gap-0.5 h-2">
                      <span className="w-0.5 h-full bg-amber-400 animate-pulse rounded-full" />
                      <span className="w-0.5 h-1/2 bg-amber-400 animate-pulse delay-75 rounded-full" />
                      <span className="w-0.5 h-3/4 bg-amber-400 animate-pulse delay-150 rounded-full" />
                    </div>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  )}
                  <span className="text-[9px] text-neutral-400 font-mono">
                    {bgmState.isMuted ? 'MUTED' : `${Math.round(bgmState.volume * 100)}% VOL`}
                  </span>
                </div>
              </div>

              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </div>

            {/* Mute Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors ${
                bgmState.isMuted
                  ? 'text-red-400 hover:bg-red-950/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title={bgmState.isMuted ? 'Unmute' : 'Mute'}
            >
              {bgmState.isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Expanded Volume Slider Drawer */}
          {isExpanded && (
            <div className="px-3 pb-2.5 pt-1 border-t border-neutral-850 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Volume</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round(bgmState.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="1.0"
                step="0.01"
                value={bgmState.volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
