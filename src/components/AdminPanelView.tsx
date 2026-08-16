import React, { useState } from 'react';
import { 
  Lock, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit, 
  Edit3,
  Trash2, 
  Eye, 
  Key, 
  DollarSign, 
  Sliders, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Users,
  Minus,
  Zap,
  Check,
  RotateCcw
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { Match, GameModeId, Registration, MatchStatus } from '../types';
import { 
  getPerKillReward, 
  calculateBRPlacementRewards, 
  isDuelOrLoneWolfMode, 
  calculateDuelPlacementRewards 
} from '../data/tournamentData';
import { UpiVerificationManager } from './UpiVerificationManager';
import { MediaBannersManager } from './MediaBannersManager';
import { EmailNotificationsManager } from './EmailNotificationsManager';
import { WithdrawalsManager } from './WithdrawalsManager';
import { AdminUserWalletsManager } from './AdminUserWalletsManager';
import { Image as ImageIcon, QrCode, Sparkles, Mail, ArrowUpRight, Megaphone, Smartphone, Send, Wallet } from 'lucide-react';
import { GlobalAnnouncementsManager } from './GlobalAnnouncementsManager';
import { UpiAppsManager } from './UpiAppsManager';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';

export const AdminPanelView: React.FC = () => {
  const {
    matches,
    registrations,
    results,
    settings,
    withdrawals,
    updateSettings,
    createMatch,
    updateMatch,
    deleteMatch,
    updateRegistrationStatus,
    publishMatchResult,
    syncMatchesWithRealRegistrations,
    resetAllMatchSlotsToZero,
    updateMatchSlotCount,
    getMatchConfirmedSlots,
    resetEntireDatabaseToCleanState,
  } = useTournaments();

  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'USER_WALLETS' | 'MEDIA_MANAGER' | 'UPI_APPS' | 'REGISTRATIONS' | 'WITHDRAWALS' | 'ANNOUNCEMENTS' | 'EMAIL_NOTIFICATIONS' | 'MATCHES' | 'RESULTS_ENTRY' | 'FINANCIAL_CALC' | 'SETTINGS'
  >('DASHBOARD');

  const [showCleanDbModal, setShowCleanDbModal] = useState(false);

  // Search and filter for registrations
  const [regFilterStatus, setRegFilterStatus] = useState<string>('ALL');
  const [regSearch, setRegSearch] = useState<string>('');

  // Create match modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatchTitle, setNewMatchTitle] = useState('');
  const [newMatchMode, setNewMatchMode] = useState<GameModeId>('solo-br');
  const [newMatchEntry, setNewMatchEntry] = useState<number>(50);
  const [newMatchCapacity, setNewMatchCapacity] = useState<number>(48);
  const [newMatchTime, setNewMatchTime] = useState<string>('Tonight at 10:00 PM');
  const [newMatchMap, setNewMatchMap] = useState<string>('Bermuda');
  const [newMatchGunAttributes, setNewMatchGunAttributes] = useState<boolean>(true);
  const [newMatchCharacterSkill, setNewMatchCharacterSkill] = useState<boolean>(true);
  const [newMatchLimitedAmmo, setNewMatchLimitedAmmo] = useState<boolean>(true);
  const [newMatchUnlimitedGloo, setNewMatchUnlimitedGloo] = useState<boolean>(false);
  const [newMatchOnlyHeadshot, setNewMatchOnlyHeadshot] = useState<boolean>(false);
  const [newMatchRevivesAllowed, setNewMatchRevivesAllowed] = useState<boolean>(false);
  const [newMatchCustomNotes, setNewMatchCustomNotes] = useState<string>('');

  // Room credentials edit state
  const [selectedMatchForCreds, setSelectedMatchForCreds] = useState<Match | null>(null);
  const [credsRoomId, setCredsRoomId] = useState('');
  const [credsPassword, setCredsPassword] = useState('');

  // Result entry state
  const [selectedMatchForResult, setSelectedMatchForResult] = useState<Match | null>(null);
  const [winnerName, setWinnerName] = useState('');
  const [winnerUid, setWinnerUid] = useState('');
  const [winnerKills, setWinnerKills] = useState<number>(5);

  const [runnerUpName, setRunnerUpName] = useState('');
  const [runnerUpUid, setRunnerUpUid] = useState('');
  const [runnerUpKills, setRunnerUpKills] = useState<number>(3);

  const [thirdName, setThirdName] = useState('');
  const [thirdUid, setThirdUid] = useState('');
  const [thirdKills, setThirdKills] = useState<number>(2);

  // Financial safety calculator state
  const [calcEntryFee, setCalcEntryFee] = useState<number>(500);
  const [calcPlayers, setCalcPlayers] = useState<number>(50);
  const [calcKillRate, setCalcKillRate] = useState<number>(100);
  const [calcEstimatedKills, setCalcEstimatedKills] = useState<number>(47); // Max realistic kills in 50 player lobby

  // Full Match Edit Modal state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editMatchTitle, setEditMatchTitle] = useState('');
  const [editMatchCode, setEditMatchCode] = useState('');
  const [editMatchMode, setEditMatchMode] = useState<GameModeId>('solo-br');
  const [editMatchEntryFee, setEditMatchEntryFee] = useState<number>(50);
  const [editMatchMaxPlayers, setEditMatchMaxPlayers] = useState<number>(48);
  const [editMatchApprovedCount, setEditMatchApprovedCount] = useState<number>(0);
  const [editMatchStatus, setEditMatchStatus] = useState<MatchStatus>('REGISTRATION_OPEN');
  const [editMatchTime, setEditMatchTime] = useState('');
  const [editMatchMap, setEditMatchMap] = useState('Bermuda');
  const [editMatchRoomId, setEditMatchRoomId] = useState('');
  const [editMatchRoomPassword, setEditMatchRoomPassword] = useState('');
  const [editMatchCredentialsReleased, setEditMatchCredentialsReleased] = useState(false);
  const [editMatchPerKillReward, setEditMatchPerKillReward] = useState<number>(7);
  const [editMatchNotes, setEditMatchNotes] = useState('');
  const [editMatchGunAttributes, setEditMatchGunAttributes] = useState<boolean>(true);
  const [editMatchCharacterSkill, setEditMatchCharacterSkill] = useState<boolean>(true);
  const [editMatchLimitedAmmo, setEditMatchLimitedAmmo] = useState<boolean>(true);
  const [editMatchUnlimitedGloo, setEditMatchUnlimitedGloo] = useState<boolean>(false);
  const [editMatchOnlyHeadshot, setEditMatchOnlyHeadshot] = useState<boolean>(false);
  const [editMatchRevivesAllowed, setEditMatchRevivesAllowed] = useState<boolean>(false);

  // Status feedback toast message
  const [slotActionToast, setSlotActionToast] = useState<string | null>(null);

  // Analytics metrics calculations
  const totalCollections = registrations
    .filter((r) => r.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalPayable, 0);

  const pendingRegistrationsCount = registrations.filter((r) => r.status === 'PENDING').length;
  const approvedRegistrationsCount = registrations.filter((r) => r.status === 'APPROVED').length;

  const totalRewardsDistributed = results.reduce((acc, curr) => acc + curr.totalPayout, 0);
  const grossSurplus = totalCollections - totalRewardsDistributed;

  // Filtered registrations
  const filteredRegs = registrations.filter((r) => {
    if (regFilterStatus !== 'ALL' && r.status !== regFilterStatus) return false;
    if (regSearch.trim()) {
      const q = regSearch.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.captainName.toLowerCase().includes(q) ||
        r.utrNumber.toLowerCase().includes(q) ||
        r.matchTitle.toLowerCase().includes(q) ||
        r.captainPhone.includes(q)
      );
    }
    return true;
  });

  const handleCreateMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isDuel = isDuelOrLoneWolfMode(newMatchMode);
    const killBounty = isDuel ? 0 : getPerKillReward(newMatchEntry);
    const placement = calculateBRPlacementRewards(newMatchEntry);
    const duelPlacement = calculateDuelPlacementRewards(newMatchEntry);

    const modeLabels: Record<GameModeId, string> = {
      'solo-br': 'BR Solo (1v1 Survival)',
      'duo-br': 'BR Duo (2 Players)',
      'squad-br': 'BR Squad (4v4)',
      'cs-1v1': 'Clash Squad 1v1 Duel',
      'cs-2v2': 'Clash Squad 2v2',
      'cs-4v4': 'Clash Squad 4v4 War',
      'cs-custom': 'Clash Squad Custom (Unlimited Gloo)',
      'lone-wolf-1v1': 'Lone Wolf 1v1 Arena',
      'lone-wolf-2v2': 'Lone Wolf 2v2 Tag Team',
      'headshot-mode': 'Headshot Only Custom',
      'monthly-championship': 'Monthly Grand Championship',
      'mega-championship': 'Mega 4-Day Championship',
    };

    const notes = newMatchCustomNotes || (
      isDuel
        ? `Winner Payout: ₹${duelPlacement.first} (150% Return). ${newMatchOnlyHeadshot ? 'Only Headshot (Red Numbers) Allowed.' : ''} ${newMatchUnlimitedGloo ? 'Unlimited Gloo Wall active.' : ''}`
        : `1st: ₹${placement.first}, 2nd: ₹${placement.second}, 3rd: ₹${placement.third} + ₹${killBounty}/kill bounty.`
    );

    createMatch({
      matchCode: `POP-${newMatchMode.toUpperCase().slice(0, 4)}-${newMatchEntry}-${Math.floor(10 + Math.random() * 90)}`,
      title: newMatchTitle || `${modeLabels[newMatchMode]} (₹${newMatchEntry})`,
      gameMode: newMatchMode,
      gameModeName: modeLabels[newMatchMode] || newMatchMode.replace(/-/g, ' ').toUpperCase(),
      entryFee: Number(newMatchEntry),
      maxPlayers: Number(newMatchCapacity),
      minPlayers: Math.round(Number(newMatchCapacity) * 0.5),
      status: 'REGISTRATION_OPEN',
      scheduledStart: newMatchTime,
      mapName: newMatchMap,
      serverRegion: 'India (FF MAX)',
      rulesSnapshot: {
        format: newMatchMode,
        revivesAllowed: newMatchRevivesAllowed,
        gunAttributes: newMatchGunAttributes,
        characterSkill: newMatchCharacterSkill,
        limitedAmmo: newMatchLimitedAmmo,
        unlimitedGloo: newMatchUnlimitedGloo,
        onlyHeadshot: newMatchOnlyHeadshot,
        customNotes: notes,
      },
      rewardConfig: {
        firstPlaceMultiplier: isDuel ? 1.5 : 2.0,
        secondPlaceMultiplier: isDuel ? 0 : 1.3,
        thirdPlaceMultiplier: isDuel ? 0 : 1.2,
        perKillReward: killBounty,
        fixedWinnerPrize: isDuel ? duelPlacement.first : undefined,
      },
      credentialsReleased: false,
      bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    });

    setShowCreateModal(false);
    setNewMatchTitle('');
    setNewMatchCustomNotes('');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCreds) return;
    updateMatch(selectedMatchForCreds.id, {
      roomId: credsRoomId,
      roomPassword: credsPassword,
      credentialsReleased: true,
    });
    setSelectedMatchForCreds(null);
    setSlotActionToast(`🔑 Room credentials released for ${selectedMatchForCreds.matchCode}!`);
    setTimeout(() => setSlotActionToast(null), 3500);
  };

  const handleOpenEditMatch = (m: Match) => {
    setEditingMatch(m);
    setEditMatchTitle(m.title);
    setEditMatchCode(m.matchCode);
    setEditMatchMode(m.gameMode || 'solo-br');
    setEditMatchEntryFee(m.entryFee);
    setEditMatchMaxPlayers(m.maxPlayers);
    setEditMatchApprovedCount(m.approvedCount);
    setEditMatchStatus(m.status);
    setEditMatchTime(m.scheduledStart);
    setEditMatchMap(m.mapName);
    setEditMatchRoomId(m.roomId || '');
    setEditMatchRoomPassword(m.roomPassword || '');
    setEditMatchCredentialsReleased(!!m.credentialsReleased);
    setEditMatchPerKillReward(m.rewardConfig?.perKillReward ?? getPerKillReward(m.entryFee, m.gameMode));
    setEditMatchNotes(m.rulesSnapshot?.customNotes || '');
    setEditMatchGunAttributes(m.rulesSnapshot?.gunAttributes ?? true);
    setEditMatchCharacterSkill(m.rulesSnapshot?.characterSkill ?? true);
    setEditMatchLimitedAmmo(m.rulesSnapshot?.limitedAmmo ?? true);
    setEditMatchUnlimitedGloo(m.rulesSnapshot?.unlimitedGloo ?? false);
    setEditMatchOnlyHeadshot(m.rulesSnapshot?.onlyHeadshot ?? false);
    setEditMatchRevivesAllowed(m.rulesSnapshot?.revivesAllowed ?? false);
  };

  const handleSaveEditMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    const modeLabels: Record<GameModeId, string> = {
      'solo-br': 'BR Solo (1v1 Survival)',
      'duo-br': 'BR Duo (2 Players)',
      'squad-br': 'BR Squad (4v4)',
      'cs-1v1': 'Clash Squad 1v1 Duel',
      'cs-2v2': 'Clash Squad 2v2',
      'cs-4v4': 'Clash Squad 4v4 War',
      'cs-custom': 'Clash Squad Custom (Unlimited Gloo)',
      'lone-wolf-1v1': 'Lone Wolf 1v1 Arena',
      'lone-wolf-2v2': 'Lone Wolf 2v2 Tag Team',
      'headshot-mode': 'Headshot Only Custom',
      'monthly-championship': 'Monthly Grand Championship',
      'mega-championship': 'Mega 4-Day Championship',
    };

    updateMatch(editingMatch.id, {
      title: editMatchTitle,
      matchCode: editMatchCode,
      gameMode: editMatchMode,
      gameModeName: modeLabels[editMatchMode] || editMatchMode.replace(/-/g, ' ').toUpperCase(),
      entryFee: Number(editMatchEntryFee),
      maxPlayers: Number(editMatchMaxPlayers),
      approvedCount: Math.max(0, Number(editMatchApprovedCount)),
      status: editMatchStatus,
      scheduledStart: editMatchTime,
      mapName: editMatchMap,
      roomId: editMatchRoomId,
      roomPassword: editMatchRoomPassword,
      credentialsReleased: editMatchCredentialsReleased,
      rewardConfig: {
        ...editingMatch.rewardConfig,
        perKillReward: Number(editMatchPerKillReward),
      },
      rulesSnapshot: {
        ...editingMatch.rulesSnapshot,
        format: editMatchMode,
        gunAttributes: editMatchGunAttributes,
        characterSkill: editMatchCharacterSkill,
        limitedAmmo: editMatchLimitedAmmo,
        unlimitedGloo: editMatchUnlimitedGloo,
        onlyHeadshot: editMatchOnlyHeadshot,
        revivesAllowed: editMatchRevivesAllowed,
        customNotes: editMatchNotes,
      },
    });
    setEditingMatch(null);
    setSlotActionToast(`✅ Match "${editMatchTitle}" & Game Rules successfully updated!`);
    setTimeout(() => setSlotActionToast(null), 4000);
  };

  const handleQuickSlotChange = (matchId: string, currentCount: number, delta: number) => {
    const newCount = Math.max(0, currentCount + delta);
    updateMatchSlotCount(matchId, newCount);
    setSlotActionToast(`⚡ Confirmed slots updated to ${newCount}`);
    setTimeout(() => setSlotActionToast(null), 3000);
  };

  const handleSyncSingleRealSlot = (matchId: string) => {
    const realCount = getMatchConfirmedSlots(matchId);
    updateMatchSlotCount(matchId, realCount);
    setSlotActionToast(`🟢 Synced to real verified registrations: ${realCount} player(s)`);
    setTimeout(() => setSlotActionToast(null), 3500);
  };

  const handleSyncAllRealSlots = () => {
    syncMatchesWithRealRegistrations();
    setSlotActionToast('⚡ All tournament rooms synced to 100% real verified player registrations!');
    setTimeout(() => setSlotActionToast(null), 4000);
  };

  const handleResetAllSlots = () => {
    resetAllMatchSlotsToZero();
    setSlotActionToast('🔄 All match confirmed slots reset to 0.');
    setTimeout(() => setSlotActionToast(null), 4000);
  };

  const handlePublishResultsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForResult) return;

    const killRate = selectedMatchForResult.rewardConfig.perKillReward || getPerKillReward(selectedMatchForResult.entryFee);
    const placement = calculateBRPlacementRewards(selectedMatchForResult.entryFee);

    const firstKillPrize = winnerKills * killRate;
    const firstTotal = placement.first + firstKillPrize;

    const secondKillPrize = runnerUpKills * killRate;
    const secondTotal = placement.second + secondKillPrize;

    const thirdKillPrize = thirdKills * killRate;
    const thirdTotal = placement.third + thirdKillPrize;

    const totalPayout = firstTotal + secondTotal + thirdTotal;

    publishMatchResult({
      matchId: selectedMatchForResult.id,
      matchTitle: selectedMatchForResult.title,
      gameMode: selectedMatchForResult.gameMode,
      firstPlace: {
        teamOrPlayerName: winnerName,
        uids: [winnerUid],
        kills: Number(winnerKills),
        placementPrize: placement.first,
        killPrize: firstKillPrize,
        totalPrize: firstTotal,
      },
      secondPlace: runnerUpName
        ? {
            teamOrPlayerName: runnerUpName,
            uids: [runnerUpUid],
            kills: Number(runnerUpKills),
            placementPrize: placement.second,
            killPrize: secondKillPrize,
            totalPrize: secondTotal,
          }
        : undefined,
      thirdPlace: thirdName
        ? {
            teamOrPlayerName: thirdName,
            uids: [thirdUid],
            kills: Number(thirdKills),
            placementPrize: placement.third,
            killPrize: thirdKillPrize,
            totalPrize: thirdTotal,
          }
        : undefined,
      totalKills: Number(winnerKills) + Number(runnerUpKills) + Number(thirdKills),
      totalPayout,
      publishedBy: 'wepopearn@gmail.com',
    });

    setSelectedMatchForResult(null);
    setWinnerName('');
    setWinnerUid('');
  };

  // Financial safety computations
  const totalSimulatedCollection = calcEntryFee * calcPlayers;
  const placementTotal =
    Math.round(calcEntryFee * 2.0) + Math.round(calcEntryFee * 1.3) + Math.round(calcEntryFee * 1.2);
  const killPayoutTotal = calcEstimatedKills * calcKillRate;
  const maxTotalLiability = placementTotal + killPayoutTotal;
  const projectedSurplus = totalSimulatedCollection - maxTotalLiability;
  const isBudgetDeficit = projectedSurplus < 0;

  return (
    <div id="admin-panel" className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-orange-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center">
            <Lock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                POP Gaming Master Admin
              </h1>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Logged in as <span className="text-neutral-200 font-mono">wepopearn@gmail.com</span> • Real-Time Cloud Firestore Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCleanDbModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md"
            title="Reset and clear all dummy test data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Purge / Reset Test Data</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Room</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'DASHBOARD', label: 'Financial Dashboard', icon: TrendingUp },
          { id: 'USER_WALLETS', label: 'User Wallets & Direct Updates', icon: Wallet, highlight: true },
          { id: 'UPI_APPS', label: 'UPI Payment Apps (POP, PhonePe, Paytm, GPay, Universal)', icon: Smartphone, highlight: true },
          { id: 'MEDIA_MANAGER', label: 'Logo, QR & Banners', icon: ImageIcon, highlight: true },
          { id: 'ANNOUNCEMENTS', label: 'Global Announcements', icon: Megaphone, highlight: true },
          { id: 'REGISTRATIONS', label: `Pending Payments (${pendingRegistrationsCount})`, icon: DollarSign },
          { id: 'WITHDRAWALS', label: `Withdrawal Requests (${withdrawals.filter(w => w.status === 'PENDING').length})`, icon: ArrowUpRight, highlight: true },
          { id: 'EMAIL_NOTIFICATIONS', label: 'Email Notifications & Logs', icon: Mail, highlight: true },
          { id: 'MATCHES', label: `Tournament Rooms (${matches.length})`, icon: Trophy },
          { id: 'RESULTS_ENTRY', label: 'Enter Results & Rewards', icon: Trophy },
          { id: 'FINANCIAL_CALC', label: 'Safety Calculator', icon: Sliders },
          { id: 'SETTINGS', label: 'UPI & Merchant Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : tab.highlight
                  ? 'bg-orange-500/10 text-orange-400 hover:text-white border border-orange-500/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINANCIAL & ANALYTICS DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <AdminAnalyticsDashboard />
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Gross Collection (Approved)</span>
              <p className="text-2xl font-black text-emerald-400">₹{totalCollections.toLocaleString()}</p>
              <span className="text-[11px] text-neutral-500">{approvedRegistrationsCount} Total Approved Registrations</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Pending Verifications</span>
              <p className="text-2xl font-black text-amber-400">{pendingRegistrationsCount}</p>
              <span className="text-[11px] text-neutral-500">Requires UTR bank check</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Player Rewards Paid</span>
              <p className="text-2xl font-black text-white">₹{totalRewardsDistributed.toLocaleString()}</p>
              <span className="text-[11px] text-neutral-500">{results.length} Matches Finalized</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Projected Gross Surplus</span>
              <p className="text-2xl font-black text-orange-400">₹{grossSurplus.toLocaleString()}</p>
              <span className="text-[11px] text-neutral-500">Before payment gateway & server costs</span>
            </div>
          </div>

          {/* Quick Action Alerts */}
          {pendingRegistrationsCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {pendingRegistrationsCount} Registration(s) Awaiting UPI Approval
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Verify UTR in bank records and confirm slots to release room credentials to players.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('REGISTRATIONS')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-extrabold text-xs cursor-pointer"
              >
                Review Now
              </button>
            </div>
          )}

          {/* Quick Links Card to Media Manager & Email System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Site Banners & UPI QR</h4>
                  <p className="text-[11px] text-neutral-400">
                    Update payment QR code & hero artwork.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('MEDIA_MANAGER')}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer shrink-0"
              >
                <span>Manage</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Email Notifications</h4>
                  <p className="text-[11px] text-neutral-400">
                    Auto-dispatches confirmation on approval.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('EMAIL_NOTIFICATIONS')}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer shrink-0"
              >
                <span>View Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USER WALLETS & DIRECT ADJUSTMENTS */}
      {activeTab === 'USER_WALLETS' && (
        <AdminUserWalletsManager />
      )}

      {/* TAB: UPI APPS MANAGER (POP, PhonePe, Paytm, GPay, Any App) */}
      {activeTab === 'UPI_APPS' && (
        <UpiAppsManager />
      )}

      {/* TAB: MEDIA, QR CODE & BANNERS MANAGER */}
      {activeTab === 'MEDIA_MANAGER' && (
        <MediaBannersManager />
      )}

      {/* TAB: GLOBAL ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <GlobalAnnouncementsManager />
      )}

      {/* TAB: EMAIL NOTIFICATIONS & LOGS */}
      {activeTab === 'EMAIL_NOTIFICATIONS' && (
        <EmailNotificationsManager />
      )}

      {/* TAB 2: REGISTRATIONS & UTR VERIFICATION */}
      {activeTab === 'REGISTRATIONS' && (
        <UpiVerificationManager
          registrations={registrations}
          onApprove={(regId, remarks) => updateRegistrationStatus(regId, 'APPROVED', remarks || 'Verified by Admin.')}
          onReject={(regId, remarks) => updateRegistrationStatus(regId, 'REJECTED', remarks || 'Payment UTR mismatch in bank records.')}
        />
      )}

      {/* TAB: WITHDRAWAL REQUESTS & PAYOUTS */}
      {activeTab === 'WITHDRAWALS' && (
        <WithdrawalsManager />
      )}

      {/* TOAST ALERT NOTIFICATION */}
      {slotActionToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-900 border border-orange-500/50 text-white shadow-2xl animate-fade-in text-xs font-bold">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{slotActionToast}</span>
          <button
            onClick={() => setSlotActionToast(null)}
            className="ml-2 text-neutral-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 3: MATCHES & ROOM CREDENTIALS */}
      {activeTab === 'MATCHES' && (
        <div className="space-y-6">
          {/* Action & Sync Controls Bar */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase tracking-wider">
                    Slot Management Engine
                  </span>
                  <span className="text-xs text-neutral-400">({matches.length} Total Rooms)</span>
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Tournament Rooms & Slot Controller
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Set real registration counts, manually override fake/placeholder slots, or edit full match parameters.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-sync-all-real-slots"
                  onClick={handleSyncAllRealSlots}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  title="Recalculate slots for all matches based strictly on verified and approved registrations"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Sync 100% Real Slots</span>
                </button>

                <button
                  id="btn-reset-all-slots-zero"
                  onClick={handleResetAllSlots}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Reset confirmed slot counts to 0 for all matches"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to 0</span>
                </button>

                <button
                  id="btn-admin-create-room"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Room</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {matches.map((m) => {
              const realApprovedSlots = getMatchConfirmedSlots(m.id);
              const isMatchFull = m.approvedCount >= m.maxPlayers;
              const fillPercent = Math.min(100, Math.round((m.approvedCount / m.maxPlayers) * 100));

              return (
                <div
                  key={m.id}
                  id={`admin-match-card-${m.id}`}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-orange-400 font-extrabold px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                          {m.matchCode}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                          {m.gameModeName || m.gameMode}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{m.title}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {m.scheduledStart} • Map: <strong className="text-neutral-300">{m.mapName}</strong> • Entry: <strong className="text-emerald-400">₹{m.entryFee}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                          m.status === 'FULL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : m.status === 'ALMOST_FULL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : m.status === 'LIVE'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : m.status === 'COMPLETED'
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Slot Information & Quick Controller Box */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-bold text-neutral-300">Slot Configuration:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400">Current Display:</span>
                        <strong className="text-white text-sm font-mono font-black">
                          {m.approvedCount} / {m.maxPlayers}
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          fillPercent >= 100
                            ? 'bg-red-500'
                            : fillPercent >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>

                    {/* Real Verified Count vs Fast Adjustment Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-900">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-neutral-500">Real Verified:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          realApprovedSlots > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {realApprovedSlots} Player(s)
                        </span>
                      </div>

                      {/* Fast Slot Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickSlotChange(m.id, m.approvedCount, -1)}
                          disabled={m.approvedCount <= 0}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                          title="Decrease 1 slot"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleQuickSlotChange(m.id, m.approvedCount, 1)}
                          disabled={m.approvedCount >= m.maxPlayers}
                          className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                          title="Increase 1 slot"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSyncSingleRealSlot(m.id)}
                          className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/40 cursor-pointer"
                          title="Set to exact verified count"
                        >
                          Set Real ({realApprovedSlots})
                        </button>
                        <button
                          onClick={() => updateMatchSlotCount(m.id, 0)}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold cursor-pointer"
                          title="Reset this match slots to 0"
                        >
                          Set 0
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Credentials Summary */}
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Room ID:</span>
                      <strong className="text-white font-mono">{m.roomId || 'Not set yet'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Room Password:</span>
                      <strong className="text-white font-mono">{m.roomPassword || 'Not set'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Released to Approved Players:</span>
                      <strong className={m.credentialsReleased ? 'text-emerald-400' : 'text-neutral-400'}>
                        {m.credentialsReleased ? 'YES (Live)' : 'NO (Hidden)'}
                      </strong>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      id={`btn-edit-match-${m.id}`}
                      onClick={() => handleOpenEditMatch(m)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                      <span>Edit Match & Slots</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMatchForCreds(m);
                        setCredsRoomId(m.roomId || '');
                        setCredsPassword(m.roomPassword || '1234');
                      }}
                      className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Room Pass</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMatchForResult(m);
                        setActiveTab('RESULTS_ENTRY');
                      }}
                      className="py-2 px-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Results</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${m.title}"?`)) {
                          deleteMatch(m.id);
                          setSlotActionToast(`🗑️ Match deleted.`);
                          setTimeout(() => setSlotActionToast(null), 3000);
                        }
                      }}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RESULT ENTRY & REWARD ENGINE */}
      {activeTab === 'RESULTS_ENTRY' && (
        <div className="space-y-6 max-w-2xl bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Finalize Match Results & Compute Payouts
          </h2>
          <p className="text-xs text-neutral-400">
            Select a completed match, enter verified Booyah placements and credited kills. The system automatically computes exact reward balances for instant settlement.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Select Match *</label>
              <select
                value={selectedMatchForResult?.id || ''}
                onChange={(e) => {
                  const m = matches.find((match) => match.id === e.target.value);
                  setSelectedMatchForResult(m || null);
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">-- Choose a Match --</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} (₹{m.entryFee} - {m.gameModeName})
                  </option>
                ))}
              </select>
            </div>

            {selectedMatchForResult && (
              <form onSubmit={handlePublishResultsSubmit} className="space-y-5 pt-3">
                {/* 1st place */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <span className="text-xs font-extrabold text-amber-400 uppercase">1st Place (Booyah Champion)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Player / Team IGN"
                      value={winnerName}
                      onChange={(e) => setWinnerName(e.target.value)}
                      className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Free Fire UID"
                      value={winnerUid}
                      onChange={(e) => setWinnerUid(e.target.value)}
                      className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Kills Count"
                      value={winnerKills}
                      onChange={(e) => setWinnerKills(Number(e.target.value))}
                      className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* 2nd place */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <span className="text-xs font-extrabold text-neutral-300 uppercase">2nd Place (Runner Up)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Player / Team IGN"
                      value={runnerUpName}
                      onChange={(e) => setRunnerUpName(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Free Fire UID"
                      value={runnerUpUid}
                      onChange={(e) => setRunnerUpUid(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Kills Count"
                      value={runnerUpKills}
                      onChange={(e) => setRunnerUpKills(Number(e.target.value))}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* 3rd place */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <span className="text-xs font-extrabold text-neutral-300 uppercase">3rd Place (Podium)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Player / Team IGN"
                      value={thirdName}
                      onChange={(e) => setThirdName(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Free Fire UID"
                      value={thirdUid}
                      onChange={(e) => setThirdUid(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Kills Count"
                      value={thirdKills}
                      onChange={(e) => setThirdKills(Number(e.target.value))}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Publish Verified Match Results & Settle Ledger
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL SAFETY CALCULATOR */}
      {activeTab === 'FINANCIAL_CALC' && (
        <div className="space-y-6 max-w-2xl bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Financial Safety & Profitability Calculator
          </h2>
          <p className="text-xs text-neutral-400">
            Simulate room entry slabs, placement bonuses (2.0x, 1.3x, 1.2x), and maximum permitted kill liabilities to guarantee a gross surplus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Entry Fee (₹)</label>
              <input
                type="number"
                value={calcEntryFee}
                onChange={(e) => setCalcEntryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Player Capacity</label>
              <input
                type="number"
                value={calcPlayers}
                onChange={(e) => setCalcPlayers(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Per-Kill Bounty (₹)</label>
              <input
                type="number"
                value={calcKillRate}
                onChange={(e) => setCalcKillRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Worst-Case Kill Count</label>
              <input
                type="number"
                value={calcEstimatedKills}
                onChange={(e) => setCalcEstimatedKills(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Total Entry Collection:</span>
              <strong className="text-white font-mono">₹{totalSimulatedCollection.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Top-3 Placement Base Payout:</span>
              <strong className="text-neutral-300 font-mono">₹{placementTotal.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Estimated Total Kill Bounty:</span>
              <strong className="text-neutral-300 font-mono">₹{killPayoutTotal.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-xs border-t border-neutral-800 pt-2">
              <span className="text-neutral-400">Max Total Player Liability:</span>
              <strong className="text-amber-400 font-mono">₹{maxTotalLiability.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-neutral-800 pt-2">
              <span className="text-white">Projected Gross Surplus:</span>
              <span className={isBudgetDeficit ? 'text-red-400' : 'text-emerald-400 font-mono'}>
                ₹{projectedSurplus.toLocaleString()}
              </span>
            </div>
          </div>

          {isBudgetDeficit ? (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Warning: Budget Deficit.</strong> Player payouts exceed total collection. Lower the per-kill bounty or increase entry fee.
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Within Configured Budget:</strong> Healthy room economics for sustainable tournament operations.
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6 max-w-2xl bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                UPI Merchant & Support Configuration
              </h2>
              <p className="text-xs text-neutral-400">Configure global payment details, WhatsApp desk, and announcements.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('UPI_APPS')}
                className="px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI Apps & Logos</span>
              </button>
              <button
                onClick={() => setActiveTab('MEDIA_MANAGER')}
                className="px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Change QR & Banners</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Official Merchant UPI ID *</label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => updateSettings({ upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">UPI Account Holder Name</label>
              <input
                type="text"
                value={settings.upiName}
                onChange={(e) => updateSettings({ upiName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Support WhatsApp Number *</label>
              <input
                type="text"
                value={settings.supportWhatsApp}
                onChange={(e) => updateSettings({ supportWhatsApp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Send className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">Official Telegram Channel / Group</h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                Players will see this link across the website to join the official Telegram channel for instant match room passwords, tournament updates, and winner announcements.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Telegram Invite URL *</label>
                  <input
                    type="url"
                    placeholder="https://t.me/your_channel_name"
                    value={settings.telegramUrl || ''}
                    onChange={(e) => updateSettings({ telegramUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Telegram Channel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. POP Gaming Official Esports"
                    value={settings.telegramChannelName || ''}
                    onChange={(e) => updateSettings({ telegramChannelName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Announcement Ticker Text</label>
              <textarea
                rows={2}
                value={settings.announcementTicker}
                onChange={(e) => updateSettings({ announcementTicker: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MATCH */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin Room Creator
                </span>
                <h3 className="text-lg font-black text-white uppercase mt-1">Create New Tournament Room</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatchSubmit} className="space-y-4 text-xs">
              {/* Quick 1-Click Tournament Presets */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                  ⚡ 1-Click Quick Match Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMatchTitle('Daily Tournament Solo Bermuda Warmup');
                      setNewMatchMode('solo-br');
                      setNewMatchEntry(20);
                      setNewMatchCapacity(48);
                      setNewMatchTime('Tonight at 8:00 PM');
                      setNewMatchMap('Bermuda');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-orange-600/20 text-neutral-300 hover:text-orange-300 border border-neutral-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    🔥 Daily Tournament (₹20)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMatchTitle('Grand Championship Finals (4-Day Mega)');
                      setNewMatchMode('mega-championship');
                      setNewMatchEntry(500);
                      setNewMatchCapacity(48);
                      setNewMatchTime('Sunday Mega Finals at 9:00 PM');
                      setNewMatchMap('Bermuda');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-amber-600/20 text-neutral-300 hover:text-amber-300 border border-neutral-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    🏆 Grand Championship (₹500)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMatchTitle('CS 1v1 One-Tap Only Headshot');
                      setNewMatchMode('headshot-mode');
                      setNewMatchEntry(100);
                      setNewMatchCapacity(2);
                      setNewMatchTime('Within 10 Minutes');
                      setNewMatchMap('CS Clock Tower');
                      setNewMatchOnlyHeadshot(true);
                      setNewMatchUnlimitedGloo(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-600/20 text-neutral-300 hover:text-red-300 border border-neutral-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    🎯 CS Only Headshot (₹100)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMatchTitle('Lone Wolf 1v1 Gladiator Arena');
                      setNewMatchMode('lone-wolf-1v1');
                      setNewMatchEntry(50);
                      setNewMatchCapacity(2);
                      setNewMatchTime('Within 15 Minutes');
                      setNewMatchMap('Iron Cage');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-purple-600/20 text-neutral-300 hover:text-purple-300 border border-neutral-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    🐺 Lone Wolf 1v1 (₹50)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMatchTitle('CS 4v4 Clan War (Unlimited Gloo)');
                      setNewMatchMode('cs-custom');
                      setNewMatchEntry(200);
                      setNewMatchCapacity(8);
                      setNewMatchTime('Tonight at 9:30 PM');
                      setNewMatchMap('CS Factory');
                      setNewMatchUnlimitedGloo(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-blue-600/20 text-neutral-300 hover:text-blue-300 border border-neutral-800 text-[11px] font-bold transition cursor-pointer"
                  >
                    💥 CS 4v4 Custom (₹200)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Room Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solo Bermuda Prime #05"
                  value={newMatchTitle}
                  onChange={(e) => setNewMatchTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-300 mb-1">Game Mode *</label>
                  <select
                    value={newMatchMode}
                    onChange={(e) => {
                      const m = e.target.value as GameModeId;
                      setNewMatchMode(m);
                      // Auto adjust capacity
                      if (m === 'cs-1v1' || m === 'lone-wolf-1v1' || m === 'headshot-mode') {
                        setNewMatchCapacity(2);
                      } else if (m === 'cs-2v2' || m === 'lone-wolf-2v2') {
                        setNewMatchCapacity(4);
                      } else if (m === 'cs-4v4' || m === 'cs-custom') {
                        setNewMatchCapacity(8);
                      } else {
                        setNewMatchCapacity(48);
                      }
                      if (m === 'headshot-mode') {
                        setNewMatchOnlyHeadshot(true);
                      }
                      if (m === 'cs-custom') {
                        setNewMatchUnlimitedGloo(true);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold"
                  >
                    <option value="solo-br">👑 Battle Royale Solo (1v1 Survival)</option>
                    <option value="duo-br">👥 Battle Royale Duo (2 Players)</option>
                    <option value="squad-br">⚔️ Battle Royale Squad (4v4)</option>
                    <option value="cs-1v1">🎯 Clash Squad 1v1 Duel</option>
                    <option value="cs-2v2">🔥 Clash Squad 2v2 Tag</option>
                    <option value="cs-4v4">💥 Clash Squad 4v4 Clan War</option>
                    <option value="cs-custom">🛡️ CS Custom (Unlimited Gloo Wall)</option>
                    <option value="headshot-mode">🔴 Only Headshot Custom (One-Tap)</option>
                    <option value="lone-wolf-1v1">🐺 Lone Wolf Solo 1v1 (Iron Cage)</option>
                    <option value="lone-wolf-2v2">🐺 Lone Wolf Duo 2v2 (Iron Cage)</option>
                    <option value="monthly-championship">🏆 Monthly Grand Championship</option>
                    <option value="mega-championship">🌟 Mega 4-Day Championship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Entry Fee (₹)</label>
                  <select
                    value={newMatchEntry}
                    onChange={(e) => setNewMatchEntry(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                  >
                    {[20, 40, 50, 100, 200, 300, 400, 500, 1000].map((val) => (
                      <option key={val} value={val}>
                        ₹{val}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Room Capacity (Slots)</label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={newMatchCapacity}
                    onChange={(e) => setNewMatchCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newMatchTime}
                    onChange={(e) => setNewMatchTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Map Name</label>
                  <select
                    value={newMatchMap}
                    onChange={(e) => setNewMatchMap(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Iron Cage">Iron Cage</option>
                    <option value="CS Clock Tower">CS Clock Tower</option>
                    <option value="CS Factory">CS Factory</option>
                    <option value="CS Rim Nam Village">CS Rim Nam Village</option>
                  </select>
                </div>
              </div>

              {/* Room Rules Configuration */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider block">
                  ⚙️ Free Fire Room Rule Options:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchGunAttributes}
                      onChange={(e) => setNewMatchGunAttributes(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Gun Attributes</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchCharacterSkill}
                      onChange={(e) => setNewMatchCharacterSkill(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Character Skill</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchUnlimitedGloo}
                      onChange={(e) => setNewMatchUnlimitedGloo(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Unlimited Gloo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchOnlyHeadshot}
                      onChange={(e) => setNewMatchOnlyHeadshot(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-rose-300 font-medium">Only Headshot</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchLimitedAmmo}
                      onChange={(e) => setNewMatchLimitedAmmo(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Limited Ammo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMatchRevivesAllowed}
                      onChange={(e) => setNewMatchRevivesAllowed(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Revives Allowed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Custom Notes / Prize Summary</label>
                <textarea
                  rows={2}
                  value={newMatchCustomNotes}
                  onChange={(e) => setNewMatchCustomNotes(e.target.value)}
                  placeholder="Leave empty for auto-calculated rewards..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold cursor-pointer shadow-lg shadow-orange-600/30"
                >
                  Publish Room to Public Lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FULL MATCH & SLOTS */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin Match & Slot Editor
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Edit Room: {editingMatch.title}
                </h3>
                <p className="text-xs text-neutral-400">
                  Update match mode, rules, slot counts, fees, timings and in-game room credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingMatch(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMatch} className="space-y-4 text-xs">
              {/* Row 1: Title & Match Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-300 mb-1">Match Title *</label>
                  <input
                    type="text"
                    required
                    value={editMatchTitle}
                    onChange={(e) => setEditMatchTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Match Code *</label>
                  <input
                    type="text"
                    required
                    value={editMatchCode}
                    onChange={(e) => setEditMatchCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-orange-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 1.5: Game Mode Selection */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">Match Type / Game Mode *</label>
                <select
                  value={editMatchMode}
                  onChange={(e) => setEditMatchMode(e.target.value as GameModeId)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold"
                >
                  <option value="solo-br">👑 Battle Royale Solo (1v1 Survival)</option>
                  <option value="duo-br">👥 Battle Royale Duo (2 Players)</option>
                  <option value="squad-br">⚔️ Battle Royale Squad (4v4)</option>
                  <option value="cs-1v1">🎯 Clash Squad 1v1 Duel</option>
                  <option value="cs-2v2">🔥 Clash Squad 2v2 Tag</option>
                  <option value="cs-4v4">💥 Clash Squad 4v4 Clan War</option>
                  <option value="cs-custom">🛡️ CS Custom (Unlimited Gloo Wall)</option>
                  <option value="headshot-mode">🔴 Only Headshot Custom (One-Tap)</option>
                  <option value="lone-wolf-1v1">🐺 Lone Wolf Solo 1v1 (Iron Cage)</option>
                  <option value="lone-wolf-2v2">🐺 Lone Wolf Duo 2v2 (Iron Cage)</option>
                  <option value="monthly-championship">🏆 Monthly Grand Championship</option>
                  <option value="mega-championship">🌟 Mega 4-Day Championship</option>
                </select>
              </div>

              {/* Row 2: Slot Numbers & Fast Sync */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-400" />
                    Slot & Capacity Control
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 text-[11px]">Real Verified Registrations:</span>
                    <strong className="text-emerald-400 font-bold">
                      {getMatchConfirmedSlots(editingMatch.id)} Players
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Confirmed Slots / Approved Count *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        max={editMatchMaxPlayers}
                        required
                        value={editMatchApprovedCount}
                        onChange={(e) => setEditMatchApprovedCount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-black text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setEditMatchApprovedCount(getMatchConfirmedSlots(editingMatch.id))}
                        className="px-2.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold text-[11px] whitespace-nowrap border border-emerald-500/30 cursor-pointer"
                        title="Set to exact verified count"
                      >
                        Set Real
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMatchApprovedCount(0)}
                        className="px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[11px] whitespace-nowrap cursor-pointer"
                      >
                        0
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Max Players (Total Room Capacity) *
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      required
                      value={editMatchMaxPlayers}
                      onChange={(e) => setEditMatchMaxPlayers(Math.max(2, Number(e.target.value)))}
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Status, Entry Fee, Per Kill Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Room Status</label>
                  <select
                    value={editMatchStatus}
                    onChange={(e) => setEditMatchStatus(e.target.value as MatchStatus)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold"
                  >
                    <option value="REGISTRATION_OPEN">REGISTRATION OPEN</option>
                    <option value="FILLING_SLOWLY">FILLING SLOWLY</option>
                    <option value="ALMOST_FULL">ALMOST FULL</option>
                    <option value="FULL">FULL (LOBBY CLOSED)</option>
                    <option value="STARTING_SOON">STARTING SOON</option>
                    <option value="LIVE">LIVE MATCH</option>
                    <option value="RESULTS_PENDING">RESULTS PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editMatchEntryFee}
                    onChange={(e) => setEditMatchEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Per-Kill Reward (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editMatchPerKillReward}
                    onChange={(e) => setEditMatchPerKillReward(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-orange-400 font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Scheduled Time & Map */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Scheduled Time Display</label>
                  <input
                    type="text"
                    value={editMatchTime}
                    onChange={(e) => setEditMatchTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                    placeholder="e.g. Tonight at 9:00 PM"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Map Name</label>
                  <input
                    type="text"
                    value={editMatchMap}
                    onChange={(e) => setEditMatchMap(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                    placeholder="e.g. Bermuda / Purgatory / Iron Cage"
                  />
                </div>
              </div>

              {/* Room Rules Toggles */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider block">
                  ⚙️ Room Rule Settings & Details:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchGunAttributes}
                      onChange={(e) => setEditMatchGunAttributes(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Gun Attributes</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchCharacterSkill}
                      onChange={(e) => setEditMatchCharacterSkill(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Character Skill</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchUnlimitedGloo}
                      onChange={(e) => setEditMatchUnlimitedGloo(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Unlimited Gloo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchOnlyHeadshot}
                      onChange={(e) => setEditMatchOnlyHeadshot(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-rose-300 font-medium">Only Headshot</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchLimitedAmmo}
                      onChange={(e) => setEditMatchLimitedAmmo(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Limited Ammo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchRevivesAllowed}
                      onChange={(e) => setEditMatchRevivesAllowed(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-[11px] text-neutral-300 font-medium">Revives Allowed</span>
                  </label>
                </div>
              </div>

              {/* Row 5: Room Credentials & Instant Release */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    Private Room Credentials
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMatchCredentialsReleased}
                      onChange={(e) => setEditMatchCredentialsReleased(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 bg-neutral-900 border-neutral-700"
                    />
                    <span className={`text-[11px] font-bold ${
                      editMatchCredentialsReleased ? 'text-emerald-400' : 'text-neutral-400'
                    }`}>
                      {editMatchCredentialsReleased ? 'Credentials Live in App' : 'Hidden from Players'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Free Fire Room ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 98402194"
                      value={editMatchRoomId}
                      onChange={(e) => setEditMatchRoomId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Room Password</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234"
                      value={editMatchRoomPassword}
                      onChange={(e) => setEditMatchRoomPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Custom Notes */}
              <div>
                <label className="block font-bold text-neutral-300 mb-1">Custom Notes / Prize Summary</label>
                <textarea
                  rows={2}
                  value={editMatchNotes}
                  onChange={(e) => setEditMatchNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-medium resize-none"
                  placeholder="e.g. 1st: ₹100, 2nd: ₹65, 3rd: ₹60 + ₹17 per kill bounty."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes & Update Lobby</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SET ROOM CREDENTIALS */}
      {selectedMatchForCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white uppercase">
              Set Room ID & Password ({selectedMatchForCreds.matchCode})
            </h3>
            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Free Fire Room ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 84920194"
                  value={credsRoomId}
                  onChange={(e) => setCredsRoomId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Room Password *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234"
                  value={credsPassword}
                  onChange={(e) => setCredsPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatchForCreds(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold cursor-pointer"
                >
                  Save & Release to Approved Players
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Database / Purge Test Data Modal */}
      {showCleanDbModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  Purge All Test & Dummy Data
                </h3>
                <span className="text-xs text-red-400 font-semibold">1-Click Production Reset</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This action will reset your database to a completely clean state:
            </p>
            <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-5">
              <li>Clears all test registrations and pending payments</li>
              <li>Clears fake wallet balances and sample transactions</li>
              <li>Resets all room slot counts to 0 confirmed</li>
              <li>Clears withdrawal test requests and notifications</li>
              <li>Wipes legacy mock data from browser localStorage</li>
            </ul>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanDbModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetEntireDatabaseToCleanState();
                  setShowCleanDbModal(false);
                  alert('Database and browser storage have been reset to a 100% clean production state!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-red-600/30"
              >
                Confirm & Wipe Clean
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
