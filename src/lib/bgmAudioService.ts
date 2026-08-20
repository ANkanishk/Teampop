import { BgmConfig } from '../types';

export interface BgmState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  activeTrackTitle: string;
  activeTrackUrl: string;
  isUserInteracted: boolean;
  isSynthPlaying: boolean;
}

type BgmListener = (state: BgmState) => void;

class BgmAudioService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthGainNode: GainNode | null = null;
  private isSynthRunning: boolean = false;
  private synthIntervalId: any = null;
  
  private isMuted: boolean = false;
  private volume: number = 0.15; // default gentle volume (15%)
  private isPlaying: boolean = false;
  private currentConfig: BgmConfig | null = null;
  private listeners: Set<BgmListener> = new Set();
  private userInteracted: boolean = false;
  private interactionListenersAttached: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check stored mute preference
      try {
        const storedMute = localStorage.getItem('pop_bgm_muted');
        if (storedMute !== null) {
          this.isMuted = storedMute === 'true';
        }
        const storedVol = localStorage.getItem('pop_bgm_user_volume');
        if (storedVol !== null) {
          const parsed = parseFloat(storedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
      } catch (e) {}

      this.initAudioElement();
      this.attachUserInteractionListeners();
    }
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.isMuted ? 0 : this.volume;

      this.audioElement.addEventListener('playing', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audioElement.addEventListener('pause', () => {
        if (!this.isSynthRunning) {
          this.isPlaying = false;
        }
        this.notify();
      });

      this.audioElement.addEventListener('ended', () => {
        if (!this.isSynthRunning) {
          this.isPlaying = false;
        }
        this.notify();
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('[BGM Audio] HTML5 Audio encountered error or 404, fallback to Esports Theme Synthesizer:', e);
        // Fallback to synthetic battle theme
        if (this.currentConfig?.enabled && !this.isMuted) {
          this.startSynthTheme();
        }
      });
    }
  }

  private attachUserInteractionListeners() {
    if (this.interactionListenersAttached || typeof window === 'undefined') return;
    this.interactionListenersAttached = true;

    const unlockHandler = () => {
      this.userInteracted = true;
      // Resume AudioContext if suspended
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // If autoplay is enabled and not yet playing, start
      if (this.currentConfig?.enabled && this.currentConfig?.autoplay && !this.isPlaying && !this.isMuted) {
        this.play();
      }

      // Remove one-time listeners once unlocked
      ['click', 'touchstart', 'keydown', 'scroll'].forEach((evt) => {
        window.removeEventListener(evt, unlockHandler, { capture: true } as any);
      });
    };

    ['click', 'touchstart', 'keydown', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });
  }

  public initFromConfig(config: BgmConfig) {
    this.currentConfig = config;
    const adminVol = typeof config.volume === 'number' ? config.volume : 0.15;
    
    // If user hasn't manually overridden volume, use admin config
    try {
      if (localStorage.getItem('pop_bgm_user_volume') === null) {
        this.volume = adminVol;
      }
    } catch (e) {}

    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.audioCtx.currentTime);
    }

    if (config.enabled && config.autoplay) {
      // If audio already initialized, attempt play
      this.play();
    } else if (!config.enabled) {
      this.pause();
    }

    this.notify();
  }

  public async play(): Promise<boolean> {
    if (!this.currentConfig || !this.currentConfig.enabled) {
      return false;
    }

    const trackUrl = this.currentConfig.trackUrl;
    const isProcedural = !trackUrl || trackUrl.startsWith('SYNTH_') || trackUrl.includes('free-fire-lobby-theme');

    try {
      if (isProcedural) {
        // Try audio element first if a real file exists, else use procedural synth
        if (this.audioElement && trackUrl && !trackUrl.startsWith('SYNTH_')) {
          if (this.audioElement.src !== trackUrl && !this.audioElement.src.endsWith(trackUrl)) {
            this.audioElement.src = trackUrl;
          }
          this.audioElement.volume = this.isMuted ? 0 : this.volume;
          
          try {
            await this.audioElement.play();
            this.isPlaying = true;
            this.stopSynthTheme();
            this.notify();
            return true;
          } catch (err: any) {
            // Autoplay policy or 404: fallback to Web Audio Procedural Synth
            console.log('[BGM] Switching to Web Audio Esports Theme Engine:', err?.name);
            return this.startSynthTheme();
          }
        } else {
          return this.startSynthTheme();
        }
      } else {
        // Custom URL or uploaded audio file
        this.stopSynthTheme();
        if (this.audioElement) {
          if (this.audioElement.src !== trackUrl && !this.audioElement.src.endsWith(trackUrl)) {
            this.audioElement.src = trackUrl;
          }
          this.audioElement.volume = this.isMuted ? 0 : this.volume;
          await this.audioElement.play();
          this.isPlaying = true;
          this.notify();
          return true;
        }
      }
    } catch (e: any) {
      console.warn('[BGM Play Auto-Catch]', e?.message || e);
      if (e?.name === 'NotAllowedError') {
        // Browser blocked un-interacted autoplay; will resume on first click
      }
      return false;
    }
    return false;
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthTheme();
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      if (this.isMuted) {
        this.setMute(false);
      }
      this.play();
      return true;
    }
  }

  public toggleMute(): boolean {
    return this.setMute(!this.isMuted);
  }

  public setMute(mute: boolean): boolean {
    this.isMuted = mute;
    try {
      localStorage.setItem('pop_bgm_muted', String(mute));
    } catch (e) {}

    const effectiveVol = this.isMuted ? 0 : this.volume;
    if (this.audioElement) {
      this.audioElement.volume = effectiveVol;
    }
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.audioCtx.currentTime);
    }

    if (!mute && !this.isPlaying && this.currentConfig?.enabled) {
      this.play();
    }

    this.notify();
    return this.isMuted;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0.01, Math.min(1.0, vol));
    this.volume = clamped;
    try {
      localStorage.setItem('pop_bgm_user_volume', String(clamped));
    } catch (e) {}

    if (!this.isMuted) {
      if (this.audioElement) {
        this.audioElement.volume = clamped;
      }
      if (this.synthGainNode && this.audioCtx) {
        this.synthGainNode.gain.setValueAtTime(clamped * 0.4, this.audioCtx.currentTime);
      }
    }
    this.notify();
  }

  public getState(): BgmState {
    return {
      isPlaying: this.isPlaying || this.isSynthRunning,
      isMuted: this.isMuted,
      volume: this.volume,
      activeTrackTitle: this.currentConfig?.trackTitle || 'Free Fire Esports Lobby Anthem',
      activeTrackUrl: this.currentConfig?.trackUrl || '',
      isUserInteracted: this.userInteracted,
      isSynthPlaying: this.isSynthRunning,
    };
  }

  public subscribe(listener: BgmListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  // =========================================================================
  // HIGH-ENERGY PROCEDURAL FREE FIRE ESPORTS THEME SYNTHESIZER ENGINE
  // Matches the uploaded high-octane 128 BPM electronic gaming anthem loop
  // =========================================================================
  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private startSynthTheme(): boolean {
    const ctx = this.initAudioContext();
    if (!ctx) return false;

    if (this.isSynthRunning) return true;

    // Master synth gain node
    this.synthGainNode = ctx.createGain();
    this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, ctx.currentTime);
    this.synthGainNode.connect(ctx.destination);

    this.isSynthRunning = true;
    this.isPlaying = true;
    this.notify();

    // 128 BPM (Free Fire Theme tempo) -> 1 beat = 0.46875s, 16th note = ~0.117s
    const bpm = 128;
    const sixteenth = 60 / bpm / 4; // ~0.1171875s
    let step = 0;

    // FF Epic Motif scale notes (F# minor / Cyber gaming scale: F#3, A3, B3, C#4, E4, F#4)
    const melodyNotes = [
      370.0, 370.0, 440.0, 493.88, 554.37, 493.88, 440.0, 370.0,
      440.0, 493.88, 554.37, 659.25, 739.99, 659.25, 554.37, 493.88,
      370.0, 370.0, 370.0, 440.0, 493.88, 554.37, 493.88, 370.0,
      277.18, 370.0, 440.0, 493.88, 370.0, 370.0, 370.0, 370.0,
    ];

    const bassNotes = [
      92.5, 92.5, 92.5, 92.5,  // F#2
      110.0, 110.0, 110.0, 110.0, // A2
      123.47, 123.47, 123.47, 123.47, // B2
      92.5, 92.5, 73.42, 82.41, // F#2, D2, E2
    ];

    const schedulePattern = () => {
      if (!this.isSynthRunning || !this.audioCtx || !this.synthGainNode) return;
      const now = this.audioCtx.currentTime;

      // 1. Kick Drum (on beats 1, 5, 9, 13)
      if (step % 4 === 0) {
        this.triggerKick(now);
      }

      // 2. Snare / Clap (on beats 4, 12)
      if (step % 8 === 4) {
        this.triggerSnare(now);
      }

      // 3. Hi-Hat (every odd 16th note)
      if (step % 2 === 1) {
        this.triggerHiHat(now, step % 4 === 2 ? 0.08 : 0.04);
      }

      // 4. Cyber Driving Bassline (16th notes with sidechain ducking)
      const bassIndex = Math.floor(step / 2) % bassNotes.length;
      const bassFreq = bassNotes[bassIndex];
      this.triggerBassNote(now, bassFreq, sixteenth * 1.5);

      // 5. Lead Synth Brass Melody (Free Fire Theme Anthem)
      if (step % 2 === 0) {
        const melIndex = Math.floor(step / 2) % melodyNotes.length;
        const melFreq = melodyNotes[melIndex];
        this.triggerLeadSynth(now, melFreq, sixteenth * 1.8);
      }

      step = (step + 1) % 64;
    };

    this.synthIntervalId = setInterval(schedulePattern, sixteenth * 1000);
    return true;
  }

  private triggerKick(time: number) {
    if (!this.audioCtx || !this.synthGainNode) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.synthGainNode);

      osc.start(time);
      osc.stop(time + 0.15);
    } catch (e) {}
  }

  private triggerSnare(time: number) {
    if (!this.audioCtx || !this.synthGainNode) return;
    try {
      // Noise burst for snare snap
      const bufferSize = this.audioCtx.sampleRate * 0.1;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGainNode);

      noise.start(time);
      noise.stop(time + 0.1);
    } catch (e) {}
  }

  private triggerHiHat(time: number, volume: number = 0.05) {
    if (!this.audioCtx || !this.synthGainNode) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, time);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGainNode);

      osc.start(time);
      osc.stop(time + 0.05);
    } catch (e) {}
  }

  private triggerBassNote(time: number, freq: number, duration: number) {
    if (!this.audioCtx || !this.synthGainNode) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + duration);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGainNode);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {}
  }

  private triggerLeadSynth(time: number, freq: number, duration: number) {
    if (!this.audioCtx || !this.synthGainNode) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Slight detune for thick esports anthem supersaw sound
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.005, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + duration);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGainNode);

      osc.start(time);
      osc2.start(time);
      osc.stop(time + duration);
      osc2.stop(time + duration);
    } catch (e) {}
  }

  private stopSynthTheme() {
    this.isSynthRunning = false;
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }
}

export const bgmService = new BgmAudioService();
