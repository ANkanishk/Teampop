import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  QrCode, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Layers, 
  Smartphone,
  ExternalLink,
  Edit3,
  Check,
  AlertCircle
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { SlideItem, PromoBanner, GameModeId } from '../types';

export const MediaBannersManager: React.FC = () => {
  const { settings, updateSettings, matches, updateMatch } = useTournaments();
  const [activeMediaSection, setActiveMediaSection] = useState<'LOGO_BRANDING' | 'QR_CODE' | 'HERO_SLIDES' | 'PROMO_BANNERS' | 'MATCH_THUMBNAILS'>('LOGO_BRANDING');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Logo temporary state
  const [tempLogoUrl, setTempLogoUrl] = useState(settings.appLogo || '');

  // QR Code temporary edit states
  const [tempQrUrl, setTempQrUrl] = useState(settings.qrCodeImageUrl || '');
  const [tempUpiId, setTempUpiId] = useState(settings.upiId || '');
  const [tempUpiName, setTempUpiName] = useState(settings.upiName || '');

  // Hero slides
  const slides = settings.heroSlides || [];
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);

  // Promo Banners
  const promoBanners = settings.promoBanners || [];
  const [editingPromo, setEditingPromo] = useState<PromoBanner | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Upload image handler converting to base64 Data URL for instant persistence & preview
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    callback: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // QR Code Save
  const handleSaveQrSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      qrCodeImageUrl: tempQrUrl,
      upiId: tempUpiId,
      upiName: tempUpiName,
    });
    showNotification('UPI QR Code & Merchant Settings Updated Successfully!');
  };

  // Slide Save / Update
  const handleSaveSlide = (updatedSlide: SlideItem) => {
    const exists = slides.some((s) => s.id === updatedSlide.id);
    let newSlides: SlideItem[];
    if (exists) {
      newSlides = slides.map((s) => (s.id === updatedSlide.id ? updatedSlide : s));
    } else {
      newSlides = [updatedSlide, ...slides];
    }
    updateSettings({ heroSlides: newSlides });
    setEditingSlide(null);
    showNotification('Hero Slide Updated Successfully!');
  };

  const handleDeleteSlide = (slideId: string) => {
    if (slides.length <= 1) {
      alert('You must keep at least 1 hero banner on the homepage.');
      return;
    }
    const newSlides = slides.filter((s) => s.id !== slideId);
    updateSettings({ heroSlides: newSlides });
    showNotification('Slide Removed Successfully!');
  };

  // Promo Banner Save / Update
  const handleSavePromo = (updatedPromo: PromoBanner) => {
    const exists = promoBanners.some((p) => p.id === updatedPromo.id);
    let newPromos: PromoBanner[];
    if (exists) {
      newPromos = promoBanners.map((p) => (p.id === updatedPromo.id ? updatedPromo : p));
    } else {
      newPromos = [updatedPromo, ...promoBanners];
    }
    updateSettings({ promoBanners: newPromos });
    setEditingPromo(null);
    showNotification('Promotional Tournament Banner Updated!');
  };

  const handleDeletePromo = (promoId: string) => {
    if (promoBanners.length <= 1) {
      alert('You must keep at least 1 promotional event banner.');
      return;
    }
    const newPromos = promoBanners.filter((p) => p.id !== promoId);
    updateSettings({ promoBanners: newPromos });
    showNotification('Promo Banner Removed Successfully!');
  };

  return (
    <div id="media-banners-manager" className="space-y-6">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveMediaSection('LOGO_BRANDING')}
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMediaSection === 'LOGO_BRANDING'
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Website Logo</span>
        </button>

        <button
          onClick={() => setActiveMediaSection('QR_CODE')}
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMediaSection === 'QR_CODE'
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>UPI QR Code</span>
        </button>

        <button
          onClick={() => setActiveMediaSection('HERO_SLIDES')}
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMediaSection === 'HERO_SLIDES'
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slider ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveMediaSection('PROMO_BANNERS')}
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMediaSection === 'PROMO_BANNERS'
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Promo Banners ({promoBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveMediaSection('MATCH_THUMBNAILS')}
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMediaSection === 'MATCH_THUMBNAILS'
              ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Match Cards ({matches.length})</span>
        </button>
      </div>

      {/* SECTION 0: WEBSITE LOGO & BRANDING */}
      {activeMediaSection === 'LOGO_BRANDING' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Website Logo & Esports Emblem
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                LIVE ON NAVBAR & RECEIPTS
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Upload your custom gaming logo directly from your device (PNG, JPG, SVG, WebP). It replaces the default logo across the entire website instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Logo Preview */}
            <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Navbar Preview
              </span>

              {/* Preview in mock navbar container */}
              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 w-full flex items-center gap-3">
                {tempLogoUrl ? (
                  <img
                    src={tempLogoUrl}
                    alt="Custom Logo"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain rounded-xl border border-orange-500/30 bg-neutral-950 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white">
                    POP
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-black text-white">POP<span className="text-orange-500">GAMING</span></div>
                  <div className="text-[10px] text-neutral-400 font-medium">Free Fire MAX Competitive Arena</div>
                </div>
              </div>

              {/* Upload From Device Button */}
              <label className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-orange-600/20">
                <Upload className="w-4 h-4" />
                <span>Upload Logo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setTempLogoUrl(dataUrl))}
                  className="hidden"
                />
              </label>

              {tempLogoUrl && (
                <button
                  type="button"
                  onClick={() => setTempLogoUrl('')}
                  className="text-xs text-neutral-400 hover:text-red-400 underline cursor-pointer"
                >
                  Reset to Default Logo
                </button>
              )}
            </div>

            {/* Logo Settings & Direct Link Input */}
            <div className="lg:col-span-7 bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase">Logo Configuration</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400">Image URL or Base64 Data</label>
                <input
                  type="text"
                  placeholder="https://... or uploaded image"
                  value={tempLogoUrl}
                  onChange={(e) => setTempLogoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs text-neutral-400">
                <p className="font-bold text-white">Recommended Logo Specs:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Square or transparent PNG (e.g. 512x512 px)</li>
                  <li>Max file size: 5MB</li>
                  <li>Displays in Navbar, Registration Invoice, and Email headers</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateSettings({ appLogo: tempLogoUrl });
                  showNotification('Website Logo Saved & Published Successfully!');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Save & Apply Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: UPI QR CODE CUSTOMIZATION */}
      {activeMediaSection === 'QR_CODE' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                UPI QR Code & Payment Branding
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                LIVE ON REGISTRATION MODAL
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Upload your PhonePe, Google Pay, Paytm, or BHIM Merchant QR code. Players will scan this exact image when joining matches.
            </p>
          </div>

          <form onSubmit={handleSaveQrSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live QR Preview Card */}
            <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Live Player Preview
              </span>

              <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-orange-500/30 inline-block">
                <img
                  src={tempQrUrl || settings.qrCodeImageUrl}
                  alt="Official Merchant QR Code"
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>

              <div className="w-full bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
                <p className="text-xs font-black text-white truncate">{tempUpiName || settings.upiName}</p>
                <p className="font-mono text-[11px] text-orange-400 font-bold truncate mt-0.5">
                  {tempUpiId || settings.upiId}
                </p>
              </div>

              {/* Upload New QR Button */}
              <label className="w-full py-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>Upload QR Image from Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (dataUrl) => setTempQrUrl(dataUrl))}
                  className="hidden"
                />
              </label>
            </div>

            {/* Edit Fields */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1.5">
                  QR Code Image Web URL or Base64 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or upload above"
                  value={tempQrUrl}
                  onChange={(e) => setTempQrUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Tip: Use the "Upload QR Image" button to pick from your local device directly.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1.5">
                    Official Merchant UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. wepopearn@okhdfcbank"
                    value={tempUpiId}
                    onChange={(e) => setTempUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1.5">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="POP Gaming Tournaments"
                    value={tempUpiName}
                    onChange={(e) => setTempUpiName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <strong className="text-white block">Security & Accuracy Checklist:</strong>
                <p>• Verify that the uploaded QR code accurately matches the merchant UPI ID above.</p>
                <p>• All tournament players scan this code during step 2 of match registration.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 cursor-pointer transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save and Update QR Code Across Website</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: HERO SLIDER BANNERS */}
      {activeMediaSection === 'HERO_SLIDES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  Homepage Hero Slider Banners
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  {slides.length} ACTIVE SLIDES
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Change titles, subtitles, call-to-actions, and background wallpapers displayed at the very top of the homepage.
              </p>
            </div>

            <button
              onClick={() =>
                setEditingSlide({
                  id: `slide-${Date.now()}`,
                  title: 'NEW ESPORTS TOURNAMENT',
                  subtitle: 'DAILY CUSTOM ROOMS & CASH REWARDS',
                  description: 'Join the daily Free Fire battle royale tournament lobbies. Instant UPI payout settlement.',
                  ctaText: 'Browse Tournaments',
                  ctaAction: 'tournaments',
                  badge: 'SEASON SPECIAL',
                  image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
                  accentColor: '#f97316',
                  highlightText: 'INSTANT REWARDS',
                })
              }
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Banner Image Preview */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-neutral-800 group">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-between">
                      <span className="self-start px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-black text-orange-400">
                        Slide #{idx + 1} • {slide.badge}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                          {slide.subtitle}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white truncate">
                          {slide.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2">{slide.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3">
                  <span className="text-[11px] font-bold text-neutral-500 font-mono">
                    CTA: {slide.ctaText}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: PROMO EVENT BANNERS */}
      {activeMediaSection === 'PROMO_BANNERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  Featured Special Tournament Banners
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  {promoBanners.length} PROMOS
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Curate high-stakes featured banners (*Bermuda Volcanic Carnage*, *Iron Cage*, *Squad Warfare*, *Invitational*).
              </p>
            </div>

            <button
              onClick={() =>
                setEditingPromo({
                  id: `promo-${Date.now()}`,
                  title: 'NEW FEATURED CHAMPIONSHIP',
                  tagline: 'HIGH REWARDS • LIMITED SLOTS',
                  description: 'High adrenaline Free Fire MAX tournament with verified payouts and instant slot booking.',
                  badge: 'FEATURED',
                  themeColor: 'from-orange-600 via-amber-600 to-red-700',
                  entryFee: 100,
                  prizePool: '₹5,000 GTD',
                  gameMode: 'solo-br',
                  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
                  aiPromptSummary: 'Free Fire warriors in glowing cyber armor with neon weapons',
                  scheduleText: 'Live Tonight • 9:30 PM IST',
                  features: ['Instant UPI Payout', 'Per-Kill Cash Bounty', 'Fair Play Audit'],
                })
              }
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Promo Banner</span>
            </button>
          </div>

          {/* Promos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promoBanners.map((promo) => (
              <div
                key={promo.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-neutral-800 group">
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-black text-orange-400">
                          {promo.badge}
                        </span>
                        <span className="text-xs font-black text-emerald-400 bg-black/80 px-2 py-0.5 rounded-lg font-mono">
                          {promo.prizePool}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                          {promo.tagline}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white truncate">
                          {promo.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2">{promo.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3">
                  <span className="text-xs font-black text-white font-mono">
                    Entry: ₹{promo.entryFee}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPromo(promo)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: MATCH CARD THUMBNAILS */}
      {activeMediaSection === 'MATCH_THUMBNAILS' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Individual Tournament Card Thumbnails
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Customize or replace background artwork images for any live or scheduled match in the lobby.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden p-4 space-y-3"
              >
                <div className="relative h-32 rounded-2xl overflow-hidden border border-neutral-800">
                  <img
                    src={m.bannerImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'}
                    alt={m.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 to-transparent p-3 flex flex-col justify-end">
                    <span className="font-mono text-[10px] text-orange-400 font-bold">{m.matchCode}</span>
                    <h4 className="text-xs font-black text-white truncate">{m.title}</h4>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase">
                    Change Artwork / Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={m.bannerImage || ''}
                      onChange={(e) => updateMatch(m.id, { bannerImage: e.target.value })}
                      placeholder="Paste Image URL..."
                      className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <label className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, (dataUrl) => updateMatch(m.id, { bannerImage: dataUrl }))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT SLIDE MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white uppercase">
              Edit Hero Slide ({editingSlide.title})
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Image Preview & Upload */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">Slide Wallpaper Image *</label>
                <div className="h-36 rounded-2xl overflow-hidden border border-neutral-800 mb-2 relative">
                  <img
                    src={editingSlide.image}
                    alt="Slide preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingSlide.image}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    placeholder="https://... or upload"
                    className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono"
                  />
                  <label className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) => setEditingSlide({ ...editingSlide, image: dataUrl }))
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Main Heading / Title</label>
                  <input
                    type="text"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={editingSlide.subtitle}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingSlide.description}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingSlide.badge}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveSlide(editingSlide)}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs cursor-pointer"
              >
                Save Slide Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROMO BANNER MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white uppercase">
              Edit Promo Banner ({editingPromo.title})
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Image Preview & Upload */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">Promo Wallpaper Image *</label>
                <div className="h-36 rounded-2xl overflow-hidden border border-neutral-800 mb-2 relative">
                  <img
                    src={editingPromo.imageUrl}
                    alt="Promo preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPromo.imageUrl}
                    onChange={(e) => setEditingPromo({ ...editingPromo, imageUrl: e.target.value })}
                    placeholder="https://... or upload"
                    className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono"
                  />
                  <label className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, (dataUrl) => setEditingPromo({ ...editingPromo, imageUrl: dataUrl }))
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Promo Title</label>
                  <input
                    type="text"
                    value={editingPromo.title}
                    onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingPromo.tagline}
                    onChange={(e) => setEditingPromo({ ...editingPromo, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={editingPromo.entryFee}
                    onChange={(e) => setEditingPromo({ ...editingPromo, entryFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Prize Pool Text</label>
                  <input
                    type="text"
                    value={editingPromo.prizePool}
                    onChange={(e) => setEditingPromo({ ...editingPromo, prizePool: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Schedule Text</label>
                <input
                  type="text"
                  value={editingPromo.scheduleText}
                  onChange={(e) => setEditingPromo({ ...editingPromo, scheduleText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPromo(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePromo(editingPromo)}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs cursor-pointer"
              >
                Save Promo Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
