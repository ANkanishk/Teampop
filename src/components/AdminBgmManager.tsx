import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  FileAudio, 
  AlertCircle,
  Sliders,
  Flame,
  Zap,
  Globe
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { bgmService } from '../lib/bgmAudioService';
import { BgmConfig } from '../types';

const BGM_PRESETS = [
  {
    id: 'default_ff_anthem',
    name: 'Free Fire Esports Lobby Anthem (Default)',
    desc: 'High-energy 128 BPM Free Fire esports tournament battle theme (Synthesized / Offline Ready)',
    url: '/audio/free-fire-lobby-theme.mp3',
    icon: Flame,
    color: 'from-amber-500 to-red-600',
    badge: 'DEFAULT'
  },
  {
    id: 'cyberpunk_rush',
    name: 'Cyberpunk Tournament Rush',
    desc: 'Driving synthwave beats with heavy bass & cyber pulses for competitive lobbies',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
    icon: Zap,
    color: 'from-cyan-500 to-blue-600',
    badge: 'CYBER'
  },
  {
    id: 'lofi_chill',
    name: 'Lo-Fi Chill Gaming Lounge',
    desc: 'Relaxed soothing beats for calm tournament registration & wallet browsing',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    icon: Radio,
    color: 'from-purple-500 to-indigo-600',
    badge: 'RELAX'
  },
  {
    id: 'victory_orchestra',
    name: 'Grand Victory Orchestral Anthem',
    desc: 'Epic cinematic brass and battle drums for high-stakes championship hype',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b084.mp3?filename=epic-hollywood-trailer-9489.mp3',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    badge: 'EPIC'
  }
];

export const AdminBgmManager: React.FC = () => {
  const { settings, updateSettings } = useTournaments();
  const currentBgm = settings.bgmConfig || {
    enabled: true,
    autoplay: true,
    volume: 0.15,
    trackTitle: 'Free Fire Esports Lobby Anthem (Default)',
    trackUrl: '/audio/free-fire-lobby-theme.mp3',
    loop: true,
    presetId: 'default_ff_anthem',
    fileName: 'free_fire_lobby_anthem.mp3'
  };

  const [enabled, setEnabled] = useState<boolean>(currentBgm.enabled ?? true);
  const [autoplay, setAutoplay] = useState<boolean>(currentBgm.autoplay ?? true);
  const [volume, setVolume] = useState<number>(currentBgm.volume ?? 0.15);
  const [trackTitle, setTrackTitle] = useState<string>(currentBgm.trackTitle || 'Free Fire Esports Lobby Anthem (Default)');
  const [trackUrl, setTrackUrl] = useState<string>(currentBgm.trackUrl || '/audio/free-fire-lobby-theme.mp3');
  const [presetId, setPresetId] = useState<string>(currentBgm.presetId || 'default_ff_anthem');
  const [loop, setLoop] = useState<boolean>(currentBgm.loop ?? true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live playback state
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = bgmService.subscribe((state) => {
      setIsPlayingTest(state.isPlaying);
    });
    return () => unsub();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check audio types
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .ogg, .m4a, .aac).');
      return;
    }

    // Limit to 35MB
    if (file.size > 35 * 1024 * 1024) {
      setErrorMessage('Audio file size exceeds 35MB. Please choose a smaller audio file.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setTrackTitle(file.name.replace(/\.[^/.]+$/, ''));
    setPresetId('custom');

    // Create local object URL for instant preview
    const objUrl = URL.createObjectURL(file);
    setPreviewAudioUrl(objUrl);
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile) {
      // Save preset or custom URL directly
      saveBgmSettings(trackUrl, trackTitle, presetId as any);
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);

    try {
      // Read file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        setUploadProgress(50);
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/bgm/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Data,
              fileName: selectedFile.name,
              trackTitle: trackTitle.trim() || selectedFile.name,
              volume,
              enabled,
              autoplay,
              presetId: 'custom'
            })
          });

          setUploadProgress(85);
          const data = await res.json();

          if (data.success && data.bgmConfig) {
            setUploadProgress(100);
            setUploadSuccessMsg('✅ Audio successfully uploaded and set as active background music on the website!');
            setSelectedFile(null);
            setTrackUrl(data.bgmConfig.trackUrl);
            setPresetId('custom');

            // Update context
            updateSettings({
              bgmConfig: data.bgmConfig
            });

            // Trigger bgmService with new uploaded audio
            bgmService.initFromConfig(data.bgmConfig);

            setTimeout(() => setUploadSuccessMsg(null), 5000);
          } else {
            throw new Error(data.error || 'Failed to upload audio file.');
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Server upload failed. Please try again.');
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read file from device.');
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error initiating upload.');
      setIsUploading(false);
    }
  };

  const saveBgmSettings = (newUrl: string, newTitle: string, newPreset: any) => {
    const updatedConfig: BgmConfig = {
      enabled,
      autoplay,
      volume,
      trackTitle: newTitle,
      trackUrl: newUrl,
      loop,
      presetId: newPreset,
      fileName: currentBgm.fileName
    };

    updateSettings({
      bgmConfig: updatedConfig
    });

    bgmService.initFromConfig(updatedConfig);
    setUploadSuccessMsg('✅ Background music settings saved permanently!');
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  const handleSelectPreset = (preset: typeof BGM_PRESETS[0]) => {
    setPresetId(preset.id);
    setTrackTitle(preset.name);
    setTrackUrl(preset.url);
    setSelectedFile(null);
    setPreviewAudioUrl(null);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    bgmService.setVolume(newVol);
  };

  const toggleTestPlay = () => {
    const isNowPlaying = bgmService.togglePlay();
    setIsPlayingTest(isNowPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Music className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">Website Background Music (BGM)</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}>
                  {enabled ? 'Active LIVE' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage background music that automatically plays in soft volume when players visit POP Gaming.
              </p>
            </div>
          </div>

          {/* Quick Live Preview Bar */}
          <div className="flex items-center gap-2 bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2">
            <button
              onClick={toggleTestPlay}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPlayingTest 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-bold' 
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
            >
              {isPlayingTest ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Playing Sound</span>
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-black animate-bounce rounded-full" />
                    <span className="w-0.5 h-2/3 bg-black animate-bounce rounded-full delay-75" />
                    <span className="w-0.5 h-4/5 bg-black animate-bounce rounded-full delay-150" />
                  </div>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Audio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {uploadSuccessMsg && (
        <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-xs font-medium animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/40 text-red-300 p-4 rounded-xl text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Master Switches & Volume Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle Switches Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Music Playback Controls
            </h4>
          </div>

          <div className="space-y-3">
            {/* Enable BGM switch */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">Enable Background Music</span>
                <span className="text-[11px] text-neutral-400">Turn on or off background sound across the whole website</span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Autoplay switch */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">Autoplay on Website Open</span>
                <span className="text-[11px] text-neutral-400">Play automatically when user opens the site (browser policy compliant)</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoplay(!autoplay)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoplay ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoplay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Loop switch */}
            <div className="flex items-center justify-between p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">Continuous Seamless Loop</span>
                <span className="text-[11px] text-neutral-400">Automatically repeat music when it reaches the end</span>
              </div>
              <button
                type="button"
                onClick={() => setLoop(!loop)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  loop ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    loop ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Volume Level Card ("Ekdam Dheemi Awaaz") */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Volume Adjustment ({Math.round(volume * 100)}%)
            </h4>
            <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {volume <= 0.15 ? '✨ Soft Ambient (Recommended)' : volume <= 0.35 ? 'Moderate' : 'High Energy'}
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <p className="text-xs text-neutral-400">
              Adjust default volume. For background atmosphere without disturbing the player, <strong className="text-neutral-200">10% - 20%</strong> is recommended.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1"><VolumeX className="w-3.5 h-3.5" /> 0%</span>
                <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
                <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> 100%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="1.0"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Quick volume presets */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: '5% Whisper', val: 0.05 },
                { label: '15% Soft ★', val: 0.15 },
                { label: '30% Medium', val: 0.30 },
                { label: '50% Loud', val: 0.50 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleVolumeChange(p.val)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    Math.abs(volume - p.val) < 0.03
                      ? 'bg-amber-500 text-black border-amber-400 font-bold shadow'
                      : 'bg-neutral-950/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Device Audio File Upload */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            Upload Sound Directly from Device (Direct Storage)
          </h4>
          <span className="text-[11px] text-neutral-400">MP3, WAV, OGG, M4A up to 35MB</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-emerald-500/60 bg-emerald-950/20'
              : 'border-neutral-700 hover:border-amber-500/50 bg-neutral-950/60 hover:bg-neutral-950/90'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              <FileAudio className="w-6 h-6" />
            </div>
            
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                <p className="text-xs text-emerald-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload & save permanently
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-200">
                  Click to select audio file from your phone or PC
                </p>
                <p className="text-xs text-neutral-400">
                  Select your custom Free Fire theme song, lobby track, or background sound
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected file preview player & track title */}
        {selectedFile && (
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-neutral-300">Soundtrack Display Title:</label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Free Fire Tournament Battle Anthem"
                />
              </div>

              {previewAudioUrl && (
                <div className="shrink-0 flex items-center gap-2 pt-4 sm:pt-0">
                  <audio src={previewAudioUrl} controls className="h-8 max-w-[200px]" />
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Uploading to server permanently...</span>
                  <span className="font-mono text-amber-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewAudioUrl(null);
                }}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleUploadAndSave}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save & Set as Website BGM'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Built-in Presets */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Curated Soundtrack Presets
          </h4>
          <span className="text-[11px] text-neutral-400">Choose from battle-ready themes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BGM_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = presetId === preset.id && !selectedFile;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-950 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white shrink-0 shadow`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{preset.name}</h5>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{preset.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {preset.badge}
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 hover:text-neutral-300">
                      Click to Select
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* External Audio URL / Custom Direct Link */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          Custom Direct Audio URL (Optional)
        </h4>
        <p className="text-xs text-neutral-400">
          You can also provide any direct HTTPS URL to an MP3 or audio stream:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={trackUrl}
              onChange={(e) => {
                setTrackUrl(e.target.value);
                setPresetId('custom');
              }}
              placeholder="https://example.com/audio/custom-soundtrack.mp3"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <input
              type="text"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Track Title"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Save Settings Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Active Track: <strong className="text-white">{trackTitle}</strong> ({Math.round(volume * 100)}% Volume)</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              // Reset to default Free Fire anthem
              const def = BGM_PRESETS[0];
              setPresetId(def.id);
              setTrackTitle(def.name);
              setTrackUrl(def.url);
              setVolume(0.15);
              setEnabled(true);
              setAutoplay(true);
              saveBgmSettings(def.url, def.name, def.id);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
          <button
            type="button"
            onClick={() => saveBgmSettings(trackUrl, trackTitle, presetId)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            Apply & Save to Website
          </button>
        </div>
      </div>
    </div>
  );
};
