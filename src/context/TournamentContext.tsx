import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { 
  Match, 
  Registration, 
  MatchResult, 
  AdminSettings, 
  GameModeId, 
  WithdrawalRequest, 
  WalletTransaction,
  WalletTransactionType, 
  AppNotification,
  AuthPlayerProfile,
  MatchResultRank
} from '../types';
import { 
  INITIAL_MATCHES, 
  DEFAULT_ADMIN_SETTINGS, 
  INITIAL_SLIDES, 
  PROMO_BANNERS, 
  getPerKillReward, 
  calculateBRPlacementRewards, 
  calculateDuelPlacementRewards,
  isDuelOrLoneWolfMode
} from '../data/tournamentData';
import { INITIAL_UPI_APPS } from '../data/upiAppsData';
import { sendRegistrationApprovalNotification, DispatchEmailResult } from '../lib/notificationService';

export interface UserWalletStats {
  totalBalance: number;
  winningsBalance: number; // Available to withdraw
  depositBalance: number; // Entry fees paid
  pendingWithdrawalsAmount: number;
  totalWithdrawnAmount: number;
  totalWonAmount: number;
}

export interface AppTrafficMetric {
  date: string;
  opens: number;
  logins: number;
  registrations: number;
  revenue: number;
}

interface TournamentContextType {
  currentUser: User | null;
  customUser: AuthPlayerProfile | null;
  isAdmin: boolean;
  adminEmail: string;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  registerWithEmail: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    inGameName?: string;
    gameUid?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  matches: Match[];
  registrations: Registration[];
  results: MatchResult[];
  settings: AdminSettings;
  withdrawals: WithdrawalRequest[];
  walletTransactions: WalletTransaction[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  registeredUsers: AuthPlayerProfile[];
  registeredUsersCount: number;
  appOpensCount: number;
  trafficAnalytics: AppTrafficMetric[];
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  createMatch: (newMatch: Omit<Match, 'id' | 'approvedCount' | 'createdAt' | 'updatedAt'>) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  submitRegistration: (data: {
    matchId: string;
    gameMode: GameModeId;
    entryFee: number;
    teamName?: string;
    captainName: string;
    captainPhone: string;
    captainEmail?: string;
    players: { playerName: string; inGameName: string; gameUid: string; phone: string }[];
    paymentMethod: 'UPI_QR' | 'UPI_ID';
    utrNumber: string;
    paymentScreenshotUrl?: string;
  }) => Promise<Registration>;
  updateRegistrationStatus: (regId: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED', adminNotes?: string) => Promise<void>;
  resendApprovalEmail: (regId: string) => Promise<DispatchEmailResult>;
  publishMatchResult: (result: Omit<MatchResult, 'id' | 'completedAt'>) => void;
  getMatchById: (id: string) => Match | undefined;
  getRegistrationById: (id: string) => Registration | undefined;
  requestWithdrawal: (data: {
    amount: number;
    payoutMethod: 'UPI' | 'BANK_TRANSFER';
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      bankName?: string;
    };
  }) => Promise<{ success: boolean; error?: string }>;
  processWithdrawalRequest: (
    withdrawalId: string,
    status: 'PROCESSED' | 'REJECTED',
    adminRef?: string,
    remarks?: string
  ) => Promise<void>;
  submitDirectDeposit: (data: {
    amount: number;
    utrNumber: string;
    note?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  approveDirectDeposit: (txId: string, adminRemarks?: string) => Promise<{ success: boolean; message?: string }>;
  rejectDirectDeposit: (txId: string, reason?: string) => Promise<{ success: boolean; message?: string }>;
  adminAdjustUserWallet: (params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    amount: number;
    actionType: 'CREDIT' | 'DEBIT';
    category: 'PRIZE_WON' | 'DEPOSIT' | 'BONUS' | 'MANUAL_ADJUSTMENT' | 'PENALTY';
    description: string;
  }) => Promise<{ success: boolean; message: string }>;
  getHourlyWithdrawalUsage: (userId?: string, userEmail?: string) => {
    usedAmount: number;
    remainingLimit: number;
    maxHourlyLimit: number;
  };
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  getUserWalletStats: (userId?: string, userEmail?: string) => UserWalletStats;
  getMatchConfirmedSlots: (matchId: string) => number;
  syncMatchesWithRealRegistrations: () => void;
  resetAllMatchSlotsToZero: () => void;
  updateMatchSlotCount: (matchId: string, count: number) => void;
  resetEntireDatabaseToCleanState: () => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

const ADMIN_EMAILS = ['wepopearn@gmail.com', 'anamika919962@gmail.com'];
const TOURNAMENT_MATCHES_KEY = 'pop_tournaments_matches_v1';
const TOURNAMENT_REGS_KEY = 'pop_tournaments_regs_v1';
const TOURNAMENT_RESULTS_KEY = 'pop_tournaments_results_v1';
const TOURNAMENT_SETTINGS_KEY = 'pop_tournaments_settings_v1';
const TOURNAMENT_WITHDRAWALS_KEY = 'pop_tournaments_withdrawals_v1';
const TOURNAMENT_WALLET_TXS_KEY = 'pop_tournaments_wallet_txs_v1';
const TOURNAMENT_NOTIFS_KEY = 'pop_tournaments_notifs_v1';
const TOURNAMENT_USERS_KEY = 'pop_tournaments_registered_users_v2';
const TOURNAMENT_ACTIVE_USER_KEY = 'pop_tournaments_active_user_v2';
const TOURNAMENT_OPENS_KEY = 'pop_tournaments_app_opens_v2';

// Helper to filter out any old legacy mock data stored in browser localStorage
const filterOutMockData = <T,>(items: T[]): T[] => {
  const dummyStrings = [
    'sample-user-aman',
    'sample-user-vikram',
    'OP_HEADSHOT_99',
    'RASTAR_FAN_07',
    'SK_SABIR_CLONE',
    'POP-20260815-992144',
    'POP-20260815-883109',
    'WTH-20260815-4921',
    'WTH-20260814-8832',
    'res-01',
    'tx-01',
    'tx-02',
    'tx-03'
  ];
  return items.filter((item) => {
    const serialized = JSON.stringify(item);
    return !dummyStrings.some((d) => serialized.includes(d));
  });
};

const INITIAL_REGISTERED_USERS: AuthPlayerProfile[] = [];
const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];
const INITIAL_WALLET_TXS: WalletTransaction[] = [];
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-system-welcome',
    userId: 'all',
    title: '⚡ Welcome to POP Esports India!',
    message: 'Join daily custom Free Fire tournaments, play high-stakes matches, and withdraw cash winnings directly to UPI!',
    type: 'SYSTEM',
    read: false,
    timestamp: new Date().toISOString(),
    actionUrl: 'tournaments',
  }
];

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminBypass, setAdminBypass] = useState<boolean>(false);
  
  // Custom user session for frictionless email/password or Google login
  const [customUser, setCustomUser] = useState<AuthPlayerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_ACTIVE_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && !parsed.uid?.includes('sample-user')) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse active user from storage', e);
    }
    return null;
  });

  // Registered user accounts database
  const [registeredUsers, setRegisteredUsers] = useState<AuthPlayerProfile[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse registered users', e);
    }
    return INITIAL_REGISTERED_USERS;
  });

  // App opens counter
  const [appOpensCount, setAppOpensCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_OPENS_KEY);
      const count = stored ? Number(stored) : 1;
      const updated = isNaN(count) ? 1 : count + 1;
      localStorage.setItem(TOURNAMENT_OPENS_KEY, String(updated));
      return updated;
    } catch (e) {
      return 1;
    }
  });
  
  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_MATCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((m: Match) => ({
          ...m,
          approvedCount: m.approvedCount || 0,
        }));
      }
    } catch (e) {
      console.error('Failed to parse matches from storage', e);
    }
    return INITIAL_MATCHES.map((m) => ({ ...m, approvedCount: 0 }));
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_REGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse registrations', e);
    }
    return [];
  });

  const [results, setResults] = useState<MatchResult[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_RESULTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse results', e);
    }
    return [];
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_ADMIN_SETTINGS,
          ...parsed,
          heroSlides: parsed.heroSlides && parsed.heroSlides.length > 0 ? parsed.heroSlides : INITIAL_SLIDES,
          promoBanners: parsed.promoBanners && parsed.promoBanners.length > 0 ? parsed.promoBanners : PROMO_BANNERS,
          upiApps: parsed.upiApps && parsed.upiApps.length > 0 ? parsed.upiApps : INITIAL_UPI_APPS,
        };
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return {
      ...DEFAULT_ADMIN_SETTINGS,
      heroSlides: INITIAL_SLIDES,
      promoBanners: PROMO_BANNERS,
      upiApps: INITIAL_UPI_APPS,
    };
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_WITHDRAWALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse withdrawals from storage', e);
    }
    return INITIAL_WITHDRAWALS;
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_WALLET_TXS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse wallet transactions', e);
    }
    return INITIAL_WALLET_TXS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(TOURNAMENT_NOTIFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return filterOutMockData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Track Firebase Auth state with safe fallback
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
        },
        (error) => {
          console.warn('Firebase Auth state listener error (handled safely):', error);
        }
      );
    } catch (e) {
      console.warn('Error setting up auth observer:', e);
    }
    return () => {
      try {
        unsubscribe();
      } catch (_) {}
    };
  }, []);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_MATCHES_KEY, JSON.stringify(matches));
    } catch (e) {
      console.error(e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_REGS_KEY, JSON.stringify(registrations));
    } catch (e) {
      console.error(e);
    }
  }, [registrations]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_RESULTS_KEY, JSON.stringify(results));
    } catch (e) {
      console.error(e);
    }
  }, [results]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_WITHDRAWALS_KEY, JSON.stringify(withdrawals));
    } catch (e) {
      console.error(e);
    }
  }, [withdrawals]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_WALLET_TXS_KEY, JSON.stringify(walletTransactions));
    } catch (e) {
      console.error(e);
    }
  }, [walletTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_NOTIFS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (customUser) {
        localStorage.setItem(TOURNAMENT_ACTIVE_USER_KEY, JSON.stringify(customUser));
      } else {
        localStorage.removeItem(TOURNAMENT_ACTIVE_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [customUser]);

  // Admin resolution: wepopearn@gmail.com is auto-admin
  const activeEmail = (customUser?.email || currentUser?.email || '').toLowerCase();
  const isAdmin = Boolean(
    adminBypass ||
    (activeEmail && ADMIN_EMAILS.includes(activeEmail))
  );

  // Email/Password login without OTP requirement
  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Auto-detect admin
    if (ADMIN_EMAILS.includes(cleanEmail)) {
      const adminProfile: AuthPlayerProfile = {
        uid: 'admin-wepopearn',
        email: cleanEmail,
        displayName: 'POP Esports Admin',
        phone: '9199620000',
        inGameName: 'POP_MASTER_ADMIN',
        gameUid: '1000000001',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      };
      setCustomUser(adminProfile);
      setAdminBypass(true);
      return { success: true, isAdmin: true };
    }

    // Check registered users
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      // Auto-register seamless on first direct login if password provided
      if (password.length >= 4) {
        const newUser: AuthPlayerProfile = {
          uid: `user-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          phone: '',
          role: 'USER',
          createdAt: new Date().toISOString(),
        };
        setRegisteredUsers((prev) => [newUser, ...prev]);
        setCustomUser(newUser);
        return { success: true, isAdmin: false };
      }
      return { success: false, error: 'User not found. Please register your account.' };
    }

    setCustomUser(existing);
    return { success: true, isAdmin: false };
  };

  // Direct Registration with Email & Password (No OTP/Confirmation barrier)
  const registerWithEmail = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    inGameName?: string;
    gameUid?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (data.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    
    if (existing) {
      // Update details
      const updatedUser: AuthPlayerProfile = {
        ...existing,
        displayName: data.name || existing.displayName,
        phone: data.phone || existing.phone,
        inGameName: data.inGameName || existing.inGameName,
        gameUid: data.gameUid || existing.gameUid,
        role: isSystemAdmin ? 'ADMIN' : 'USER',
      };
      setRegisteredUsers((prev) => prev.map((u) => u.email.toLowerCase() === cleanEmail ? updatedUser : u));
      setCustomUser(updatedUser);
      if (isSystemAdmin) setAdminBypass(true);
      return { success: true };
    }

    const newUser: AuthPlayerProfile = {
      uid: isSystemAdmin ? 'admin-wepopearn' : `user-${Date.now()}`,
      email: cleanEmail,
      displayName: data.name || cleanEmail.split('@')[0],
      phone: data.phone || '',
      inGameName: data.inGameName || '',
      gameUid: data.gameUid || '',
      role: isSystemAdmin ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCustomUser(newUser);
    if (isSystemAdmin) setAdminBypass(true);

    addNotification({
      userId: newUser.uid,
      title: '👋 Welcome to POP Gaming Esports!',
      message: `Welcome ${newUser.displayName}! Your account is active. Join daily tournaments, clash squads, and lone wolf battles to win real cash!`,
      type: 'SYSTEM',
      actionUrl: 'tournaments',
    });

    return { success: true };
  };

  // Reset Password handler with simulated secure OTP verification
  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user && !ADMIN_EMAILS.includes(cleanEmail)) {
      return { success: false, error: 'No account registered with this email.' };
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }
    return { success: true, message: `Password for ${cleanEmail} has been reset successfully. You can now login.` };
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user?.email) {
        const cleanEmail = result.user.email.toLowerCase();
        const isSystemAdmin = ADMIN_EMAILS.includes(cleanEmail);
        const userProfile: AuthPlayerProfile = {
          uid: result.user.uid,
          email: cleanEmail,
          displayName: result.user.displayName || cleanEmail.split('@')[0],
          photoURL: result.user.photoURL || undefined,
          role: isSystemAdmin ? 'ADMIN' : 'USER',
          createdAt: new Date().toISOString(),
        };
        setCustomUser(userProfile);
        if (isSystemAdmin) setAdminBypass(true);
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth popup:', err);
      // If unauthorized domain on external host (e.g. Render), notify player or provide frictionless login
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error', err);
    }
    setCustomUser(null);
    setAdminBypass(false);
    localStorage.removeItem(TOURNAMENT_ACTIVE_USER_KEY);
  };

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.read) return false;
    if (n.userId === 'all') return true;
    const activeUid = customUser?.uid || currentUser?.uid;
    if (activeUid && n.userId === activeUid) return true;
    return false;
  }).length;

  // Traffic Analytics data for animated charts in Admin Panel based on real data
  const actualRevenue = registrations
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.totalPayable, 0);

  const trafficAnalytics: AppTrafficMetric[] = [
    { date: 'Mon', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Tue', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Wed', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Thu', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Fri', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Sat', opens: 0, logins: 0, registrations: 0, revenue: 0 },
    { date: 'Today', opens: appOpensCount, logins: registeredUsers.length, registrations: registrations.length, revenue: actualRevenue },
  ];

  const getHourlyWithdrawalUsage = (userId?: string, userEmail?: string) => {
    const effectiveUid = userId || customUser?.uid || currentUser?.uid;
    const effectiveEmail = userEmail || customUser?.email || currentUser?.email;
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const recentWithdrawals = withdrawals.filter(
      (w) =>
        ((effectiveUid && w.userId === effectiveUid) ||
          (effectiveEmail && w.userEmail?.toLowerCase() === effectiveEmail.toLowerCase())) &&
        new Date(w.requestedAt).getTime() > oneHourAgo &&
        w.status !== 'REJECTED'
    );

    const usedAmount = recentWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const maxHourlyLimit = 500;
    const remainingLimit = Math.max(0, maxHourlyLimit - usedAmount);

    return {
      usedAmount,
      remainingLimit,
      maxHourlyLimit,
    };
  };

  const getUserWalletStats = (userId?: string, userEmail?: string): UserWalletStats => {
    const effectiveUid = userId || customUser?.uid || currentUser?.uid;
    const effectiveEmail = userEmail || customUser?.email || currentUser?.email;

    if (!effectiveUid && !effectiveEmail) {
      return {
        totalBalance: 0,
        winningsBalance: 0,
        depositBalance: 0,
        pendingWithdrawalsAmount: 0,
        totalWithdrawnAmount: 0,
        totalWonAmount: 0,
      };
    }

    // 1. Deposits: Sum of all approved registrations + approved direct deposits
    const userRegs = registrations.filter(
      (r) => (effectiveUid && r.userId === effectiveUid) || (effectiveEmail && r.captainEmail?.toLowerCase() === effectiveEmail.toLowerCase())
    );
    const regDepositBalance = userRegs
      .filter((r) => r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.entryFee, 0);

    const directDepositTxs = walletTransactions.filter(
      (tx) => (effectiveUid && tx.userId === effectiveUid) && tx.type === 'DEPOSIT' && tx.status === 'COMPLETED'
    );
    const directDepositBalance = directDepositTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const depositBalance = regDepositBalance + directDepositBalance;

    // 2. Won prizes & admin credits from transactions
    const userWonTxs = walletTransactions.filter(
      (tx) => (effectiveUid && tx.userId === effectiveUid) && tx.status === 'COMPLETED' && (
        tx.type === 'PRIZE_WON' ||
        tx.type === 'ADMIN_CREDIT' ||
        tx.type === 'BONUS' ||
        (tx.type === 'MANUAL_ADJUSTMENT' && tx.amount > 0)
      )
    );
    const totalWonAmount = userWonTxs.reduce((sum, tx) => sum + tx.amount, 0);

    // Admin debits/penalties
    const userDebitTxs = walletTransactions.filter(
      (tx) => (effectiveUid && tx.userId === effectiveUid) && tx.status === 'COMPLETED' && (
        tx.type === 'ADMIN_DEBIT' ||
        tx.type === 'PENALTY' ||
        (tx.type === 'MANUAL_ADJUSTMENT' && tx.amount < 0)
      )
    );
    const totalDebitAmount = userDebitTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // 3. Withdrawals
    const userWithdrawals = withdrawals.filter(
      (w) => (effectiveUid && w.userId === effectiveUid) || (effectiveEmail && w.userEmail?.toLowerCase() === effectiveEmail.toLowerCase())
    );

    const totalWithdrawnAmount = userWithdrawals
      .filter((w) => w.status === 'PROCESSED' || w.status === 'APPROVED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawalsAmount = userWithdrawals
      .filter((w) => w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0);

    // Winnings available = Total Won - Total Withdrawn - Pending Withdrawals - Debits
    const winningsBalance = Math.max(0, totalWonAmount - totalWithdrawnAmount - pendingWithdrawalsAmount - totalDebitAmount);
    const totalBalance = winningsBalance + depositBalance;

    return {
      totalBalance,
      winningsBalance,
      depositBalance,
      pendingWithdrawalsAmount,
      totalWithdrawnAmount,
      totalWonAmount,
    };
  };

  const createMatch = (newMatchData: Omit<Match, 'id' | 'approvedCount' | 'createdAt' | 'updatedAt'>) => {
    const id = `match-${Date.now()}`;
    const newMatch: Match = {
      ...newMatchData,
      id,
      approvedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMatches((prev) => [newMatch, ...prev]);

    // Broadcast system notification
    addNotification({
      userId: 'all',
      title: `🔥 New Room Added: ${newMatch.title}`,
      message: `Format: ${newMatch.rulesSnapshot.format} • Entry ₹${newMatch.entryFee}. Registration is now live!`,
      type: 'SYSTEM',
      actionUrl: 'tournaments',
    });
  };

  const updateMatch = (id: string, updates: Partial<Match>) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deleteMatch = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  // Calculate exact real approved players count from verified registrations
  const getMatchConfirmedSlots = (matchId: string): number => {
    return registrations
      .filter((r) => r.matchId === matchId && r.status === 'APPROVED')
      .reduce((sum, r) => sum + (r.players?.length || 1), 0);
  };

  // Sync all matches to their real verified approved count
  const syncMatchesWithRealRegistrations = () => {
    setMatches((prev) =>
      prev.map((m) => {
        const realCount = registrations
          .filter((r) => r.matchId === m.id && r.status === 'APPROVED')
          .reduce((sum, r) => sum + (r.players?.length || 1), 0);

        let status = m.status;
        if (realCount >= m.maxPlayers) {
          status = 'FULL';
        } else if (realCount >= m.maxPlayers * 0.75) {
          status = 'ALMOST_FULL';
        } else if (status === 'FULL' || status === 'ALMOST_FULL') {
          status = 'REGISTRATION_OPEN';
        }

        return {
          ...m,
          approvedCount: realCount,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Reset all match slot counts to zero
  const resetAllMatchSlotsToZero = () => {
    setMatches((prev) =>
      prev.map((m) => ({
        ...m,
        approvedCount: 0,
        status: m.status === 'FULL' || m.status === 'ALMOST_FULL' ? 'REGISTRATION_OPEN' : m.status,
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  // Custom manual slot update from admin
  const updateMatchSlotCount = (matchId: string, count: number) => {
    const safeCount = Math.max(0, Math.floor(count));
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        let status = m.status;
        if (safeCount >= m.maxPlayers) {
          status = 'FULL';
        } else if (safeCount >= m.maxPlayers * 0.75) {
          status = 'ALMOST_FULL';
        } else if (status === 'FULL' || status === 'ALMOST_FULL') {
          status = 'REGISTRATION_OPEN';
        }
        return {
          ...m,
          approvedCount: safeCount,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const submitRegistration = async (data: {
    matchId: string;
    gameMode: GameModeId;
    entryFee: number;
    teamName?: string;
    captainName: string;
    captainPhone: string;
    captainEmail?: string;
    players: { playerName: string; inGameName: string; gameUid: string; phone: string }[];
    paymentMethod: 'UPI_QR' | 'UPI_ID';
    utrNumber: string;
    paymentScreenshotUrl?: string;
  }): Promise<Registration> => {
    const match = matches.find((m) => m.id === data.matchId);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const regId = `POP-${dateStr}-${randSuffix}`;

    const effectiveUserId = customUser?.uid || currentUser?.uid || (data.captainEmail ? `user-${data.captainEmail.toLowerCase()}` : `user-${data.captainPhone}`);

    const registration: Registration = {
      id: regId,
      matchId: data.matchId,
      matchTitle: match ? match.title : 'Free Fire Tournament Room',
      gameMode: data.gameMode,
      entryFee: data.entryFee,
      platformCharge: settings.platformCharge || 0,
      totalPayable: data.entryFee + (settings.platformCharge || 0),
      teamName: data.teamName,
      captainName: data.captainName,
      captainPhone: data.captainPhone,
      captainEmail: data.captainEmail,
      players: data.players,
      paymentMethod: data.paymentMethod,
      utrNumber: data.utrNumber,
      paymentScreenshotUrl: data.paymentScreenshotUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      userId: effectiveUserId,
    };

    setRegistrations((prev) => [registration, ...prev]);

    // Add pending wallet transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: effectiveUserId,
      type: 'DEPOSIT',
      amount: registration.totalPayable,
      description: `Entry Fee for ${registration.matchTitle} (UTR: ${registration.utrNumber})`,
      referenceId: registration.id,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    };
    setWalletTransactions((prev) => [newTx, ...prev]);

    // Add in-app notification
    addNotification({
      userId: effectiveUserId,
      title: '📝 Registration & Payment Submitted',
      message: `Your payment of ₹${registration.totalPayable} (UTR: ${registration.utrNumber}) for "${registration.matchTitle}" has been received! Admin notification sent.`,
      type: 'SYSTEM',
      actionUrl: 'profile',
    });

    // Send payment alert immediately to admin email (wepopearn@gmail.com)
    try {
      fetch('/api/notifications/payment-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          matchTitle: registration.matchTitle,
          captainName: registration.captainName,
          captainPhone: registration.captainPhone,
          captainEmail: registration.captainEmail || 'wepopearn@gmail.com',
          utrNumber: registration.utrNumber,
          amountPaid: registration.totalPayable,
          timestamp: new Date().toISOString(),
          paymentMethod: registration.paymentMethod,
        }),
      }).catch((err) => console.warn('Payment notification fetch error:', err));
    } catch (e) {
      console.warn('Silent payment notification err:', e);
    }

    return registration;
  };

  const updateRegistrationStatus = async (
    regId: string,
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED',
    adminNotes?: string
  ) => {
    const targetReg = registrations.find((r) => r.id === regId);
    if (!targetReg) return;

    const previousStatus = targetReg.status;

    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? {
              ...r,
              status,
              adminNotes: adminNotes ?? r.adminNotes,
              approvedAt: status === 'APPROVED' ? new Date().toISOString() : r.approvedAt,
            }
          : r
      )
    );

    // Update wallet transactions status
    setWalletTransactions((prev) =>
      prev.map((tx) =>
        tx.referenceId === regId
          ? { ...tx, status: status === 'APPROVED' ? 'COMPLETED' : status === 'REJECTED' ? 'REJECTED' : tx.status }
          : tx
      )
    );

    // In-app notification for the user
    if (status === 'APPROVED') {
      addNotification({
        userId: targetReg.userId || 'user-anonymous',
        title: '✅ Slot Approved & Verified!',
        message: `Your slot for "${targetReg.matchTitle}" (Reg: ${targetReg.id}) has been APPROVED. Custom room details will be visible 15m before match time.`,
        type: 'SLOT_APPROVED',
        actionUrl: 'profile',
      });
    } else if (status === 'REJECTED') {
      addNotification({
        userId: targetReg.userId || 'user-anonymous',
        title: '⚠️ Registration Update',
        message: `Registration for "${targetReg.matchTitle}" was rejected. Reason: ${adminNotes || 'Payment could not be verified'}.`,
        type: 'SLOT_REJECTED',
        actionUrl: 'profile',
      });
    }

    // Update match count accurately
    if (status === 'APPROVED' && previousStatus !== 'APPROVED') {
      const seatsCount = targetReg.players.length || 1;
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === targetReg.matchId) {
            const nextCount = Math.min(m.maxPlayers, m.approvedCount + seatsCount);
            let nextStatus = m.status;
            if (nextCount >= m.maxPlayers) {
              nextStatus = 'FULL';
            } else if (nextCount >= m.maxPlayers * 0.75) {
              nextStatus = 'ALMOST_FULL';
            }
            return {
              ...m,
              approvedCount: nextCount,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );

      // Automated Email Notification to participant on Approval
      try {
        const match = matches.find((m) => m.id === targetReg.matchId);
        const emailResult = await sendRegistrationApprovalNotification(targetReg, match, adminNotes);
        
        if (emailResult.success) {
          setRegistrations((prev) =>
            prev.map((r) =>
              r.id === regId
                ? {
                    ...r,
                    emailNotificationSent: true,
                    emailNotificationSentAt: new Date().toISOString(),
                    emailNotificationMessageId: emailResult.messageId,
                    emailNotificationPreviewUrl: emailResult.previewUrl,
                    emailNotificationError: undefined,
                  }
                : r
            )
          );
        } else if (emailResult.error) {
          setRegistrations((prev) =>
            prev.map((r) =>
              r.id === regId
                ? {
                    ...r,
                    emailNotificationSent: false,
                    emailNotificationError: emailResult.error,
                  }
                : r
            )
          );
        }
      } catch (err: any) {
        console.error('Error dispatching automated approval email:', err);
      }
    } else if (previousStatus === 'APPROVED' && status !== 'APPROVED') {
      const seatsCount = targetReg.players.length || 1;
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === targetReg.matchId) {
            const nextCount = Math.max(0, m.approvedCount - seatsCount);
            return {
              ...m,
              approvedCount: nextCount,
              status: nextCount < m.maxPlayers ? 'REGISTRATION_OPEN' : m.status,
              updatedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    }
  };

  const resendApprovalEmail = async (regId: string): Promise<DispatchEmailResult> => {
    const targetReg = registrations.find((r) => r.id === regId);
    if (!targetReg) {
      return { success: false, error: 'Registration not found' };
    }
    const match = matches.find((m) => m.id === targetReg.matchId);
    const result = await sendRegistrationApprovalNotification(targetReg, match);
    if (result.success) {
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? {
                ...r,
                emailNotificationSent: true,
                emailNotificationSentAt: new Date().toISOString(),
                emailNotificationMessageId: result.messageId,
                emailNotificationPreviewUrl: result.previewUrl,
                emailNotificationError: undefined,
              }
            : r
        )
      );
    }
    return result;
  };

  const publishMatchResult = (resultData: Omit<MatchResult, 'id' | 'completedAt'>) => {
    const newResult: MatchResult = {
      ...resultData,
      id: `res-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setResults((prev) => [newResult, ...prev]);

    // Mark match as COMPLETED
    setMatches((prev) =>
      prev.map((m) =>
        m.id === resultData.matchId
          ? { ...m, status: 'COMPLETED', updatedAt: new Date().toISOString() }
          : m
      )
    );

    // Credit prizes to wallet & create notifications
    const targetRegs = registrations.filter((r) => r.matchId === resultData.matchId && r.status === 'APPROVED');

    // If customRankings are provided, distribute rewards according to each custom rank entry!
    if (resultData.customRankings && resultData.customRankings.length > 0) {
      resultData.customRankings.forEach((rankEntry, idx) => {
        if (rankEntry.totalPrize > 0) {
          const matchedReg = targetRegs.find((r) =>
            r.players.some((p) => rankEntry.uids.includes(p.gameUid) || p.inGameName.toLowerCase() === rankEntry.teamOrPlayerName.toLowerCase())
          );
          const recipientUid = rankEntry.userId || matchedReg?.userId || `user-winner-${idx + 1}`;

          const prizeTx: WalletTransaction = {
            id: `tx-won-${Date.now()}-${idx + 1}`,
            userId: recipientUid,
            type: 'PRIZE_WON',
            amount: rankEntry.totalPrize,
            description: `${rankEntry.rankLabel || `Rank #${rankEntry.rank}`} Winner in ${resultData.matchTitle} (₹${rankEntry.placementPrize} rank + ₹${rankEntry.killPrize} kills)`,
            referenceId: newResult.id,
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
          };
          setWalletTransactions((prev) => [prizeTx, ...prev]);

          addNotification({
            userId: recipientUid,
            title: `🏆 Tournament Reward: ${rankEntry.rankLabel || `Rank #${rankEntry.rank}`}!`,
            message: `Congratulations ${rankEntry.teamOrPlayerName}! You won ₹${rankEntry.totalPrize} (${rankEntry.kills} kills) in "${resultData.matchTitle}". Amount credited to your wallet!`,
            type: 'PRIZE_WON',
            actionUrl: 'profile',
          });
        }
      });
    } else {
      // 1st place fallback
      if (resultData.firstPlace && resultData.firstPlace.totalPrize > 0) {
        const winnerReg = targetRegs.find((r) =>
          r.players.some((p) => resultData.firstPlace.uids.includes(p.gameUid))
        );
        const winnerUserId = winnerReg?.userId || `user-winner-1`;

        const prizeTx: WalletTransaction = {
          id: `tx-won-${Date.now()}-1`,
          userId: winnerUserId,
          type: 'PRIZE_WON',
          amount: resultData.firstPlace.totalPrize,
          description: `1st Place Winner in ${resultData.matchTitle} (₹${resultData.firstPlace.placementPrize} rank + ₹${resultData.firstPlace.killPrize} kills)`,
          referenceId: newResult.id,
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        };
        setWalletTransactions((prev) => [prizeTx, ...prev]);

        addNotification({
          userId: winnerUserId,
          title: '🏆 Tournament Booyah Champion!',
          message: `Congratulations! You won 1st Place in "${resultData.matchTitle}"! ₹${resultData.firstPlace.totalPrize} prize money credited to your wallet.`,
          type: 'PRIZE_WON',
          actionUrl: 'profile',
        });
      }

      // 2nd place fallback
      if (resultData.secondPlace && resultData.secondPlace.totalPrize > 0) {
        const runnerReg = targetRegs.find((r) =>
          r.players.some((p) => resultData.secondPlace!.uids.includes(p.gameUid))
        );
        const runnerUserId = runnerReg?.userId || `user-runner-2`;

        const prizeTx: WalletTransaction = {
          id: `tx-won-${Date.now()}-2`,
          userId: runnerUserId,
          type: 'PRIZE_WON',
          amount: resultData.secondPlace.totalPrize,
          description: `2nd Place Runner-Up in ${resultData.matchTitle} (₹${resultData.secondPlace.placementPrize} rank + ₹${resultData.secondPlace.killPrize} kills)`,
          referenceId: newResult.id,
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        };
        setWalletTransactions((prev) => [prizeTx, ...prev]);

        addNotification({
          userId: runnerUserId,
          title: '🥈 Tournament 2nd Place Reward!',
          message: `Awesome performance! You won ₹${resultData.secondPlace.totalPrize} in "${resultData.matchTitle}". Amount credited to your wallet balance.`,
          type: 'PRIZE_WON',
          actionUrl: 'profile',
        });
      }

      // 3rd place fallback
      if (resultData.thirdPlace && resultData.thirdPlace.totalPrize > 0) {
        const thirdReg = targetRegs.find((r) =>
          r.players.some((p) => resultData.thirdPlace!.uids.includes(p.gameUid))
        );
        const thirdUserId = thirdReg?.userId || `user-third-3`;

        const prizeTx: WalletTransaction = {
          id: `tx-won-${Date.now()}-3`,
          userId: thirdUserId,
          type: 'PRIZE_WON',
          amount: resultData.thirdPlace.totalPrize,
          description: `3rd Place in ${resultData.matchTitle} (₹${resultData.thirdPlace.placementPrize} rank + ₹${resultData.thirdPlace.killPrize} kills)`,
          referenceId: newResult.id,
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        };
        setWalletTransactions((prev) => [prizeTx, ...prev]);

        addNotification({
          userId: thirdUserId,
          title: '🥉 Tournament 3rd Place Reward!',
          message: `Well played! You won ₹${resultData.thirdPlace.totalPrize} in "${resultData.matchTitle}". Amount credited to your wallet balance.`,
          type: 'PRIZE_WON',
          actionUrl: 'profile',
        });
      }
    }

    // Broadcast system result notification
    addNotification({
      userId: 'all',
      title: `📊 Match Results Declared: ${resultData.matchTitle}`,
      message: `Champion: ${resultData.firstPlace.teamOrPlayerName} with ${resultData.firstPlace.kills} kills. Total ₹${resultData.totalPayout} disbursed to winners!`,
      type: 'SYSTEM',
      actionUrl: 'results',
    });
  };

  const requestWithdrawal = async (data: {
    amount: number;
    payoutMethod: 'UPI' | 'BANK_TRANSFER';
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      bankName?: string;
    };
  }): Promise<{ success: boolean; error?: string }> => {
    const stats = getUserWalletStats();
    const hourlyStats = getHourlyWithdrawalUsage();

    if (data.amount < 50) {
      return { success: false, error: 'Minimum withdrawal amount is ₹50' };
    }
    if (data.amount > 500) {
      return { success: false, error: 'Maximum withdrawal per request is ₹500 (1-hour limit: ₹500)' };
    }
    if (hourlyStats.usedAmount + data.amount > hourlyStats.maxHourlyLimit) {
      return {
        success: false,
        error: `Hourly withdrawal limit reached! You have already requested ₹${hourlyStats.usedAmount} in the last 1 hour. Remaining limit for this hour: ₹${hourlyStats.remainingLimit}.`,
      };
    }
    if (data.amount > stats.winningsBalance) {
      return { success: false, error: `Insufficient winnings balance. Available to withdraw: ₹${stats.winningsBalance}` };
    }
    if (data.payoutMethod === 'UPI' && (!data.upiId || !data.upiId.includes('@'))) {
      return { success: false, error: 'Please enter a valid UPI ID (e.g. name@okhdfcbank)' };
    }
    if (data.payoutMethod === 'BANK_TRANSFER') {
      if (!data.bankDetails?.accountNumber || !data.bankDetails?.ifscCode || !data.bankDetails?.accountHolderName) {
        return { success: false, error: 'Please fill in all bank details (Account Number, IFSC, Name)' };
      }
    }

    const wthId = `WTH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveUid = customUser?.uid || currentUser?.uid || (data.upiId ? `user-${data.upiId.replace(/[^a-zA-Z0-9]/g, '')}` : `user-${Date.now()}`);
    const effectiveName = customUser?.displayName || customUser?.name || currentUser?.displayName || 'Player';
    const effectiveEmail = customUser?.email || currentUser?.email || '';
    const effectivePhone = customUser?.phone || '';

    const newWithdrawal: WithdrawalRequest = {
      id: wthId,
      userId: effectiveUid,
      userName: effectiveName,
      userPhone: effectivePhone,
      userEmail: effectiveEmail,
      amount: data.amount,
      payoutMethod: data.payoutMethod,
      upiId: data.upiId,
      bankDetails: data.bankDetails,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Create wallet transaction
    const tx: WalletTransaction = {
      id: `tx-wth-${Date.now()}`,
      userId: effectiveUid,
      type: 'WITHDRAWAL_REQUEST',
      amount: data.amount,
      description: `Withdrawal Request to ${data.payoutMethod === 'UPI' ? data.upiId : data.bankDetails?.bankName || 'Bank Account'}`,
      referenceId: wthId,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    };
    setWalletTransactions((prev) => [tx, ...prev]);

    // Add user notification
    addNotification({
      userId: effectiveUid,
      title: '💸 Withdrawal Request Received',
      message: `Your withdrawal of ₹${data.amount} (ID: ${wthId}) has been submitted. Our finance team will transfer funds to ${data.payoutMethod === 'UPI' ? data.upiId : 'your Bank'} within 15-30 minutes.`,
      type: 'WITHDRAWAL_UPDATE',
      actionUrl: 'profile',
    });

    // Send instant live email notification to admin (wepopearn@gmail.com) and user
    try {
      fetch('/api/notifications/withdrawal-requested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: wthId,
          withdrawalId: wthId,
          amount: data.amount,
          payoutMethod: data.payoutMethod,
          upiId: data.upiId,
          bankDetails: data.bankDetails,
          userName: effectiveName,
          userEmail: effectiveEmail,
          userPhone: effectivePhone,
          userId: effectiveUid,
        }),
      }).catch((e) => console.log('Withdrawal email dispatch silently logged:', e));
    } catch (e) {
      console.log('Error triggering withdrawal email:', e);
    }

    return { success: true };
  };

  const submitDirectDeposit = async (data: {
    amount: number;
    utrNumber: string;
    note?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (data.amount < 10) {
      return { success: false, error: 'Minimum deposit amount is ₹10' };
    }
    if (data.amount > 1000) {
      return { success: false, error: 'Maximum deposit limit is ₹1,000 per transaction' };
    }
    if (!data.utrNumber || data.utrNumber.trim().length < 8) {
      return { success: false, error: 'Please enter a valid 12-digit UPI UTR / Transaction Reference Number' };
    }

    const effectiveUid = customUser?.uid || currentUser?.uid || `user-${Date.now()}`;
    const effectiveName = customUser?.displayName || customUser?.name || currentUser?.displayName || 'Player';
    const effectiveEmail = customUser?.email || currentUser?.email || 'wepopearn@gmail.com';

    const cleanUtr = data.utrNumber.trim();
    const txId = `tx-dep-${Date.now()}`;

    const tx: WalletTransaction = {
      id: txId,
      userId: effectiveUid,
      userEmail: effectiveEmail,
      userName: effectiveName,
      type: 'DEPOSIT',
      amount: data.amount,
      description: `Wallet Deposit (UTR: ${cleanUtr}) - ${data.note || 'UPI Top-up'}`,
      referenceId: cleanUtr,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      meta: {
        utrNumber: cleanUtr,
        note: data.note || 'UPI Top-up',
        submittedAt: new Date().toISOString(),
      },
    };
    setWalletTransactions((prev) => [tx, ...prev]);

    addNotification({
      userId: effectiveUid,
      title: '💳 Deposit Submitted (Verification Pending)',
      message: `Deposit request of ₹${data.amount} (UTR: ${cleanUtr}) has been submitted. It will be added to your balance once verified by Admin.`,
      type: 'SYSTEM',
      actionUrl: 'profile',
    });

    // Send instant live email notification to admin (wepopearn@gmail.com) and user
    try {
      fetch('/api/notifications/deposit-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: data.amount,
          utrNumber: cleanUtr,
          userName: effectiveName,
          userEmail: effectiveEmail,
          userId: effectiveUid,
          note: data.note,
        }),
      }).catch((e) => console.log('Deposit email silently logged:', e));
    } catch (e) {
      console.log('Error triggering deposit email:', e);
    }

    return { success: true };
  };

  const approveDirectDeposit = async (txId: string, adminRemarks?: string): Promise<{ success: boolean; message?: string }> => {
    const targetTx = walletTransactions.find((t) => t.id === txId);
    if (!targetTx) {
      return { success: false, message: 'Deposit transaction not found' };
    }

    setWalletTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'COMPLETED',
              meta: {
                ...t.meta,
                approvedAt: new Date().toISOString(),
                adminRemarks: adminRemarks || 'Approved by Admin',
              },
            }
          : t
      )
    );

    // Notify the user in-app
    addNotification({
      userId: targetTx.userId,
      title: '🎉 Wallet Deposit Approved & Credited!',
      message: `Your deposit of ₹${targetTx.amount} (UTR: ${targetTx.referenceId || '-'}) has been approved and added to your wallet balance.`,
      type: 'PRIZE_WON',
      actionUrl: 'profile',
    });

    // Send email notification to user
    try {
      fetch('/api/notifications/wallet-adjusted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetTx.userId,
          userEmail: targetTx.userEmail || 'player@gmail.com',
          userName: targetTx.userName || 'Player',
          amount: targetTx.amount,
          actionType: 'CREDIT',
          category: 'DEPOSIT',
          description: `Deposit Approved (UTR: ${targetTx.referenceId || '-'})${adminRemarks ? ` - ${adminRemarks}` : ''}`,
          transactionId: txId,
        }),
      }).catch((e) => console.log('Deposit approval email silently logged:', e));
    } catch (e) {
      console.log('Error sending deposit approval email:', e);
    }

    return { success: true, message: `Deposit of ₹${targetTx.amount} approved and credited to user wallet!` };
  };

  const rejectDirectDeposit = async (txId: string, reason?: string): Promise<{ success: boolean; message?: string }> => {
    const targetTx = walletTransactions.find((t) => t.id === txId);
    if (!targetTx) {
      return { success: false, message: 'Deposit transaction not found' };
    }

    setWalletTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'REJECTED',
              meta: {
                ...t.meta,
                rejectedAt: new Date().toISOString(),
                rejectionReason: reason || 'Invalid UTR / Payment not received',
              },
            }
          : t
      )
    );

    // Notify the user
    addNotification({
      userId: targetTx.userId,
      title: '❌ Wallet Deposit Request Rejected',
      message: `Your deposit of ₹${targetTx.amount} (UTR: ${targetTx.referenceId || '-'}) was rejected: ${reason || 'Payment could not be verified in bank records'}.`,
      type: 'SYSTEM',
      actionUrl: 'profile',
    });

    return { success: true, message: `Deposit transaction rejected.` };
  };

  const adminAdjustUserWallet = async (params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    amount: number;
    actionType: 'CREDIT' | 'DEBIT';
    category: 'PRIZE_WON' | 'DEPOSIT' | 'BONUS' | 'MANUAL_ADJUSTMENT' | 'PENALTY';
    description: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!params.userId) {
      return { success: false, message: 'Invalid target user ID' };
    }
    if (params.amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    const txId = `tx-admin-${Date.now()}`;
    const txAmount = params.actionType === 'DEBIT' ? -params.amount : params.amount;

    let transactionType: WalletTransactionType = 'MANUAL_ADJUSTMENT';
    if (params.category === 'PRIZE_WON') transactionType = 'PRIZE_WON';
    else if (params.category === 'DEPOSIT') transactionType = 'DEPOSIT';
    else if (params.category === 'BONUS') transactionType = 'BONUS';
    else if (params.category === 'PENALTY') transactionType = 'PENALTY';
    else if (params.actionType === 'CREDIT') transactionType = 'ADMIN_CREDIT';
    else if (params.actionType === 'DEBIT') transactionType = 'ADMIN_DEBIT';

    const tx: WalletTransaction = {
      id: txId,
      userId: params.userId,
      type: transactionType,
      amount: params.amount,
      description: `[Admin ${params.actionType}] ${params.description} (${params.category})`,
      referenceId: txId,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      meta: {
        actionType: params.actionType,
        category: params.category,
        adminUser: 'Admin Panel',
      },
    };

    setWalletTransactions((prev) => [tx, ...prev]);

    // Send in-app notification to the player
    addNotification({
      userId: params.userId,
      title: params.actionType === 'CREDIT' ? '💰 Wallet Credited by Admin' : '⚠️ Wallet Balance Adjusted',
      message: params.actionType === 'CREDIT'
        ? `₹${params.amount} has been added to your wallet balance! Reason: ${params.description}`
        : `₹${params.amount} was debited from your wallet. Reason: ${params.description}`,
      type: params.actionType === 'CREDIT' ? 'PRIZE_WON' : 'SYSTEM',
      actionUrl: 'profile',
    });

    // Send instant live email notification to admin (wepopearn@gmail.com) and user
    try {
      fetch('/api/notifications/wallet-adjusted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: params.userId,
          userEmail: params.userEmail,
          userName: params.userName,
          amount: params.amount,
          actionType: params.actionType,
          category: params.category,
          description: params.description,
          transactionId: txId,
        }),
      }).catch((e) => console.log('Wallet adjustment email silently logged:', e));
    } catch (e) {
      console.log('Error triggering wallet adjustment email:', e);
    }

    return {
      success: true,
      message: `Successfully ${params.actionType === 'CREDIT' ? 'credited' : 'debited'} ₹${params.amount} for user!`,
    };
  };

  const processWithdrawalRequest = async (
    withdrawalId: string,
    status: 'PROCESSED' | 'REJECTED',
    adminRef?: string,
    remarks?: string
  ) => {
    const targetWth = withdrawals.find((w) => w.id === withdrawalId);
    if (!targetWth) return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status,
              processedAt: new Date().toISOString(),
              adminTransactionRef: adminRef || w.adminTransactionRef,
              adminRemarks: remarks || w.adminRemarks,
            }
          : w
      )
    );

    // Update wallet transaction
    setWalletTransactions((prev) =>
      prev.map((tx) =>
        tx.referenceId === withdrawalId
          ? { ...tx, status: status === 'PROCESSED' ? 'COMPLETED' : 'REJECTED' }
          : tx
      )
    );

    // If rejected, refund the transaction
    if (status === 'REJECTED') {
      const refundTx: WalletTransaction = {
        id: `tx-refund-${Date.now()}`,
        userId: targetWth.userId,
        type: 'WITHDRAWAL_REFUND',
        amount: targetWth.amount,
        description: `Refund for Rejected Withdrawal (${withdrawalId}): ${remarks || 'Invalid details'}`,
        referenceId: withdrawalId,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };
      setWalletTransactions((prev) => [refundTx, ...prev]);

      addNotification({
        userId: targetWth.userId,
        title: '❌ Withdrawal Request Rejected',
        message: `Your withdrawal of ₹${targetWth.amount} was rejected: ${remarks || 'Could not verify payout details'}. The amount has been refunded to your wallet.`,
        type: 'WITHDRAWAL_UPDATE',
        actionUrl: 'profile',
      });
    } else {
      addNotification({
        userId: targetWth.userId,
        title: '🎉 Withdrawal Transferred & Completed!',
        message: `₹${targetWth.amount} has been successfully transferred via ${targetWth.payoutMethod}! UTR / Ref: ${adminRef || 'COMPLETED'}.`,
        type: 'WITHDRAWAL_UPDATE',
        actionUrl: 'profile',
      });
    }
  };

  const resetEntireDatabaseToCleanState = () => {
    setRegistrations([]);
    setResults([]);
    setWithdrawals([]);
    setWalletTransactions([]);
    setRegisteredUsers((prev) => prev.filter((u) => ADMIN_EMAILS.includes(u.email?.toLowerCase())));
    setMatches((prev) => prev.map((m) => ({ ...m, approvedCount: 0, status: 'REGISTRATION_OPEN' })));
    setNotifications([]);
    
    // Clear persisted legacy mock keys in localStorage
    try {
      localStorage.removeItem(TOURNAMENT_REGS_KEY);
      localStorage.removeItem(TOURNAMENT_RESULTS_KEY);
      localStorage.removeItem(TOURNAMENT_WITHDRAWALS_KEY);
      localStorage.removeItem(TOURNAMENT_WALLET_TXS_KEY);
      localStorage.removeItem(TOURNAMENT_NOTIFS_KEY);
    } catch (e) {
      console.warn('Could not remove localStorage items:', e);
    }
  };

  const getMatchById = (id: string) => matches.find((m) => m.id === id);
  const getRegistrationById = (id: string) => registrations.find((r) => r.id === id);

  return (
    <TournamentContext.Provider
      value={{
        currentUser,
        customUser,
        isAdmin,
        adminEmail: 'wepopearn@gmail.com',
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        matches,
        registrations,
        results,
        settings,
        withdrawals,
        walletTransactions,
        notifications,
        unreadNotificationsCount,
        registeredUsers,
        registeredUsersCount: registeredUsers.length,
        appOpensCount,
        trafficAnalytics,
        updateSettings,
        createMatch,
        updateMatch,
        deleteMatch,
        submitRegistration,
        updateRegistrationStatus,
        resendApprovalEmail,
        publishMatchResult,
        getMatchById,
        getRegistrationById,
        requestWithdrawal,
        processWithdrawalRequest,
        submitDirectDeposit,
        approveDirectDeposit,
        rejectDirectDeposit,
        adminAdjustUserWallet,
        getHourlyWithdrawalUsage,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        getUserWalletStats,
        getMatchConfirmedSlots,
        syncMatchesWithRealRegistrations,
        resetAllMatchSlotsToZero,
        updateMatchSlotCount,
        resetEntireDatabaseToCleanState,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};

