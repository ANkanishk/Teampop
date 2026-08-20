import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, Flame, Zap, Wifi, Cpu, Sparkles } from 'lucide-react';

interface Gaming3DLoaderProps {
  statusText?: string;
  subText?: string;
  fullScreen?: boolean;
  onFinish?: () => void;
  showProgress?: boolean;
}

const GAMING_HINTS = [
  '🎮 Calibrating Free Fire custom tournament room servers...',
  '🔥 Synchronizing kill bounties & Booyah placement rewards...',
  '⚡ Verifying player Game UIDs & anti-cheat fair play shields...',
  '🏆 Loading Hall of Fame leaderboards & tournament brackets...',
  '🚀 Ready for intense competitive Free Fire action!'
];

export const Gaming3DLoader: React.FC<Gaming3DLoaderProps> = ({
  statusText = 'INITIALIZING POP ESPORTS ENGINE',
  subText = 'Connecting to high-speed Free Fire tournament matchmaking...',
  fullScreen = false,
  showProgress = true,
}) => {
  const [progress, setProgress] = useState(15);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + jump, 98);
      });
    }, 280);

    const hintInterval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % GAMING_HINTS.length);
    }, 2200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(hintInterval);
    };
  }, []);

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[999999] bg-neutral-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4'
    : 'w-full py-10 flex flex-col items-center justify-center';

  return (
    <div className={containerClasses} id="gaming-3d-console-loader">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-red-600/15 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        
        {/* 3D FLOATING GAMING CONSOLE / CYBER GAMEPAD */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] h-[190px] sm:h-[210px] relative mb-6 card-3d-wrap flex items-center justify-center">
          <div className="w-full h-full relative animate-console-3d flex items-center justify-center">
            
            {/* Top Shoulder Triggers (L1/R1, L2/R2) */}
            <div className="absolute -top-3.5 left-8 w-14 h-4 bg-gradient-to-t from-neutral-800 to-neutral-700 rounded-t-lg border-t border-l border-r border-orange-500/40 shadow-inner flex items-center justify-center">
              <span className="text-[8px] font-black text-orange-400 font-mono">L1</span>
            </div>
            <div className="absolute -top-3.5 right-8 w-14 h-4 bg-gradient-to-t from-neutral-800 to-neutral-700 rounded-t-lg border-t border-l border-r border-orange-500/40 shadow-inner flex items-center justify-center">
              <span className="text-[8px] font-black text-orange-400 font-mono">R1</span>
            </div>

            {/* Main Console Chassis Body */}
            <div className="w-full h-[175px] sm:h-[185px] rounded-[32px] bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-orange-500/60 shadow-[0_20px_50px_rgba(249,115,22,0.35)] relative overflow-hidden flex items-center justify-between px-3 sm:px-4 py-3">
              
              {/* Chassis Cyber Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none"></div>
              
              {/* Top Cyber Accent Neon Strip */}
              <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_8px_#f97316]"></div>
              {/* Bottom Cyber Accent Strip */}
              <div className="absolute bottom-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444]"></div>

              {/* LEFT CONTROLS: D-PAD & LEFT JOYSTICK */}
              <div className="flex flex-col items-center justify-center gap-3 w-16 sm:w-20 shrink-0 z-10">
                {/* 3D D-PAD */}
                <div className="w-12 h-12 relative animate-dpad flex items-center justify-center">
                  <div className="w-12 h-4 bg-neutral-800 rounded-sm absolute border border-neutral-700 shadow-md"></div>
                  <div className="w-4 h-12 bg-neutral-800 rounded-sm absolute border border-neutral-700 shadow-md"></div>
                  <div className="w-4 h-4 bg-neutral-900 rounded-full z-10 border border-orange-500/50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                  </div>
                </div>

                {/* Left Analog Joystick */}
                <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner flex items-center justify-center p-1 relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border-2 border-orange-500/80 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-joystick flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-400"></div>
                  </div>
                </div>
              </div>

              {/* CENTER CONSOLE DISPLAY SCREEN */}
              <div className="flex-1 h-[135px] sm:h-[145px] mx-1.5 sm:mx-2 rounded-2xl bg-neutral-950 border border-orange-500/40 p-2.5 relative overflow-hidden flex flex-col justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
                
                {/* Screen Scanlines */}
                <div className="absolute inset-0 scanlines opacity-40 pointer-events-none"></div>

                {/* Top Status Bar on Screen */}
                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-1 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-400 font-bold">120 FPS</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <Wifi className="w-3 h-3 text-orange-400 animate-pulse" />
                    <span>14ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded font-extrabold">POP OS v4.2</span>
                  </div>
                </div>

                {/* Center Holographic Booyah & Equalizer Animation */}
                <div className="flex-1 flex flex-col items-center justify-center relative py-1 z-10">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-float">
                      <Trophy className="w-6 h-6 text-orange-400" />
                    </div>
                    {/* Rotating Cyber Radar Ring */}
                    <div className="absolute inset-0 -m-1.5 rounded-xl border border-dashed border-orange-400/40 animate-spin" style={{ animationDuration: '6s' }}></div>
                  </div>

                  {/* Equalizer Frequency Bars */}
                  <div className="flex items-end justify-center gap-1 mt-1.5 h-4">
                    {[12, 18, 24, 15, 22, 28, 14, 20, 26, 16].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-orange-600 to-amber-400 rounded-t"
                        style={{
                          height: `${(h / 28) * 100}%`,
                          animation: `equalizer-bounce 0.8s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.08}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Bottom Screen Message */}
                <div className="flex items-center justify-between text-[8px] font-mono text-orange-300/90 z-10">
                  <span className="truncate max-w-[140px] font-bold">MATCHMAKING ENGINE</span>
                  <span className="font-extrabold text-amber-400">{progress}%</span>
                </div>
              </div>

              {/* RIGHT CONTROLS: ACTION BUTTONS (X, Y, A, B) & RIGHT JOYSTICK */}
              <div className="flex flex-col items-center justify-center gap-3 w-16 sm:w-20 shrink-0 z-10">
                {/* 4 ACTION BUTTONS (ABXY) */}
                <div className="w-12 h-12 relative flex items-center justify-center">
                  {/* Y Button (Top - Amber) */}
                  <div className="absolute top-0 w-4 h-4 rounded-full bg-neutral-900 border border-amber-400 text-amber-400 text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#f59e0b] animate-abxy">
                    Y
                  </div>
                  {/* A Button (Bottom - Emerald) */}
                  <div className="absolute bottom-0 w-4 h-4 rounded-full bg-neutral-900 border border-emerald-400 text-emerald-400 text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#10b981] animate-abxy" style={{ animationDelay: '0.4s' }}>
                    A
                  </div>
                  {/* X Button (Left - Blue) */}
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-neutral-900 border border-cyan-400 text-cyan-400 text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#06b6d4] animate-abxy" style={{ animationDelay: '0.2s' }}>
                    X
                  </div>
                  {/* B Button (Right - Red) */}
                  <div className="absolute right-0 w-4 h-4 rounded-full bg-neutral-900 border border-red-500 text-red-400 text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#ef4444] animate-abxy" style={{ animationDelay: '0.6s' }}>
                    B
                  </div>
                </div>

                {/* Right Analog Joystick */}
                <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner flex items-center justify-center p-1 relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border-2 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-joystick flex items-center justify-center" style={{ animationDirection: 'reverse' }}>
                    <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-400"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Grip Cyber Lighting */}
            <div className="absolute -bottom-2 inset-x-12 h-3 bg-gradient-to-b from-orange-500/40 to-transparent blur-md rounded-full pointer-events-none"></div>
          </div>
        </div>

        {/* LOADING TEXT & STATUS */}
        <div className="space-y-2 w-full px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{statusText}</span>
          </div>

          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {subText}
          </p>

          {/* PROGRESS BAR */}
          {showProgress && (
            <div className="mt-4 w-full max-w-xs mx-auto space-y-1.5">
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                <span className="text-orange-400 font-bold animate-pulse">LOADING ESPORTS ASSETS</span>
                <span className="font-extrabold text-white">{progress}%</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CYBER TIPS TICKER */}
          <div className="pt-2 text-[11px] text-neutral-400 italic min-h-[22px] flex items-center justify-center transition-all">
            <span className="truncate max-w-xs">{GAMING_HINTS[hintIndex]}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
