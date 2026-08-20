import React, { useState } from 'react';
import { Play, X, Video } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

interface HowToPlayVideoGuideProps {
  variant?: 'banner' | 'modal' | 'compact';
  videoType?: 'general' | 'login';
}

export function getEmbedUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // YouTube Shorts (e.g., https://youtube.com/shorts/VIDEO_ID?...)
  if (trimmed.includes('youtube.com/shorts/')) {
    const parts = trimmed.split('youtube.com/shorts/');
    const id = parts[1]?.split(/[?&#/]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  // youtu.be shortlinks (e.g., https://youtu.be/VIDEO_ID?...)
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/');
    const id = parts[1]?.split(/[?&#/]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  // Standard watch?v= links or m.youtube.com
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const v = urlObj.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
    } catch (_) {
      const match = trimmed.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
  }

  // Already an embed link
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed.includes('autoplay=1') ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}autoplay=1`;
  }

  return trimmed;
}

export const HowToPlayVideoGuide: React.FC<HowToPlayVideoGuideProps> = ({ 
  variant = 'banner',
  videoType = 'general'
}) => {
  const { settings } = useTournaments();
  const [isPlaying, setIsPlaying] = useState(false);

  const rawUrl = videoType === 'login' 
    ? (settings.loginTutorialVideoUrl || settings.tutorialVideoUrl || '')
    : (settings.tutorialVideoUrl || '');

  // If no video URL is configured, return nothing or provide default
  const effectiveUrl = rawUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const embedUrl = getEmbedUrl(effectiveUrl);
  const isYouTube = effectiveUrl.includes('youtube.com') || effectiveUrl.includes('youtu.be');
  const isDirectVideo = !isYouTube && (effectiveUrl.endsWith('.mp4') || effectiveUrl.endsWith('.webm') || effectiveUrl.endsWith('.mov') || effectiveUrl.includes('/uploads/') || effectiveUrl.startsWith('data:video') || effectiveUrl.startsWith('blob:'));

  if (variant === 'compact') {
    return (
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-neutral-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg">
              <Play className="w-3.5 h-3.5 fill-orange-400" />
            </span>
            <span className="font-bold text-white text-xs">
              Guide Video
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer"
          >
            {isPlaying ? 'Close' : 'Watch Video'}
          </button>
        </div>

        {isPlaying && (
          <div className="mt-2.5 w-full aspect-video max-w-full rounded-xl overflow-hidden border border-orange-500/30 bg-black relative flex items-center justify-center">
            {isDirectVideo ? (
              <video 
                src={effectiveUrl} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full max-h-[70vh] object-contain mx-auto bg-black" 
              />
            ) : (
              <iframe
                src={embedUrl}
                title="Tutorial Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 fill-orange-400" />
          </div>
          <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            Video Guide
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-orange-600/20 cursor-pointer active:scale-95 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isPlaying ? 'Close' : 'Watch Video'}</span>
        </button>
      </div>

      {isPlaying && (
        <div className="mt-3 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-neutral-700/90 bg-black relative shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/90 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-bold text-orange-400 flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-orange-400" />
              Tutorial Video Player
            </span>
            <button
              onClick={() => setIsPlaying(false)}
              className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              aria-label="Close Video"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          
          <div className="w-full aspect-video min-h-[220px] sm:min-h-[380px] bg-black flex items-center justify-center relative">
            {isDirectVideo ? (
              <video 
                src={effectiveUrl} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full max-h-[80vh] object-contain mx-auto bg-black" 
              />
            ) : (
              <iframe
                src={embedUrl}
                title="Tutorial Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
