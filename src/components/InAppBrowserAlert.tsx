import React, { useState, useEffect } from 'react';
import { Globe, AlertTriangle, X, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';

export const InAppBrowserAlert: React.FC = () => {
  const { language } = useTournaments();
  const [isInApp, setIsInApp] = useState(false);
  const [browserName, setBrowserName] = useState('In-App Browser');
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const isInstagram = ua.indexOf('Instagram') > -1;
    const isFB = ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
    const isWhatsApp = ua.indexOf('WhatsApp') > -1;
    const isLine = ua.indexOf('Line') > -1;
    const isTikTok = ua.indexOf('musical_ly') > -1 || ua.indexOf('ByteLocale') > -1;

    if (isInstagram) {
      setIsInApp(true);
      setBrowserName('Instagram Browser');
    } else if (isFB) {
      setIsInApp(true);
      setBrowserName('Facebook Browser');
    } else if (isWhatsApp) {
      setIsInApp(true);
      setBrowserName('WhatsApp Webview');
    } else if (isLine || isTikTok) {
      setIsInApp(true);
      setBrowserName('In-App Browser');
    }
  }, []);

  if (!isInApp || dismissed) return null;

  const currentUrl = window.location.href;

  const handleOpenChrome = () => {
    // Attempt intent url for Android Chrome
    const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
    const chromeIntent = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    
    // Also copy link as immediate fallback
    try {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      // ignore
    }

    // Try navigating to Chrome intent
    window.location.href = chromeIntent;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isHindi = language === 'hi';

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-3 sm:px-4 py-2.5 shadow-lg border-b border-orange-400/40 relative z-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="p-1 bg-black/20 rounded-full shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
          </span>
          <div>
            <span className="font-bold text-amber-100 uppercase tracking-wider text-[11px] mr-1.5">
              [{browserName}]
            </span>
            <span>
              {isHindi 
                ? 'इंस्टाग्राम / इन-ऐप ब्राउज़र में लॉगिन OTP या UPI में दिक्कत आ सकती है। बेस्ट अनुभव के लिए Chrome में खोलें!'
                : 'In-app browser detected. For smooth OTP login & instant UPI payments, please open in Google Chrome!'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenChrome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-900 hover:bg-orange-50 font-bold rounded-lg shadow transition active:scale-95 text-xs"
          >
            <Globe className="w-3.5 h-3.5 text-orange-600" />
            <span>{isHindi ? 'Chrome में खोलें' : 'Open in Chrome'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black/30 hover:bg-black/40 text-white rounded-lg transition text-xs font-medium"
            title="Copy Website Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isHindi ? 'कॉपी हो गया' : 'Copied!') : (isHindi ? 'लिंक कॉपी' : 'Copy Link')}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-black/20 rounded-md text-white/80 hover:text-white transition"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
