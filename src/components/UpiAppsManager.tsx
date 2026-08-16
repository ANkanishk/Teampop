import React, { useState } from 'react';
import { 
  Smartphone, 
  Upload, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Save, 
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Layers
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { UpiAppConfig } from '../types';
import { 
  INITIAL_UPI_APPS, 
  buildUpiDeepLink,
  DEFAULT_POP_LOGO_SVG,
  DEFAULT_PHONEPE_LOGO_SVG,
  DEFAULT_PAYTM_LOGO_SVG,
  DEFAULT_GPAY_LOGO_SVG,
  DEFAULT_ANY_UPI_LOGO_SVG
} from '../data/upiAppsData';

export const UpiAppsManager: React.FC = () => {
  const { settings, updateSettings } = useTournaments();
  
  const currentApps: UpiAppConfig[] = settings.upiApps && settings.upiApps.length > 0 
    ? settings.upiApps 
    : INITIAL_UPI_APPS;

  const [apps, setApps] = useState<UpiAppConfig[]>(currentApps);
  const [selectedAppId, setSelectedAppId] = useState<string>(currentApps[0]?.id || 'pop');
  const [testAmount, setTestAmount] = useState<number>(50);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [customImageError, setCustomImageError] = useState<string | null>(null);

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];

  const handleUpdateApp = (appId: string, updates: Partial<UpiAppConfig>) => {
    setApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, ...updates } : app))
    );
  };

  const handleToggleEnabled = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, enabled: !app.enabled } : app))
    );
  };

  const handleImageUpload = (appId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCustomImageError(null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCustomImageError('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateApp(appId, { logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = (appId: string) => {
    const defaultItem = INITIAL_UPI_APPS.find((a) => a.id === appId);
    if (defaultItem) {
      handleUpdateApp(appId, {
        name: defaultItem.name,
        shortName: defaultItem.shortName,
        tagline: defaultItem.tagline,
        logoUrl: defaultItem.logoUrl,
        customUpiId: '',
        packageScheme: defaultItem.packageScheme,
        colorTheme: defaultItem.colorTheme,
        badgeText: defaultItem.badgeText,
        enabled: true,
      });
    }
  };

  const handleResetAllToDefaults = () => {
    if (window.confirm('Reset all 4 UPI apps + Universal Phone UPI App to original default logos and settings?')) {
      setApps(INITIAL_UPI_APPS);
      updateSettings({ upiApps: INITIAL_UPI_APPS });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSaveAll = () => {
    updateSettings({ upiApps: apps });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentDeepLink = selectedApp
    ? buildUpiDeepLink(
        selectedApp,
        settings.upiId || 'wepopearn@oksbi',
        settings.upiName || 'POP Gaming',
        testAmount,
        'DEMO-99'
      )
    : '';

  return (
    <div id="upi-apps-manager" className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-orange-950/40 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs">
              Direct UPI Gateway
            </span>
            <span className="text-xs text-neutral-400 font-medium">Customizable App Logos & Intents</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            UPI Apps & Universal Phone Pay Configuration
          </h2>
          <p className="text-xs text-neutral-400 max-w-2xl mt-1 leading-relaxed">
            Manage the 4 individual UPI apps (<strong className="text-neutral-200">POP UPI</strong>, <strong className="text-purple-400">PhonePe</strong>, <strong className="text-sky-400">Paytm</strong>, <strong className="text-emerald-400">Google Pay</strong>) plus the <strong className="text-amber-400">Universal UPI App</strong> option that lets players pay with whatever UPI app is installed on their phone with the exact game entry amount.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetAllToDefaults}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition cursor-pointer"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved Live!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>UPI App configurations and logos updated successfully in real-time.</span>
        </div>
      )}

      {/* Grid of UPI Apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {apps.map((app) => {
          const isSelected = app.id === selectedAppId;
          return (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900 border-orange-500 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/50'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              {/* App Status Indicator */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    app.enabled
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                  }`}
                >
                  {app.enabled ? 'Active in Lobby' : 'Hidden'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleEnabled(app.id);
                  }}
                  className={`text-[11px] font-bold transition px-2 py-0.5 rounded-md ${
                    app.enabled ? 'text-neutral-400 hover:text-amber-400' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {app.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {/* Logo & Info */}
              <div className="flex flex-col items-center text-center space-y-2.5 my-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-neutral-700/60 bg-neutral-950 flex items-center justify-center p-1">
                  {app.logoUrl ? (
                    <img
                      src={app.logoUrl}
                      alt={app.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Smartphone className="w-8 h-8 text-neutral-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">{app.name}</h3>
                  <p className="text-[11px] text-neutral-400 truncate max-w-[150px]">{app.tagline}</p>
                </div>
              </div>

              {/* Footer / Badge */}
              <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                <span className="text-neutral-500 font-mono">#{app.id}</span>
                {app.badgeText && (
                  <span className="font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                    {app.badgeText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected App Configuration Studio */}
      {selectedApp && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-700 flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={selectedApp.logoUrl}
                  alt={selectedApp.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Editing: {selectedApp.name} ({selectedApp.shortName})
                </h3>
                <p className="text-xs text-neutral-400">
                  Update app icon, title, deep-link scheme, or assign a unique merchant UPI ID.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetToDefault(selectedApp.id)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset This App</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Image / Logo Management */}
            <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
              <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>App Logo / Icon Image</span>
              </h4>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-orange-500/40 p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                  <img
                    src={selectedApp.logoUrl}
                    alt={selectedApp.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="space-y-2 flex-grow">
                  <label className="block px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white cursor-pointer transition text-center">
                    <span>Upload New Icon / Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(selectedApp.id, e)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-neutral-500">
                    Supports PNG, JPG, JPEG, SVG or WebP up to 5MB.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Or Paste Direct Image URL / Data URI
                </label>
                <input
                  type="text"
                  placeholder="https://... or data:image/..."
                  value={selectedApp.logoUrl || ''}
                  onChange={(e) => handleUpdateApp(selectedApp.id, { logoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              {customImageError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{customImageError}</span>
                </div>
              )}
            </div>

            {/* Right Column: App Display Settings & Deep Link */}
            <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
              <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Text & UPI Intent Settings</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={selectedApp.name}
                    onChange={(e) => handleUpdateApp(selectedApp.id, { name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Short Name *
                  </label>
                  <input
                    type="text"
                    value={selectedApp.shortName}
                    onChange={(e) => handleUpdateApp(selectedApp.id, { shortName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tagline / Subtext
                </label>
                <input
                  type="text"
                  value={selectedApp.tagline}
                  onChange={(e) => handleUpdateApp(selectedApp.id, { tagline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom UPI ID Override (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Leave blank to use default (${settings.upiId || 'wepopearn@oksbi'})`}
                  value={selectedApp.customUpiId || ''}
                  onChange={(e) => handleUpdateApp(selectedApp.id, { customUpiId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={selectedApp.badgeText || ''}
                    onChange={(e) => handleUpdateApp(selectedApp.id, { badgeText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Brand Color Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedApp.colorTheme || '#FF5E3A'}
                      onChange={(e) => handleUpdateApp(selectedApp.id, { colorTheme: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={selectedApp.colorTheme || '#FF5E3A'}
                      onChange={(e) => handleUpdateApp(selectedApp.id, { colorTheme: e.target.value })}
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Intent & Amount Test Simulator */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold text-white uppercase">
                  Live UPI Deep-Link Intent Tester (₹{testAmount})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 font-semibold">Test Entry Amount:</span>
                {[20, 50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTestAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      testAmount === amt
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 overflow-hidden">
              <div className="font-mono text-xs text-emerald-400 truncate select-all">
                {currentDeepLink}
              </div>
              <a
                href={currentDeepLink}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition"
              >
                <span>Launch UPI App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When a tournament participant clicks on this app inside the Registration Modal, their phone will open <strong>{selectedApp.name}</strong> with the exact match entry fee of <strong>₹{testAmount}</strong> pre-filled, so they don't have to type the amount manually.
            </p>
          </div>
        </div>
      )}

      {/* Universal Phone UPI Feature Explainer */}
      <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Universal Phone UPI App Support Enabled</h4>
            <p className="text-xs text-neutral-300 mt-0.5">
              Players on Android / iOS can pay using Cred, BHIM, Amazon Pay, MobiKwik, Jupiter, or their local bank UPI app with 1 tap.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 flex-shrink-0 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
};
