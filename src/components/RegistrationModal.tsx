import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  QrCode, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Smartphone, 
  ExternalLink, 
  Flame, 
  CheckCircle2, 
  Users,
  Mail,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Match, GameModeId, UpiAppConfig } from '../types';
import { useTournaments } from '../context/TournamentContext';
import { getPerKillReward, calculateBRPlacementRewards } from '../data/tournamentData';
import { INITIAL_UPI_APPS, buildUpiDeepLink } from '../data/upiAppsData';

export const triggerConfettiCelebration = () => {
  try {
    const end = Date.now() + 1.6 * 1000;
    const colors = ['#ea580c', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#ffffff'];

    // Initial big blast
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      disableForReducedMotion: true,
    });

    // Continuous side cannons
    const interval: any = setInterval(function() {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: colors,
        disableForReducedMotion: true,
      });
    }, 250);
  } catch (_) {}
};

interface RegistrationModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: (regId: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  match,
  onClose,
  onSuccess,
}) => {
  const { settings, submitRegistration, currentUser } = useTournaments();
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form State
  const isTeam = match.gameMode.includes('duo') || match.gameMode.includes('squad') || match.gameMode.includes('cs-2v2') || match.gameMode.includes('cs-4v4');
  const isLoneWolf = match.gameMode.includes('lone-wolf') || match.gameMode === 'cs-1v1' || match.gameMode === 'headshot-mode';
  const teamSize = match.gameMode.includes('duo') || match.gameMode.includes('cs-2v2') ? 2 : match.gameMode.includes('squad') || match.gameMode.includes('cs-4v4') ? 4 : 1;

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState(currentUser?.displayName || '');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainEmail, setCaptainEmail] = useState(currentUser?.email || '');

  // Players list
  const [players, setPlayers] = useState(
    Array.from({ length: teamSize }, (_, idx) => ({
      playerName: '',
      inGameName: '',
      gameUid: '',
      phone: '',
    }))
  );

  // Payment state
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>('');
  const [createdRegId, setCreatedRegId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const placementPrizes = calculateBRPlacementRewards(match.entryFee);
  const killBounty = isLoneWolf ? 0 : getPerKillReward(match.entryFee);

  const handlePlayerChange = (index: number, field: string, value: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId || 'wepopearn@oksbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('wepopearn@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!captainName.trim()) {
      setFormError('Please enter Captain / Player Name.');
      return;
    }
    if (!captainPhone.trim() || captainPhone.length < 10) {
      setFormError('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (isTeam && !teamName.trim()) {
      setFormError('Please enter your Team / Clan Name.');
      return;
    }

    for (let i = 0; i < teamSize; i++) {
      const p = players[i];
      if (!p.inGameName.trim()) {
        setFormError(`Please enter In-Game Name for Player ${i + 1}.`);
        return;
      }
      if (!p.gameUid.trim() || p.gameUid.length < 8) {
        setFormError(`Please enter a valid Free Fire Game UID for Player ${i + 1}.`);
        return;
      }
    }

    setStep('PAYMENT');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!utrNumber.trim() || utrNumber.length < 6) {
      setFormError('Please enter the 12-digit UPI Reference / UTR Number from your payment app.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reg = await submitRegistration({
        matchId: match.id,
        gameMode: match.gameMode,
        entryFee: match.entryFee,
        teamName: isTeam ? teamName : undefined,
        captainName,
        captainPhone,
        captainEmail,
        players,
        paymentMethod: 'UPI_QR',
        utrNumber,
        paymentScreenshotUrl: paymentScreenshotUrl || undefined,
      });

      setCreatedRegId(reg.id);

      // Trigger automatic email alert to admin email wepopearn@gmail.com
      try {
        fetch('/api/notifications/payment-submitted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: reg.id,
            matchTitle: match.title,
            entryFee: match.entryFee,
            totalPayable: match.entryFee,
            utrNumber,
            captainName,
            captainPhone,
            captainEmail,
            players,
          }),
        }).catch(() => {});
      } catch (_) {}

      setStep('SUCCESS');
      triggerConfettiCelebration();
    } catch (err: any) {
      setFormError('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPI Deep Link strings
  const upiId = settings.upiId || 'wepopearn@oksbi';
  const merchantName = settings.upiName || 'POP Gaming';
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${match.entryFee}&cu=INR&tn=${encodeURIComponent('POP FF Match ' + match.matchCode)}`;
  const gpayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${match.entryFee}&cu=INR&tn=${encodeURIComponent('POP Match ' + match.matchCode)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${match.entryFee}&cu=INR&tn=${encodeURIComponent('POP Match ' + match.matchCode)}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${match.entryFee}&cu=INR&tn=${encodeURIComponent('POP Match ' + match.matchCode)}`;

  // Email Mailto content
  const adminEmail = 'wepopearn@gmail.com';
  const emailSubject = encodeURIComponent(`Free Fire Match Payment - ${createdRegId || 'POP-REG'} - ${match.title}`);
  const emailBody = encodeURIComponent(
    `Hello POP Gaming Admin,\n\nI have completed the payment of ₹${match.entryFee} for Free Fire Tournament.\n\n` +
    `Registration ID: ${createdRegId}\n` +
    `Match: ${match.title} (${match.matchCode})\n` +
    `Captain / Player: ${captainName} (${captainPhone})\n` +
    `Free Fire UID: ${players[0]?.gameUid || 'N/A'}\n` +
    `In-Game Name: ${players[0]?.inGameName || 'N/A'}\n` +
    `UPI UTR / Reference ID: ${utrNumber}\n\n` +
    `Please verify and approve my slot.\nThank you!`
  );
  const emailMailtoUrl = `mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div 
      id="modal-registration" 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {match.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{match.matchCode}</span>
                <span>•</span>
                <span className="text-orange-400 font-bold">Entry: ₹{match.entryFee}</span>
                {isLoneWolf && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px]">
                    150% Winner Payout (₹{Math.round(match.entryFee * 1.5)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-2 ${step === 'DETAILS' ? 'text-orange-400' : 'text-emerald-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-neutral-800 text-[10px] font-bold border border-current">
              1
            </span>
            <span>Player Details</span>
          </div>

          <div className="w-12 h-0.5 bg-neutral-800" />

          <div className={`flex items-center gap-2 ${step === 'PAYMENT' ? 'text-orange-400' : step === 'SUCCESS' ? 'text-emerald-400' : 'text-neutral-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-neutral-800 text-[10px] font-bold border border-current">
              2
            </span>
            <span>UPI Apps & Payment</span>
          </div>

          <div className="w-12 h-0.5 bg-neutral-800" />

          <div className={`flex items-center gap-2 ${step === 'SUCCESS' ? 'text-emerald-400' : 'text-neutral-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-neutral-800 text-[10px] font-bold border border-current">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {formError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: PLAYER & ROSTER DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Prize Pool breakdown banner */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Match Prize Structure</span>
                  <span className="font-bold text-orange-400">
                    {isLoneWolf ? '150% Winner Return Guarantee' : `Kill Bounty: ₹${killBounty}/kill`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">1st Place Winner</span>
                    <span className="font-black text-emerald-400">
                      ₹{isLoneWolf ? Math.round(match.entryFee * 1.5) : placementPrizes.first}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">
                      {isLoneWolf ? 'Format' : '2nd Place'}
                    </span>
                    <span className="font-bold text-neutral-200">
                      {isLoneWolf ? '1v1 Duel' : `₹${placementPrizes.second}`}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">
                      {isLoneWolf ? 'Kill Bounty' : '3rd Place'}
                    </span>
                    <span className="font-bold text-neutral-200">
                      {isLoneWolf ? '₹0 (100% Payout)' : `₹${placementPrizes.third}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Information if applicable */}
              {isTeam && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                    Team Information ({teamSize} Players Required)
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Team / Clan Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TOTAL GAMING ESPORTS"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Primary Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                  Captain / Primary Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Kumar"
                      value={captainName}
                      onChange={(e) => {
                        setCaptainName(e.target.value);
                        handlePlayerChange(0, 'playerName', e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit WhatsApp number"
                      value={captainPhone}
                      onChange={(e) => {
                        setCaptainPhone(e.target.value);
                        handlePlayerChange(0, 'phone', e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1">
                      <span>Email Address (For Slot Approval & Receipts) *</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Auto Email Dispatched on Approval</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={captainEmail}
                      onChange={(e) => {
                        setCaptainEmail(e.target.value);
                        handlePlayerChange(0, 'email', e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Individual Players List */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                  Player Roster & Game UIDs
                </h4>

                {players.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                      <span>Player {idx + 1} {idx === 0 ? '(Captain / Lead)' : ''}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                          Free Fire In-Game Name (IGN) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 亗RASTAR亗"
                          value={p.inGameName}
                          onChange={(e) => handlePlayerChange(idx, 'inGameName', e.target.value)}
                          className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                          Free Fire Game UID (8-10 digits) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1928374619"
                          value={p.gameUid}
                          onChange={(e) => handlePlayerChange(idx, 'gameUid', e.target.value)}
                          className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  <span>Proceed to Payment (₹{match.entryFee})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT INSTRUCTIONS & UPI APPS */}
          {step === 'PAYMENT' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Amount Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-neutral-950 to-neutral-950 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 font-semibold uppercase">Total Payable Amount</span>
                  <p className="text-2xl font-black text-white">₹{match.entryFee}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    DIRECT UPI INSTANT PAY
                  </span>
                  <p className="text-xs text-neutral-400 mt-1">{match.title}</p>
                </div>
              </div>

              {/* Direct UPI Apps Quick Buttons */}
              {(() => {
                const configuredApps: UpiAppConfig[] = (settings.upiApps && settings.upiApps.length > 0)
                  ? settings.upiApps
                  : INITIAL_UPI_APPS;

                const enabledApps = configuredApps.filter((a) => a.enabled);
                const fourApps = enabledApps.filter((a) => a.id !== 'any');
                const anyApp = enabledApps.find((a) => a.id === 'any') || configuredApps.find((a) => a.id === 'any');
                const anyAppUri = anyApp
                  ? buildUpiDeepLink(anyApp, settings.upiId, settings.upiName, match.entryFee, match.matchCode)
                  : `upi://pay?pa=${encodeURIComponent(settings.upiId || 'wepopearn@oksbi')}&pn=${encodeURIComponent(settings.upiName || 'POP Gaming')}&am=${match.entryFee}&cu=INR&tn=${encodeURIComponent('POP FF Match ' + match.matchCode)}`;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-neutral-200 flex items-center gap-1.5 uppercase tracking-wide">
                        <Smartphone className="w-4 h-4 text-orange-400" />
                        <span>Select Your UPI App (Pre-filled ₹{match.entryFee})</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        1-Tap Instant Payment
                      </span>
                    </div>

                    {/* 4 Brand UPI Apps Grid (POP, PhonePe, Paytm, GPay) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {fourApps.map((app) => {
                        const appDeepLink = buildUpiDeepLink(
                          app,
                          settings.upiId,
                          settings.upiName,
                          match.entryFee,
                          match.matchCode
                        );

                        return (
                          <a
                            key={app.id}
                            href={appDeepLink}
                            className="p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 text-center flex flex-col items-center justify-between gap-2 transition group shadow-md cursor-pointer relative overflow-hidden"
                          >
                            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition">
                              <img
                                src={app.logoUrl}
                                alt={app.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-xs font-black text-white group-hover:text-orange-400 transition block">
                                {app.name}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-400 block">
                                Pay ₹{match.entryFee}
                              </span>
                            </div>

                            {app.badgeText && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-orange-400/90">
                                {app.badgeText}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>

                    {/* 5th Option: Universal UPI App on User's Phone */}
                    <a
                      href={anyAppUri}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-950 to-neutral-950 hover:to-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-between gap-3 transition group cursor-pointer shadow-lg shadow-emerald-950/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                          {anyApp?.logoUrl ? (
                            <img
                              src={anyApp.logoUrl}
                              alt="Universal UPI App"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition">
                              {anyApp?.name || 'Pay with Any UPI App on Phone'}
                            </h4>
                            <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              Cred • BHIM • Amazon Pay • Navi
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Automatically opens the UPI app installed on your phone with exact <strong className="text-white">₹{match.entryFee}</strong> pre-filled.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase tracking-wider flex-shrink-0 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black px-3 py-1.5 rounded-xl border border-emerald-500/30 transition">
                        <span>Pay ₹{match.entryFee}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  </div>
                );
              })()}

              {/* UPI QR and ID Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Section */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-neutral-300 mb-2">Or Scan QR Code to Pay</p>
                  <div className="p-3 bg-white rounded-xl shadow-lg inline-block">
                    <img
                      src={settings.qrCodeImageUrl}
                      alt="POP Gaming UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 font-medium">Scan with PhonePe, GPay, Paytm</p>
                </div>

                {/* Direct UPI ID Section */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Merchant UPI ID</span>
                    <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-700">
                      <span className="font-mono text-xs font-bold text-orange-400 truncate">{settings.upiId || 'wepopearn@oksbi'}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 space-y-1">
                    <p className="flex items-center gap-1 text-neutral-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                      Verification Steps:
                    </p>
                    <p>1. Pay exact <strong className="text-white">₹{match.entryFee}</strong> to UPI ID.</p>
                    <p>2. Copy the 12-digit UTR / Reference ID from receipt.</p>
                    <p>3. Enter UTR below and click Submit.</p>
                  </div>
                </div>
              </div>

              {/* UTR & Screenshot inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    12-Digit UPI Reference Number (UTR / Ref ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 423984719283"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Admin verifies this UTR directly on bank statement before confirming your slot.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Payment Screenshot Receipt (Optional but Recommended)
                  </label>
                  
                  {!paymentScreenshotUrl ? (
                    <label className="border-2 border-dashed border-neutral-800 hover:border-orange-500/60 bg-neutral-950/60 hover:bg-neutral-950 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 group-hover:bg-orange-500/10 border border-neutral-800 group-hover:border-orange-500/30 flex items-center justify-center transition">
                        <Upload className="w-5 h-5 text-neutral-400 group-hover:text-orange-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-200 group-hover:text-white block">
                          Click to browse or drop payment screenshot
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          PNG, JPG, WEBP up to 5MB (PhonePe, GPay, Paytm receipt)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-emerald-500/30">
                      <div className="flex items-center gap-3">
                        <img
                          src={paymentScreenshotUrl}
                          alt="Uploaded Receipt"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                        />
                        <div>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Screenshot Receipt Attached
                          </span>
                          <span className="text-[10px] text-neutral-500">Ready for instant verification</span>
                        </div>
                      </div>

                      <label className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer transition">
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Payment...</span>
                  ) : (
                    <>
                      <span>Submit Payment & Lock Slot</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS & DIRECT EMAIL ACTION */}
          {step === 'SUCCESS' && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Registration Submitted!
                </h3>
                <p className="text-xs text-neutral-400">
                  Your payment of <strong className="text-emerald-400">₹{match.entryFee}</strong> has been logged and is in <span className="text-amber-400 font-bold">PENDING VERIFICATION</span>.
                </p>
              </div>

              {/* Registration Reference Box */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400 uppercase font-semibold">Registration ID:</span>
                  <span className="font-mono text-sm font-black text-orange-400">{createdRegId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-300">
                  <span>Match Room:</span>
                  <span className="font-semibold">{match.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-300">
                  <span>Submitted UTR:</span>
                  <span className="font-mono text-sky-400">{utrNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-300">
                  <span>Captain / UID:</span>
                  <span>{captainName} ({players[0]?.gameUid || 'N/A'})</span>
                </div>
              </div>

              {/* DIRECT EMAIL REDIRECT ACTION FOR wepopearn@gmail.com */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-neutral-950 to-neutral-950 border border-orange-500/30 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Direct Email Verification</h4>
                    <p className="text-[11px] text-neutral-400">Send your payment receipt directly to <span className="text-orange-400 font-mono font-bold">wepopearn@gmail.com</span></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={emailMailtoUrl}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-orange-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Email App & Send Details</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied wepopearn@gmail.com' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>

              {/* Next Steps Guide */}
              <div className="text-left bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 text-xs text-neutral-300 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  What happens next?
                </h4>
                <p>1. Admin verifies your UTR (usually 5–15 mins).</p>
                <p>2. Once status changes to <strong className="text-emerald-400">APPROVED</strong>, confirmation email is sent.</p>
                <p>3. Room ID & password unlock 15 minutes before match start.</p>
              </div>

              {/* WhatsApp + Close action */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${settings.supportWhatsApp.replace('+', '')}?text=${encodeURIComponent(
                    `Hello POP Gaming Admin, I have registered for match ${match.title}. Reg ID: ${createdRegId}, UTR: ${utrNumber}. Please confirm my slot.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>WhatsApp Verification Ping</span>
                </a>
                <button
                  onClick={() => {
                    onClose();
                    onSuccess(createdRegId);
                  }}
                  className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
