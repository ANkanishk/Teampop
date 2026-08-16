export type GameModeId =
  | 'solo-br'
  | 'duo-br'
  | 'squad-br'
  | 'cs-1v1'
  | 'cs-2v2'
  | 'cs-4v4'
  | 'cs-custom'
  | 'lone-wolf-1v1'
  | 'lone-wolf-2v2'
  | 'headshot-mode'
  | 'monthly-championship'
  | 'mega-championship';

export type MatchStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'FILLING_SLOWLY'
  | 'ALMOST_FULL'
  | 'FULL'
  | 'STARTING_SOON'
  | 'LIVE'
  | 'RESULTS_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface RewardConfig {
  firstPlaceMultiplier: number; // e.g. 2.0 (100% entry + 100% bonus)
  secondPlaceMultiplier: number; // e.g. 1.3 (100% entry + 30% bonus)
  thirdPlaceMultiplier: number; // e.g. 1.2 (100% entry + 20% bonus)
  perKillReward: number; // in Rupees, e.g. 7, 14, 17, 34, 67, 100
  fixedWinnerPrize?: number; // For CS / Lone Wolf / Championship
  fixedRunnerUpPrize?: number;
  fixedThirdPrize?: number;
}

export interface Match {
  id: string;
  matchCode: string; // e.g. "POP-BR-20-A"
  title: string;
  gameMode: GameModeId;
  gameModeName: string;
  entryFee: number; // in Rupees
  maxPlayers: number; // e.g. 48 for BR, 2 for 1v1, 4 for 2v2, 8 for 4v4
  minPlayers: number;
  approvedCount: number;
  status: MatchStatus;
  scheduledStart: string; // ISO string or human readable
  mapName: string; // "Bermuda", "Purgatory", "Kalahari", "Iron Cage"
  serverRegion: string; // "India (Free Fire MAX)"
  rulesSnapshot: {
    format: string;
    revivesAllowed: boolean;
    gunAttributes: boolean;
    characterSkill: boolean;
    limitedAmmo: boolean;
    unlimitedGloo?: boolean;
    onlyHeadshot?: boolean;
    customNotes?: string;
  };
  rewardConfig: RewardConfig;
  // Private room credentials - shown ONLY to approved players after release time
  credentialsReleased: boolean;
  roomId?: string;
  roomPassword?: string;
  roomSlotNumber?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  bannerImage?: string;
}

export interface PlayerParticipant {
  playerName: string;
  inGameName: string;
  gameUid: string;
  phone: string;
  email?: string;
  kills?: number;
  individualReward?: number;
}

export interface Registration {
  id: string; // e.g. "POP-20260816-982314"
  matchId: string;
  matchTitle: string;
  gameMode: GameModeId;
  entryFee: number;
  platformCharge: number;
  totalPayable: number;
  teamName?: string;
  captainName: string;
  captainPhone: string;
  captainEmail?: string;
  players: PlayerParticipant[];
  paymentMethod: 'UPI_QR' | 'UPI_ID';
  utrNumber: string;
  paymentScreenshotUrl?: string; // base64 or URL
  status: RegistrationStatus;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  userId?: string; // If logged in
  emailNotificationSent?: boolean;
  emailNotificationSentAt?: string;
  emailNotificationMessageId?: string;
  emailNotificationPreviewUrl?: string;
  emailNotificationError?: string;
}

export interface NotificationLog {
  id: string;
  recipientEmail: string;
  registrationId: string;
  participantName: string;
  matchTitle: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  sentAt: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';

export interface WithdrawalRequest {
  id: string; // e.g. "WTH-20260816-9821"
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  amount: number; // in Rupees
  payoutMethod: 'UPI' | 'BANK_TRANSFER';
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName?: string;
  };
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  adminTransactionRef?: string; // UTR or Bank Reference
  adminRemarks?: string;
}

export type WalletTransactionType = 
  | 'DEPOSIT' 
  | 'PRIZE_WON' 
  | 'WITHDRAWAL_REQUEST' 
  | 'WITHDRAWAL_REFUND' 
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'BONUS'
  | 'MANUAL_ADJUSTMENT'
  | 'PENALTY';

export interface WalletTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  referenceId?: string; // Match ID, Registration ID, or Withdrawal ID
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  timestamp: string;
  meta?: Record<string, any>;
}

export type AppNotificationType = 
  | 'SLOT_APPROVED' 
  | 'SLOT_REJECTED' 
  | 'PRIZE_WON' 
  | 'WITHDRAWAL_UPDATE' 
  | 'MATCH_REMINDER' 
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: AppNotificationType;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface MatchResultRank {
  rank: number;
  rankLabel: string;
  teamOrPlayerName: string;
  uids: string[];
  kills: number;
  placementPrize: number;
  killPrize: number;
  totalPrize: number;
  userId?: string;
}

export interface MatchResult {
  id: string;
  matchId: string;
  matchTitle: string;
  gameMode: GameModeId;
  completedAt: string;
  firstPlace: {
    teamOrPlayerName: string;
    uids: string[];
    kills: number;
    placementPrize: number;
    killPrize: number;
    totalPrize: number;
  };
  secondPlace?: {
    teamOrPlayerName: string;
    uids: string[];
    kills: number;
    placementPrize: number;
    killPrize: number;
    totalPrize: number;
  };
  thirdPlace?: {
    teamOrPlayerName: string;
    uids: string[];
    kills: number;
    placementPrize: number;
    killPrize: number;
    totalPrize: number;
  };
  customRankings?: MatchResultRank[];
  totalKills: number;
  totalPayout: number;
  publishedBy: string;
}

export interface AuthPlayerProfile {
  uid: string;
  email: string;
  displayName: string;
  name?: string;
  phone?: string;
  inGameName?: string;
  gameUid?: string;
  photoURL?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface GameModeInfo {
  id: GameModeId;
  title: string;
  tagline: string;
  category: 'Battle Royale' | 'Clash Squad' | 'Special & Duel' | 'Flagship Championship';
  teamSize: number; // 1, 2, 4
  playersTotal: number;
  defaultEntryFee: number;
  badge: string;
  bgGradient: string;
  image: string;
  description: string;
  rulesSummary: string[];
  features: string[];
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaAction: string; // route / modal target
  badge: string;
  image: string;
  accentColor: string;
  highlightText?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  themeColor: string; // Tailwind border / glow color
  entryFee: number;
  prizePool: string;
  gameMode: GameModeId;
  imageUrl: string;
  aiPromptSummary: string;
  scheduleText: string;
  features: string[];
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'URGENT' | 'EVENT' | 'MAINTENANCE';
  active: boolean;
  createdAt: string;
  actionText?: string;
  actionUrl?: string;
}

export interface UpiAppConfig {
  id: string; // 'pop' | 'phonepe' | 'paytm' | 'gpay' | 'any'
  name: string; // 'POP UPI', 'PhonePe', 'Paytm', 'Google Pay', 'Any UPI App'
  shortName: string;
  tagline: string;
  logoUrl?: string; // Custom image or data URL uploaded by admin
  customUpiId?: string; // If left blank, falls back to settings.upiId
  packageScheme?: string; // e.g. 'phonepe://', 'paytmmp://', 'upi://'
  enabled: boolean;
  colorTheme: string;
  badgeText?: string;
  order: number;
}

export interface AdminSettings {
  appLogo?: string;
  upiId: string;
  upiName: string;
  supportWhatsApp: string;
  supportEmail: string;
  telegramUrl?: string;
  telegramChannelName?: string;
  qrCodeImageUrl: string;
  maintenanceMode: boolean;
  announcementTicker: string;
  announcements?: GlobalAnnouncement[];
  platformCharge: number;
  heroSlides?: SlideItem[];
  promoBanners?: PromoBanner[];
  upiApps?: UpiAppConfig[];
  autoEmailNotifications?: boolean;
  emailSenderName?: string;
  emailCustomFooterNote?: string;
  slotDisplayMode?: 'AUTO_REAL' | 'MANUAL';
  smtpConfig?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    secure?: boolean;
    fromEmail?: string;
  };
}
