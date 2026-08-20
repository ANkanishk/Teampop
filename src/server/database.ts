import fs from 'fs';
import path from 'path';
import { AuthPlayerProfile, Registration, Match, WithdrawalRequest, WalletTransaction, AdminSettings, MatchResult, ReferralRecord } from '../types';
import { INITIAL_MATCHES } from '../data/tournamentData';
import { INITIAL_UPI_APPS } from '../data/upiAppsData';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DATA_DIR, 'persistent_db.json');

export interface DatabaseSchema {
  users: AuthPlayerProfile[];
  registrations: Registration[];
  matches: Match[];
  withdrawals: WithdrawalRequest[];
  walletTransactions: WalletTransaction[];
  settings: AdminSettings;
  results: MatchResult[];
  referrals: ReferralRecord[];
}

const DEFAULT_SETTINGS: AdminSettings = {
  upiId: 'wepopearn@axl',
  upiName: 'POP Gaming Esports Tournaments',
  supportWhatsApp: '9199620000',
  supportEmail: 'wepopearn@gmail.com',
  telegramUrl: 'https://t.me/popgamingesports',
  telegramChannelName: '@popgamingesports',
  qrCodeImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dwepopearn%40axl%26pn%3DPOP%2520Gaming%2520Esports%26cu%3DINR',
  maintenanceMode: false,
  announcementTicker: '🔥 POP Gaming Season 9 is LIVE! Play Solo, Duo, Squad & 1v1 Clash Squad to win verified real cash with instant UPI withdrawal!',
  platformCharge: 0,
  upiApps: INITIAL_UPI_APPS,
  bgmConfig: {
    enabled: true,
    autoplay: true,
    volume: 0.15, // 15% soft background music volume ("ekdam dheemi awaz")
    trackTitle: 'Free Fire Esports Lobby Anthem (Default)',
    trackUrl: '/audio/free-fire-lobby-theme.mp3',
    loop: true,
    presetId: 'default_ff_anthem',
    fileName: 'free_fire_lobby_anthem.mp3',
  },
  autoEmailNotifications: true,
  emailSenderName: 'POP Gaming Esports',
  emailCustomFooterNote: 'Free Fire MAX Verified Matchroom. Instant UPI Payouts.',
  slotDisplayMode: 'AUTO_REAL',
  tutorialVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  loginTutorialVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  referralRewardAmount: 25,
  signupBonusAmount: 20,
  minDepositAmount: 20,
  minWithdrawalAmount: 50,
  bonusUnlockWinningTarget: 200,
};

const DEFAULT_ADMIN_USER: AuthPlayerProfile = {
  uid: 'admin-wepopearn',
  email: 'wepopearn@gmail.com',
  displayName: 'POP Esports Master Admin',
  password: 'admin',
  phone: '9199620000',
  inGameName: 'POP_MASTER_ADMIN',
  gameUid: '1000000001',
  role: 'ADMIN',
  walletBalance: 99999,
  depositBalance: 50000,
  winningsBalance: 49999,
  bonusBalance: 0,
  referralCode: 'POPADMIN',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [DEFAULT_ADMIN_USER],
          registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
          matches: Array.isArray(parsed.matches) && parsed.matches.length > 0 ? parsed.matches : (INITIAL_MATCHES as any),
          withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
          walletTransactions: Array.isArray(parsed.walletTransactions) ? parsed.walletTransactions : [],
          settings: { 
            ...DEFAULT_SETTINGS, 
            ...(parsed.settings || {}),
            bgmConfig: {
              ...(DEFAULT_SETTINGS.bgmConfig || {}),
              ...((parsed.settings && parsed.settings.bgmConfig) || {})
            }
          },
          results: Array.isArray(parsed.results) ? parsed.results : [],
          referrals: Array.isArray(parsed.referrals) ? parsed.referrals : [],
        };
      }
    } catch (err) {
      console.error('[DatabaseManager] Error reading DB file, using defaults:', err);
    }

    const initialData: DatabaseSchema = {
      users: [DEFAULT_ADMIN_USER],
      registrations: [],
      matches: INITIAL_MATCHES as any,
      withdrawals: [],
      walletTransactions: [],
      settings: DEFAULT_SETTINGS,
      results: [],
      referrals: [],
    };
    this.saveToDisk(initialData);
    return initialData;
  }

  private saveToDisk(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseManager] Error saving to disk:', err);
    }
  }

  // --- GET FULL STATE ---
  public getFullState() {
    return {
      usersCount: this.data.users.length,
      users: this.data.users.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        name: u.name,
        phone: u.phone,
        password: u.password,
        inGameName: u.inGameName,
        gameUid: u.gameUid,
        role: u.role,
        walletBalance: u.walletBalance ?? 0,
        depositBalance: u.depositBalance ?? 0,
        winningsBalance: u.winningsBalance ?? 0,
        bonusBalance: u.bonusBalance ?? 0,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        referralEarnings: u.referralEarnings ?? 0,
        referralsCount: u.referralsCount ?? 0,
        hasDeposited: u.hasDeposited ?? false,
        hasPlayedMatch: u.hasPlayedMatch ?? false,
        status: u.status || 'ACTIVE',
        createdAt: u.createdAt,
      })),
      registrations: this.data.registrations,
      matches: this.data.matches,
      withdrawals: this.data.withdrawals,
      walletTransactions: this.data.walletTransactions,
      settings: this.data.settings,
      results: this.data.results,
      referrals: this.data.referrals || [],
    };
  }

  // --- USERS MANAGEMENT ---
  public getUsers() {
    return this.data.users;
  }

  public findUserById(uid: string) {
    if (!uid) return null;
    const clean = uid.trim().toLowerCase();
    return this.data.users.find(u => u.uid?.toLowerCase() === clean);
  }

  public findUserByEmailOrPhone(identifier: string) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');
    const cleanLast10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    return this.data.users.find(u => {
      // 1. Email check
      if (u.email && u.email.trim().toLowerCase() === clean) return true;
      // 2. Phone check (exact string or last 10 digits match)
      if (u.phone) {
        const uClean = u.phone.trim().toLowerCase();
        if (uClean === clean) return true;
        const uDigits = uClean.replace(/\D/g, '');
        if (cleanLast10 && uDigits.length >= 10 && uDigits.slice(-10) === cleanLast10) {
          return true;
        }
      }
      // 3. User ID or Game UID check
      if (u.uid && u.uid.toLowerCase() === clean) return true;
      if (u.gameUid && u.gameUid.trim() === clean) return true;
      return false;
    });
  }

  public findUserByReferralCode(code: string) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const cleanDigits = clean.replace(/\D/g, '');
    const cleanLast10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    return this.data.users.find(u => {
      if (u.referralCode && u.referralCode.trim().toUpperCase() === clean) return true;
      if (u.uid && u.uid.trim().toUpperCase() === clean) return true;
      if (u.phone) {
        const uDigits = u.phone.replace(/\D/g, '');
        if (cleanDigits && uDigits === cleanDigits) return true;
        if (cleanLast10 && uDigits.length >= 10 && uDigits.slice(-10) === cleanLast10) return true;
        if (`POP${uDigits.slice(-4)}`.toUpperCase() === clean) return true;
      }
      if (u.email && u.email.trim().toUpperCase() === clean) return true;
      return false;
    });
  }

  public registerUser(profile: AuthPlayerProfile) {
    const cleanEmail = (profile.email || '').trim().toLowerCase();
    const rawPhone = (profile.phone || '').trim();
    const phoneDigits = rawPhone.replace(/\D/g, '');
    const cleanPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
    const cleanPassword = (profile.password || '').trim();

    // Check uniqueness (email or 10-digit phone)
    const exists = this.data.users.find(u => {
      if (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) return true;
      if (cleanPhone.length >= 10 && u.phone) {
        const uPhoneDigits = u.phone.replace(/\D/g, '');
        if (uPhoneDigits.length >= 10 && uPhoneDigits.slice(-10) === cleanPhone) return true;
      }
      return false;
    });

    if (exists) {
      throw new Error('An account with this email or mobile number already exists.');
    }

    const signupBonus = this.data.settings.signupBonusAmount ?? 20;
    const generatedReferralCode = `POP${cleanPhone ? cleanPhone.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: AuthPlayerProfile = {
      ...profile,
      email: cleanEmail || `${cleanPhone}@popgaming.in`,
      phone: cleanPhone,
      password: cleanPassword,
      walletBalance: signupBonus,
      depositBalance: 0,
      winningsBalance: 0,
      bonusBalance: signupBonus,
      totalDepositAmount: 0,
      totalWonAmount: 0,
      referralCode: profile.referralCode || generatedReferralCode,
      referredBy: profile.referredBy?.trim().toUpperCase(),
      referralEarnings: 0,
      referralsCount: 0,
      hasDeposited: false,
      hasPlayedMatch: false,
      status: 'ACTIVE',
      createdAt: profile.createdAt || new Date().toISOString(),
    };

    this.data.users.unshift(newUser);

    // Record signup bonus transaction
    if (signupBonus > 0) {
      const bonusTx: WalletTransaction = {
        id: `tx-bonus-${Date.now()}`,
        userId: newUser.uid,
        userEmail: newUser.email,
        userName: newUser.displayName,
        type: 'SIGNUP_BONUS',
        amount: signupBonus,
        description: '🎁 ₹20 Welcome Signup Bonus for 1st Match!',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };
      this.data.walletTransactions.unshift(bonusTx);
    }

    // Handle Referral Attribution
    if (newUser.referredBy) {
      const referrer = this.findUserByReferralCode(newUser.referredBy) || this.findUserById(newUser.referredBy);
      if (referrer && referrer.uid !== newUser.uid) {
        referrer.referralsCount = (referrer.referralsCount || 0) + 1;
        const refRecord: ReferralRecord = {
          id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          referrerUid: referrer.uid,
          referrerName: referrer.displayName || referrer.name || 'Referrer',
          referrerPhone: referrer.phone,
          referredUserUid: newUser.uid,
          referredUserName: newUser.displayName || newUser.name || 'New Player',
          referredUserPhone: newUser.phone,
          status: 'REGISTERED',
          rewardAmount: this.data.settings.referralRewardAmount ?? 25,
          createdAt: new Date().toISOString(),
        };
        if (!this.data.referrals) this.data.referrals = [];
        this.data.referrals.unshift(refRecord);
      }
    }

    this.saveToDisk();
    return newUser;
  }

  public manualRewardReferral(referralId: string) {
    if (!this.data.referrals) return { success: false, error: 'No referrals found' };
    const ref = this.data.referrals.find(r => r.id === referralId);
    if (!ref) return { success: false, error: 'Referral record not found' };

    ref.status = 'REWARDED';
    ref.qualifiedAt = new Date().toISOString();
    ref.qualificationReason = 'MATCH_PLAYED';

    const referrer = this.findUserById(ref.referrerUid);
    if (referrer) {
      const reward = ref.rewardAmount || this.data.settings.referralRewardAmount || 25;
      referrer.winningsBalance = (referrer.winningsBalance || 0) + reward;
      referrer.walletBalance = (referrer.walletBalance || 0) + reward;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + reward;

      const rewardTx: WalletTransaction = {
        id: `tx-ref-manual-${Date.now()}`,
        userId: referrer.uid,
        userEmail: referrer.email,
        userName: referrer.displayName,
        type: 'REFERRAL_BONUS',
        amount: reward,
        description: `🎉 Admin Approved Referral Reward for inviting ${ref.referredUserName}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };
      this.data.walletTransactions.unshift(rewardTx);
    }
    this.saveToDisk();
    return { success: true, message: `Referral reward of ₹${ref.rewardAmount || 25} successfully credited to ${ref.referrerName}!` };
  }

  public qualifyReferral(referredUserUid: string, reason: 'DEPOSIT' | 'MATCH_PLAYED') {
    if (!this.data.referrals) return;
    const ref = this.data.referrals.find(r => r.referredUserUid === referredUserUid && r.status === 'REGISTERED');
    if (!ref) return;

    ref.status = 'QUALIFIED';
    ref.qualifiedAt = new Date().toISOString();
    ref.qualificationReason = reason;

    // Credit referrer wallet with bonus
    const referrer = this.findUserById(ref.referrerUid);
    if (referrer) {
      const reward = ref.rewardAmount || this.data.settings.referralRewardAmount || 25;
      referrer.winningsBalance = (referrer.winningsBalance || 0) + reward;
      referrer.walletBalance = (referrer.walletBalance || 0) + reward;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + reward;

      const rewardTx: WalletTransaction = {
        id: `tx-ref-${Date.now()}`,
        userId: referrer.uid,
        userEmail: referrer.email,
        userName: referrer.displayName,
        type: 'REFERRAL_BONUS',
        amount: reward,
        description: `🎉 Referral Reward for inviting ${ref.referredUserName} (${reason === 'DEPOSIT' ? '1st Deposit' : '1st Match Played'})`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };
      this.data.walletTransactions.unshift(rewardTx);
      ref.status = 'REWARDED';
    }
    this.saveToDisk();
  }

  public updateUser(uid: string, updates: Partial<AuthPlayerProfile>) {
    const idx = this.data.users.findIndex(u => u.uid === uid);
    if (idx === -1) return null;
    const existingUser = this.data.users[idx];
    const cleanUpdates: any = {};
    for (const key of Object.keys(updates) as (keyof AuthPlayerProfile)[]) {
      if (updates[key] !== undefined && updates[key] !== null) {
        cleanUpdates[key] = updates[key];
      }
    }
    // Retain existing password if not explicitly updating to a valid new string
    if ((!cleanUpdates.password || typeof cleanUpdates.password !== 'string' || cleanUpdates.password.trim() === '') && existingUser.password) {
      cleanUpdates.password = existingUser.password;
    }
    this.data.users[idx] = { ...existingUser, ...cleanUpdates };
    this.saveToDisk();
    return this.data.users[idx];
  }

  public deleteUser(uid: string) {
    const idx = this.data.users.findIndex(u => u.uid === uid);
    if (idx === -1) return false;
    // Protect master admin from being deleted
    if (this.data.users[idx].email.toLowerCase() === 'wepopearn@gmail.com') {
      throw new Error('Master Admin account cannot be deleted.');
    }
    this.data.users.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  public adjustUserWallet(uid: string, amountDelta: number, reason: string) {
    const user = this.findUserById(uid);
    if (!user) return null;
    const current = user.walletBalance ?? 0;
    const updated = Math.max(0, current + amountDelta);
    user.walletBalance = updated;
    if (amountDelta > 0) {
      user.winningsBalance = (user.winningsBalance ?? 0) + amountDelta;
      user.totalWonAmount = (user.totalWonAmount ?? 0) + amountDelta;
    } else {
      user.winningsBalance = Math.max(0, (user.winningsBalance ?? 0) + amountDelta);
    }

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: uid,
      userEmail: user.email,
      userName: user.displayName,
      type: amountDelta >= 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
      amount: Math.abs(amountDelta),
      description: reason || (amountDelta >= 0 ? 'Admin Credit' : 'Admin Debit'),
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    };
    this.data.walletTransactions.unshift(tx);
    this.saveToDisk();
    return { user, tx };
  }

  // --- WALLET MATCH PAYMENT ---
  public joinMatchWithWallet(userId: string, matchId: string, regData: Partial<Registration>) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    const match = this.data.matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');

    const entryFee = Number(match.entryFee);
    const totalBalance = (user.walletBalance || 0);

    if (totalBalance < entryFee) {
      throw new Error(`Insufficient wallet balance (Available: ₹${totalBalance}, Required: ₹${entryFee}). Please deposit or use UPI.`);
    }

    // Deduct balances prioritizing bonus then deposit then winnings
    let remainingToDeduct = entryFee;
    let bonusDeducted = 0;
    let depositDeducted = 0;
    let winningsDeducted = 0;

    if (user.bonusBalance && user.bonusBalance > 0) {
      bonusDeducted = Math.min(user.bonusBalance, remainingToDeduct);
      user.bonusBalance -= bonusDeducted;
      remainingToDeduct -= bonusDeducted;
    }

    if (remainingToDeduct > 0 && user.depositBalance && user.depositBalance > 0) {
      depositDeducted = Math.min(user.depositBalance, remainingToDeduct);
      user.depositBalance -= depositDeducted;
      remainingToDeduct -= depositDeducted;
    }

    if (remainingToDeduct > 0 && user.winningsBalance && user.winningsBalance > 0) {
      winningsDeducted = Math.min(user.winningsBalance, remainingToDeduct);
      user.winningsBalance -= winningsDeducted;
      remainingToDeduct -= winningsDeducted;
    }

    user.walletBalance = Math.max(0, (user.bonusBalance || 0) + (user.depositBalance || 0) + (user.winningsBalance || 0));
    user.hasPlayedMatch = true;

    // Create Approved Registration
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const regId = `POP-${dateStr}-${randSuffix}`;

    const newReg: Registration = {
      id: regId,
      matchId: match.id,
      matchTitle: match.title,
      gameMode: match.gameMode,
      entryFee,
      platformCharge: 0,
      totalPayable: entryFee,
      teamName: regData.teamName,
      captainName: regData.captainName || user.displayName,
      captainPhone: regData.captainPhone || user.phone || '',
      captainEmail: regData.captainEmail || user.email,
      players: regData.players || [{
        playerName: user.displayName,
        inGameName: user.inGameName || user.displayName,
        gameUid: user.gameUid || '00000000',
        phone: user.phone || '',
      }],
      paymentMethod: 'WALLET',
      utrNumber: `WALLET-${regId}`,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userId: user.uid,
    };

    this.data.registrations.unshift(newReg);

    // Record wallet deduction transaction
    const debitTx: WalletTransaction = {
      id: `tx-entry-${Date.now()}`,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      type: 'MATCH_ENTRY_FEE',
      amount: entryFee,
      description: `⚡ Match Entry Fee for "${match.title}" (Paid via POP Wallet)`,
      referenceId: newReg.id,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    };
    this.data.walletTransactions.unshift(debitTx);

    // Update match count
    match.approvedCount = (match.approvedCount || 0) + (newReg.players?.length || 1);
    if (match.approvedCount >= match.maxPlayers) {
      match.status = 'FULL';
    }

    // Qualify referral if 1st match
    this.qualifyReferral(user.uid, 'MATCH_PLAYED');

    this.saveToDisk();
    return { registration: newReg, user, transaction: debitTx };
  }

  // --- REFERRALS API ---
  public getReferrals() {
    return this.data.referrals || [];
  }

  // --- REGISTRATIONS MANAGEMENT ---
  public getRegistrations() {
    return this.data.registrations;
  }

  public addRegistration(reg: Registration) {
    this.data.registrations.unshift(reg);
    this.saveToDisk();
    return reg;
  }

  public updateRegistrationStatus(id: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) {
    const reg = this.data.registrations.find(r => r.id === id);
    if (!reg) return null;
    reg.status = status;
    reg.adminNotes = adminNotes || reg.adminNotes;
    if (status === 'APPROVED') {
      reg.approvedAt = new Date().toISOString();
      // Increment approved count on match
      const match = this.data.matches.find(m => m.id === reg.matchId);
      if (match) {
        match.approvedCount = (match.approvedCount || 0) + (reg.players?.length || 1);
        if (match.approvedCount >= match.maxPlayers) {
          match.status = 'FULL';
        }
      }
      // If user registered, mark played match and qualify referral
      if (reg.userId) {
        const u = this.findUserById(reg.userId);
        if (u) {
          u.hasPlayedMatch = true;
          this.qualifyReferral(u.uid, 'MATCH_PLAYED');
        }
      }
    }
    this.saveToDisk();
    return reg;
  }

  public deleteRegistration(id: string) {
    const idx = this.data.registrations.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.registrations.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // --- MATCHES MANAGEMENT ---
  public getMatches() {
    return this.data.matches;
  }

  public addMatch(match: Match) {
    this.data.matches.unshift(match);
    this.saveToDisk();
    return match;
  }

  public updateMatch(id: string, updates: Partial<Match>) {
    const idx = this.data.matches.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.matches[idx] = { ...this.data.matches[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToDisk();
    return this.data.matches[idx];
  }

  public deleteMatch(id: string) {
    const idx = this.data.matches.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.matches.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // --- WITHDRAWALS ---
  public getWithdrawals() {
    return this.data.withdrawals;
  }

  public addWithdrawal(w: WithdrawalRequest) {
    this.data.withdrawals.unshift(w);
    this.saveToDisk();
    return w;
  }

  public updateWithdrawalStatus(id: string, status: 'APPROVED' | 'PROCESSED' | 'REJECTED', adminRef?: string, remarks?: string) {
    const w = this.data.withdrawals.find(x => x.id === id);
    if (!w) return null;
    w.status = status;
    w.adminTransactionRef = adminRef || w.adminTransactionRef;
    w.adminRemarks = remarks || w.adminRemarks;
    if (status === 'PROCESSED') {
      w.processedAt = new Date().toISOString();
    }
    this.saveToDisk();
    return w;
  }

  // --- WALLET TRANSACTIONS & RESULTS ---
  public getWalletTransactions() {
    return this.data.walletTransactions || [];
  }

  public addWalletTransaction(tx: WalletTransaction) {
    if (!this.data.walletTransactions) {
      this.data.walletTransactions = [];
    }
    this.data.walletTransactions.unshift(tx);
    this.saveToDisk();
    return tx;
  }

  public updateWalletTransaction(id: string, updates: Partial<WalletTransaction>) {
    if (!this.data.walletTransactions) return null;
    const idx = this.data.walletTransactions.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.walletTransactions[idx] = { ...this.data.walletTransactions[idx], ...updates };
    this.saveToDisk();
    return this.data.walletTransactions[idx];
  }

  public getResults() {
    return this.data.results || [];
  }

  public addResult(result: MatchResult) {
    if (!this.data.results) {
      this.data.results = [];
    }
    this.data.results.unshift(result);
    this.saveToDisk();
    return result;
  }

  // --- SETTINGS ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AdminSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveToDisk();
    return this.data.settings;
  }
}

export const dbStore = new DatabaseManager();
