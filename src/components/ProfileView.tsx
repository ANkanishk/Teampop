import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  ShieldCheck, 
  History, 
  Smartphone, 
  LogOut, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Wallet, 
  Bell, 
  Settings, 
  Key, 
  ExternalLink, 
  Flame, 
  CreditCard, 
  Sparkles, 
  LogIn, 
  ArrowRight, 
  Gamepad2, 
  Mail, 
  Copy, 
  Edit3, 
  Save, 
  Check,
  Gift
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { WalletSection } from './WalletSection';
import { ReferralSection } from './ReferralSection';
import { EsportsPlayerIdCard } from './EsportsPlayerIdCard';
import { AppNotification } from '../types';
import { soundFx } from '../lib/soundEffects';

interface ProfileViewProps {
  onOpenLoginModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenLoginModal }) => {
  const { 
    currentUser, 
    customUser,
    isAdmin,
    registrations, 
    results, 
    logout, 
    settings, 
    getUserWalletStats, 
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
    updateUserProfile,
  } = useTournaments();

  const [activeSubTab, setActiveSubTab] = useState<'WALLET' | 'REFERRAL' | 'PASSPORT' | 'MATCHES' | 'NOTIFICATIONS' | 'ACCOUNT'>('ACCOUNT');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isLoggedIn = Boolean(customUser || currentUser);
  const activeUid = customUser?.uid || currentUser?.uid || 'user-guest';
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();
  const displayName = customUser?.displayName || currentUser?.displayName || (activeEmail ? activeEmail.split('@')[0] : 'Player');
  const gameUid = customUser?.gameUid || '';
  const inGameName = customUser?.inGameName || displayName;
  const phone = customUser?.phone || '';
  const joinDate = customUser?.createdAt ? new Date(customUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified Member';

  // Edit state
  const [editName, setEditName] = useState(displayName);
  const [editPhone, setEditPhone] = useState(phone);
  const [editGameUid, setEditGameUid] = useState(gameUid);
  const [editInGameName, setEditInGameName] = useState(inGameName);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundFx.playClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: editName.trim() || displayName,
      phone: editPhone.trim() || phone,
      gameUid: editGameUid.trim() || gameUid,
      inGameName: editInGameName.trim() || inGameName,
    });
    soundFx.playSuccess();
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const stats = getUserWalletStats();

  // Find user's registrations strictly for logged in user
  const userRegistrations = isLoggedIn
    ? registrations.filter(
        (r) =>
          (activeUid && r.userId === activeUid) ||
          (activeEmail && r.captainEmail?.toLowerCase() === activeEmail)
      )
    : [];

  const userNotifs = isLoggedIn
    ? notifications.filter((n) => {
        if (n.userId === 'all') return true;
        if (activeUid && n.userId === activeUid) return true;
        return false;
      })
    : [];

  // If user is not logged in, render a clear Sign In / Register gateway
  if (!isLoggedIn) {
    return (
      <div id="profile-view" className="space-y-8 pb-16">
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/20 border border-orange-400/40">
            <Gamepad2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Player Hub & Tournament Wallet
            </h1>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              Sign in to your account to manage your tournament passes, request instant UPI cash withdrawals, track approved match slots, and view custom room passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto py-2">
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant UPI Wallet</h4>
                <p className="text-[11px] text-neutral-400">Fast payout settlement</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Room Credentials</h4>
                <p className="text-[11px] text-neutral-400">Direct ID & Password access</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pro Gamer Passport</h4>
                <p className="text-[11px] text-neutral-400">Official tournament ID</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Verified Career Stats</h4>
                <p className="text-[11px] text-neutral-400">Booyah & Kill rewards</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-profile-signin"
              onClick={() => {
                soundFx.playClick();
                if (onOpenLoginModal) onOpenLoginModal();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 mx-auto shadow-xl shadow-orange-500/30 transition transform hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-view" className="space-y-8 pb-16">
      {/* Profile Card Header */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/20 border border-orange-400/40 flex-shrink-0">
            {displayName ? displayName[0].toUpperCase() : 'P'}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {displayName}
              </h1>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black border border-red-500/30 uppercase tracking-wider">
                  MASTER ADMIN
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED PLAYER
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-400">
              {activeEmail && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{activeEmail}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>+91 {phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] font-mono flex items-center gap-1.5">
                <span className="text-neutral-500">FF UID:</span>
                <span className="font-bold text-orange-400">{gameUid || 'Not Set'}</span>
                {gameUid && (
                  <button 
                    onClick={() => handleCopy(gameUid, 'header-uid')}
                    className="hover:text-white text-neutral-500 cursor-pointer ml-0.5"
                    title="Copy Free Fire UID"
                  >
                    {copiedKey === 'header-uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
                IGN: <span className="font-bold text-white">{inGameName || displayName}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-500">
                Joined: {joinDate}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveSubTab('ACCOUNT');
              setIsEditing(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 font-bold text-xs cursor-pointer border border-orange-500/30 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Account Details</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              logout();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer border border-neutral-700 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Player Career Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Matches Played</span>
          <p className="text-2xl font-black text-white">{userRegistrations.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Approved Slots</span>
          <p className="text-2xl font-black text-emerald-400">
            {userRegistrations.filter((r) => r.status === 'APPROVED').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Total Prize Winnings</span>
          <p className="text-2xl font-black text-orange-400">₹{stats.totalWonAmount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Fairplay Rating</span>
          <p className="text-2xl font-black text-cyan-400">100%</p>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-subtab-wallet"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('WALLET');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'WALLET'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>My Wallet & Payouts</span>
        </button>

        <button
          id="btn-subtab-referral"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('REFERRAL');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'REFERRAL'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Refer & Earn (₹25)</span>
        </button>

        <button
          id="btn-subtab-passport"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('PASSPORT');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'PASSPORT'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pro Player Passport</span>
        </button>

        <button
          id="btn-subtab-matches"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('MATCHES');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'MATCHES'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Registered Slots ({userRegistrations.length})</span>
        </button>

        <button
          id="btn-subtab-notifications"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('NOTIFICATIONS');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
            activeSubTab === 'NOTIFICATIONS'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({userNotifs.length})</span>
          {unreadNotificationsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>

        <button
          id="btn-subtab-account"
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('ACCOUNT');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'ACCOUNT'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Player Settings</span>
        </button>
      </div>

      {/* Tab Content 1: Wallet & Payouts */}
      {activeSubTab === 'WALLET' && (
        <WalletSection />
      )}

      {/* Tab Content: Refer & Earn */}
      {activeSubTab === 'REFERRAL' && (
        <ReferralSection />
      )}

      {/* Tab Content: Pro Player Passport Card */}
      {activeSubTab === 'PASSPORT' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Official Esports Player ID & Gamer Card
            </h2>
            <span className="text-xs text-neutral-500">
              Verified identity on POP Gaming Esports
            </span>
          </div>
          <EsportsPlayerIdCard />
        </div>
      )}

      {/* Tab Content 2: Match Registrations */}
      {activeSubTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              My Match Registrations & Custom Rooms
            </h2>
            <span className="text-xs text-neutral-500">
              Auto-syncs slot approval & room details
            </span>
          </div>

          {userRegistrations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
              You have not registered for any tournament rooms yet. Check the daily matches tab to join a room.
            </div>
          ) : (
            <div className="space-y-3">
              {userRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-orange-400">{reg.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          reg.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : reg.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {reg.status === 'APPROVED' ? 'SLOT VERIFIED & CONFIRMED' : reg.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{reg.matchTitle}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                      <span>Captain: <strong className="text-neutral-200">{reg.captainName}</strong></span>
                      <span>UID: <strong className="font-mono text-neutral-200">{reg.players[0]?.gameUid}</strong></span>
                      <span>IGN: <strong className="text-orange-400">{reg.players[0]?.inGameName}</strong></span>
                      <span>UTR: <strong className="font-mono text-neutral-300">{reg.utrNumber}</strong></span>
                    </div>

                    {reg.adminNotes && (
                      <p className="text-xs text-neutral-300 italic pt-1">
                        Admin Note: {reg.adminNotes}
                      </p>
                    )}

                    {reg.status === 'APPROVED' && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>
                          Custom Room ID & Password will be unlocked 15 minutes before match time on the Track Match page.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-lg font-black text-cyan-400">
                      Entry: ₹{reg.entryFee}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Registered: {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: In-App Notifications */}
      {activeSubTab === 'NOTIFICATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              In-App Notification Alerts
            </h2>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {userNotifs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
                No notification alerts right now.
              </div>
            ) : (
              userNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 rounded-2xl bg-neutral-900 border transition cursor-pointer flex items-start gap-3.5 ${
                    !notif.read
                      ? 'border-orange-500/40 bg-orange-500/5'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex-shrink-0 mt-0.5">
                    {notif.type === 'PRIZE_WON' ? (
                      <Trophy className="w-5 h-5 text-amber-400" />
                    ) : notif.type === 'SLOT_APPROVED' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Flame className="w-5 h-5 text-orange-400" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content 4: Account Details & Settings */}
      {activeSubTab === 'ACCOUNT' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  <span>My Account Details</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your registered account credentials, Free Fire gaming identifiers, and wallet access.
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setEditName(displayName);
                    setEditPhone(phone);
                    setEditGameUid(gameUid);
                    setEditInGameName(inGameName);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Your account details have been updated successfully!</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">Full Name / Display Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">Mobile Number (10-digit)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">Free Fire Game UID</label>
                    <input
                      type="text"
                      value={editGameUid}
                      onChange={(e) => setEditGameUid(e.target.value)}
                      placeholder="e.g. 1928374650"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">In-Game Name (IGN)</label>
                    <input
                      type="text"
                      value={editInGameName}
                      onChange={(e) => setEditInGameName(e.target.value)}
                      placeholder="e.g. POP_LEGEND"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Account UID */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Account UID</span>
                    <button
                      onClick={() => handleCopy(activeUid, 'account-uid')}
                      className="text-neutral-500 hover:text-white transition cursor-pointer"
                      title="Copy UID"
                    >
                      {copiedKey === 'account-uid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono font-bold text-white break-all">{activeUid}</p>
                </div>

                {/* 2. Full Name */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Full Name</span>
                  <p className="text-sm font-bold text-white">{displayName}</p>
                </div>

                {/* 3. Registered Email */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Registered Email</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">VERIFIED</span>
                  </div>
                  <p className="text-xs font-mono font-semibold text-white truncate">{activeEmail || 'Not Linked'}</p>
                </div>

                {/* 4. Registered Mobile */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Mobile Number</span>
                    {phone && <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">VERIFIED</span>}
                  </div>
                  <p className="text-xs font-mono font-semibold text-white">
                    {phone ? `+91 ${phone}` : 'Not Linked (Click Edit Profile)'}
                  </p>
                </div>

                {/* 5. Free Fire Game UID */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Free Fire UID</span>
                    {gameUid && (
                      <button
                        onClick={() => handleCopy(gameUid, 'ff-uid')}
                        className="text-neutral-500 hover:text-white transition cursor-pointer"
                        title="Copy Free Fire UID"
                      >
                        {copiedKey === 'ff-uid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-mono font-bold text-orange-400">{gameUid || 'Not Set'}</p>
                </div>

                {/* 6. In-Game Name (IGN) */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">In-Game Name (IGN)</span>
                  <p className="text-xs font-mono font-bold text-amber-400">{inGameName || displayName}</p>
                </div>

                {/* 7. Role & Access */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Access Role</span>
                  <p className="text-xs font-bold text-emerald-400">{isAdmin ? '👑 Master Administrator' : '🎮 Verified Esports Player'}</p>
                </div>

                {/* 8. Registration Date */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Member Since</span>
                  <p className="text-xs font-mono text-neutral-300">{joinDate}</p>
                </div>

                {/* 9. Fair Play Status */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Fair Play Rating</span>
                  <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Anti-Cheat Verified</span>
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                POP Gaming Esports Security & Fair Play Policy:
              </span>
              <p>
                Your account is protected with email and mobile verification. Only you can join matches with your Free Fire Game UID. Use of mods, emulator bypasses, or teaming in solo modes results in instant disqualification and wallet freeze.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
