import { GameModeInfo, GameModeId, RewardConfig, SlideItem, AdminSettings } from '../types';
import { INITIAL_UPI_APPS } from './upiAppsData';

export const PER_KILL_DEFAULTS: Record<number, number> = {
  20: 7,
  40: 14,
  50: 17,
  100: 34,
  200: 67,
  300: 100,
  400: 100,
  500: 100,
  600: 100,
  1000: 100,
  1500: 100,
};

export const isDuelOrLoneWolfMode = (mode: GameModeId): boolean => {
  return ['lone-wolf-1v1', 'lone-wolf-2v2', 'cs-1v1', 'cs-2v2', 'headshot-mode'].includes(mode);
};

export const calculateDuelPlacementRewards = (entryFee: number) => {
  // 150% Return: 100% Entry Return + 50% Cash Bonus
  return {
    first: Math.round(entryFee * 1.5),
    second: 0,
    third: 0,
    multiplier: 1.5,
  };
};

export const getPerKillReward = (entryFee: number, mode?: GameModeId): number => {
  if (mode && isDuelOrLoneWolfMode(mode)) {
    return 0; // No per-kill in 1v1 duel / Lone Wolf modes
  }
  return PER_KILL_DEFAULTS[entryFee] || Math.min(100, Math.round(entryFee * 0.34));
};

export const calculateBRPlacementRewards = (entryFee: number) => {
  return {
    first: Math.round(entryFee * 2.0),
    second: Math.round(entryFee * 1.3),
    third: Math.round(entryFee * 1.2),
  };
};

export const getModeRewardConfig = (mode: GameModeId, entryFee: number): RewardConfig => {
  if (isDuelOrLoneWolfMode(mode)) {
    const duel = calculateDuelPlacementRewards(entryFee);
    return {
      firstPlaceMultiplier: 1.5,
      secondPlaceMultiplier: 0,
      thirdPlaceMultiplier: 0,
      perKillReward: 0,
      fixedWinnerPrize: duel.first,
      fixedRunnerUpPrize: 0,
    };
  }

  return {
    firstPlaceMultiplier: 2.0,
    secondPlaceMultiplier: 1.3,
    thirdPlaceMultiplier: 1.2,
    perKillReward: getPerKillReward(entryFee, mode),
  };
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  upiId: 'wepopearn@oksbi',
  upiName: 'POP Gaming Esports Tournaments',
  supportWhatsApp: '+919876543210',
  supportEmail: 'wepopearn@gmail.com',
  telegramUrl: 'https://t.me/popearnesports',
  telegramChannelName: 'POP Gaming Official Esports',
  qrCodeImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
  maintenanceMode: false,
  announcementTicker: '🔥 POP GAMING SEASON 9 LIVE: Daily BR Solo & Squad Rooms every 30 mins! Instant UPI Reward settlement within 15 minutes of match completion. Register now!',
  platformCharge: 0,
  upiApps: INITIAL_UPI_APPS,
};

export const GAME_MODES: GameModeInfo[] = [
  {
    id: 'solo-br',
    title: 'Solo Battle Royale',
    tagline: '1 Player • 48 Survivors • 1 Champion',
    category: 'Battle Royale',
    teamSize: 1,
    playersTotal: 48,
    defaultEntryFee: 50,
    badge: 'Most Popular',
    bgGradient: 'from-amber-600/20 via-orange-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    description: 'Classic Solo Bermuda survival warfare. No revives, pure tactical gunplay. 1st place wins 200% entry fee + cash for every confirmed kill.',
    rulesSummary: [
      'Single player per slot. No teaming allowed (instant ban).',
      'No revives, no respawn tokens, standard Free Fire MAX rules.',
      'Gun attributes ON, Character skills ON, Limited ammo ON.',
      'Room ID & Password released 15 minutes before start in your tracking portal.'
    ],
    features: ['100% Entry Return + 100% Bonus for 1st', 'Per-Kill Cash Bounty', 'Instant Result Audit']
  },
  {
    id: 'duo-br',
    title: 'Duo Battle Royale',
    tagline: '2 Players • 24 Teams • Shared Placement',
    category: 'Battle Royale',
    teamSize: 2,
    playersTotal: 48,
    defaultEntryFee: 100,
    badge: 'High Action',
    bgGradient: 'from-blue-600/20 via-cyan-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    description: 'Pair up with your trusted wingman. Team placement rewards split equally, while individual kills credit directly to the slayer.',
    rulesSummary: [
      'Must register exactly 2 player UIDs.',
      'Team placement reward split 50/50 between teammates.',
      'Individual kill bounty goes to the credited killer.',
      'No emulator players unless specifically designated in room rules.'
    ],
    features: ['50/50 Team Split', 'Individual Kill Rewards', 'Team Coordination Focus']
  },
  {
    id: 'squad-br',
    title: 'Squad Battle Royale (4v4)',
    tagline: '4 Players • 12 Squads • Total Bermuda Dominance',
    category: 'Battle Royale',
    teamSize: 4,
    playersTotal: 48,
    defaultEntryFee: 200,
    badge: 'Esports Standard',
    bgGradient: 'from-purple-600/20 via-indigo-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    description: 'The standard esports format. 4-man coordinated firepower. Top 3 squads earn high multiplier placement returns plus squad-wide kill rewards.',
    rulesSummary: [
      'Exactly 4 player UIDs required at registration.',
      'Captain coordinates room entry and slot positioning.',
      'Top 3 placements receive 2.0x, 1.3x, and 1.2x team bonuses.',
      'Re-join prohibited if eliminated. Official referee spectating.'
    ],
    features: ['4-Player Roster Validation', 'Full Spectator Refereeing', 'Championship Qualifier Points']
  },
  {
    id: 'cs-1v1',
    title: 'Clash Squad 1v1 Duel',
    tagline: 'Pure 1 on 1 • 7 Rounds • Winner Takes 150%',
    category: 'Clash Squad',
    teamSize: 1,
    playersTotal: 2,
    defaultEntryFee: 100,
    badge: '150% Return',
    bgGradient: 'from-red-600/20 via-rose-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
    description: 'Direct 1v1 Clash Squad face-off. 1st place champion wins 150% total return (100% entry fee returned + 50% cash bonus profit). Zero per-kill bounty.',
    rulesSummary: [
      'First to win 7 rounds is declared match champion.',
      'Winner takes 150% return (Entry ₹100 → Win ₹150; Entry ₹200 → Win ₹300).',
      'No per-kill bounty in duel mode. Pure winner-takes-all.',
      'Limited ammo: ON, Screen recording recommended in case of dispute.'
    ],
    features: ['150% Guaranteed Winner Return', 'Best of 13 Rounds', 'Instant Credential Access']
  },
  {
    id: 'cs-2v2',
    title: 'Clash Squad 2v2',
    tagline: '2 vs 2 Tactical Combat • 150% Winner Team Payout',
    category: 'Clash Squad',
    teamSize: 2,
    playersTotal: 4,
    defaultEntryFee: 200,
    badge: '150% Payout',
    bgGradient: 'from-emerald-600/20 via-teal-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    description: 'Fast-paced tactical 2v2 face-off on Bermuda Clash Squad maps. Winner squad receives 150% total return. No per-kill calculation.',
    rulesSummary: [
      '2v2 team format. Both teammates must be ready at scheduled time.',
      'Winner squad receives 150% total return (Entry ₹200 → ₹300 total reward).',
      'Direct prize payout to winning team within 15 minutes.',
      'Any glitch/hack usage results in immediate DQ.'
    ],
    features: ['150% Return to Winning Duo', 'Direct Prize Payout', 'Fast-Paced 15m Matches']
  },
  {
    id: 'cs-4v4',
    title: 'Clash Squad 4v4 War',
    tagline: 'Clan vs Clan • Full 4v4 Showdown',
    category: 'Clash Squad',
    teamSize: 4,
    playersTotal: 8,
    defaultEntryFee: 400,
    badge: 'Clan Battle',
    bgGradient: 'from-violet-600/20 via-fuchsia-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&auto=format&fit=crop&q=80',
    description: 'High voltage 4v4 team wars. Settle clan rivalries in custom competitive settings with official POP referee supervision.',
    rulesSummary: [
      'Full 4-player teams facing off in custom competitive CS room.',
      'Official referee monitors for banned weapons and unfair tactics.',
      'Winner team takes major prize share; runner-up receives secondary prize.',
      'Detailed round scores logged in public match archive.'
    ],
    features: ['Custom Esports Settings', 'Full Clan War Support', 'Official POP Referee']
  },
  {
    id: 'cs-custom',
    title: 'Clash Squad Custom (Unlimited Gloo)',
    tagline: 'Unlimited Gloo • 7/13 Rounds • Competitive Rules',
    category: 'Clash Squad',
    teamSize: 4,
    playersTotal: 8,
    defaultEntryFee: 200,
    badge: 'Unlimited Gloo',
    bgGradient: 'from-cyan-600/20 via-blue-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    description: 'The community favorite custom room format. Unlimited Gloo Wall, 1500 coin start, 7 to 13 rounds, gun attributes off or on as per room rules.',
    rulesSummary: [
      'Unlimited Gloo Wall active in room settings.',
      'No roof climbing, no grenade spamming (as per referee instructions).',
      'Winning squad takes major tournament prize pool.',
      'Referees present in spectator slot for fair play assurance.'
    ],
    features: ['Unlimited Gloo Wall', 'Custom Round Settings', 'Referee Monitored']
  },
  {
    id: 'lone-wolf-1v1',
    title: 'Lone Wolf 1v1 Arena',
    tagline: 'Iron Cage • 150% Return to Champion',
    category: 'Special & Duel',
    teamSize: 1,
    playersTotal: 2,
    defaultEntryFee: 50,
    badge: '150% Win Return',
    bgGradient: 'from-yellow-600/20 via-amber-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    description: 'The official Iron Cage 1v1 mode. Alternate weapon picking each round. Winner claims 150% total payout (100% entry returned + 50% bonus). No per-kill calculation.',
    rulesSummary: [
      'Official Lone Wolf mode on Iron Cage map.',
      'First to win 5 rounds wins the entire match.',
      'Winner payout = 150% of entry fee (Entry ₹50 → Win ₹75; Entry ₹100 → Win ₹150).',
      'No per-kill bounty. Pure skill victory.'
    ],
    features: ['150% Total Return for 1st', 'Iron Cage Close Quarters', 'Zero Teammate Reliance']
  },
  {
    id: 'lone-wolf-2v2',
    title: 'Lone Wolf 2v2 Tag Team',
    tagline: 'Iron Cage 2v2 • 150% Return to Winner Duo',
    category: 'Special & Duel',
    teamSize: 2,
    playersTotal: 4,
    defaultEntryFee: 100,
    badge: 'Tag Team',
    bgGradient: 'from-cyan-600/20 via-sky-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&auto=format&fit=crop&q=80',
    description: '2v2 tactical arena skirmish. Winner duo receives 150% return (Entry ₹100 → ₹150 total payout).',
    rulesSummary: [
      '2 players per team in Iron Cage.',
      'Winner team receives 150% total payout (100% entry + 50% bonus).',
      'No per-kill bounty in duel modes.',
      'Fast 5-round battle format.'
    ],
    features: ['150% Return Payout', 'Equal Team Distribution', 'Multiple Daily Slots']
  },
  {
    id: 'headshot-mode',
    title: 'Headshot Only Mode',
    tagline: 'M500 / Desert Eagle Only • 150% Champion Return',
    category: 'Special & Duel',
    teamSize: 1,
    playersTotal: 2,
    defaultEntryFee: 100,
    badge: '150% Return',
    bgGradient: 'from-rose-600/20 via-red-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    description: 'The ultimate aiming proving ground. Only headshot eliminations count. Winner receives 150% return (Entry ₹100 → Win ₹150).',
    rulesSummary: [
      'Only Red Numbers (Headshots) allowed for elimination.',
      'Winner takes 150% total payout (Entry ₹100 → ₹150). No per-kill.',
      'Body damage kills result in round forfeiture.',
      'Strict ping limit: below 120ms recommended.'
    ],
    features: ['150% Return on Booyah', 'One-Tap Weapons Only', 'Video Verification Required']
  },
  {
    id: 'monthly-championship',
    title: 'Monthly Grand Championship',
    tagline: '₹10,000+ Prize Pool • Multi-Stage Points League',
    category: 'Flagship Championship',
    teamSize: 4,
    playersTotal: 96,
    defaultEntryFee: 1000,
    badge: '₹10,000+ Pool',
    bgGradient: 'from-amber-500/25 via-yellow-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    description: 'The premier monthly competitive esports league on POP Gaming. 24 top squads battle across 6 matches for glory and huge cash prizes.',
    rulesSummary: [
      'Squad (4 players + 1 optional substitute).',
      'Official points table: 1st (12pts), 2nd (9pts), 3rd (8pts), +1pt per kill.',
      '6 consecutive maps: Bermuda, Purgatory, Kalahari rotation.',
      'Live streamed with cast & live tournament scoreboard.'
    ],
    features: ['6-Map Official Circuit', 'Live Broadcast & Casting', 'Trophy + Major Cash Payout']
  },
  {
    id: 'mega-championship',
    title: 'Mega 4-Day Esports Invitational',
    tagline: '4 Days • Qualifiers to Grand Finals • Ultimate Championship',
    category: 'Flagship Championship',
    teamSize: 4,
    playersTotal: 192,
    defaultEntryFee: 2500,
    badge: '₹50,000+ Pool',
    bgGradient: 'from-fuchsia-600/25 via-purple-950/40 to-neutral-950',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    description: 'The biggest esports showdown of the season. Day 1 Qualifiers, Day 2 League, Day 3 Semi-Finals, and Day 4 Grand Final live broadcast.',
    rulesSummary: [
      'Day 1: Open Qualifier lobbies across 4 brackets.',
      'Day 2: Top 32 teams battle in double-elimination groups.',
      'Day 3: Top 16 qualify for Championship Sunday.',
      'Day 4: Grand Finals 8-game grueling circuit.'
    ],
    features: ['Multi-Stage Tournament Tree', 'Verified Professional Roster', 'Highest Prize Multiplier']
  }
];

export const INITIAL_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    title: 'FREE FIRE MAX ESPORTS ARENA',
    subtitle: 'DAILY COMPETE & WIN VERIFIED REWARDS',
    description: 'Join real-time lobbies in Solo, Duo, Squad, and Clash Squad. 100% fair play, verified kills, and instant UPI payouts in under 15 minutes.',
    ctaText: 'Browse Tournaments',
    ctaAction: 'tournaments',
    badge: 'POP GAMING SEASON 9',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#f97316',
    highlightText: 'INSTANT ₹ UPI PAYOUTS'
  },
  {
    id: 'slide-2',
    title: 'SOLO & SQUAD BATTLE ROYALE',
    subtitle: '2.0X CHAMPION BONUS + PER-KILL CASH',
    description: '1st place takes 200% entry return, 2nd gets 130%, 3rd gets 120% + guaranteed per-kill cash bounty for every enemy eliminated.',
    ctaText: 'Join Next BR Match',
    ctaAction: 'tournaments',
    badge: 'HIGH BOUNTY REWARDS',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#06b6d4',
    highlightText: 'UP TO ₹100 PER KILL'
  },
  {
    id: 'slide-3',
    title: 'GRAND MONTHLY CHAMPIONSHIP',
    subtitle: '₹10,000+ POOL • 6 MAPS • OFFICIAL CASTING',
    description: 'Assemble your ultimate squad. Compete in our flagship 6-map circuit against the sharpest squads across India with official refereeing.',
    ctaText: 'View Championship',
    ctaAction: 'championship',
    badge: 'FLAGSHIP EVENT',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#eab308',
    highlightText: 'MEGA PRIZE POOL'
  }
];

export const INITIAL_MATCHES = [
  {
    id: 'match-br-20-01',
    matchCode: 'POP-BR-20-A',
    title: 'Daily Solo Bermuda Warmup #01',
    gameMode: 'solo-br' as GameModeId,
    gameModeName: 'Solo Battle Royale',
    entryFee: 20,
    maxPlayers: 48,
    minPlayers: 20,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'Tonight at 8:00 PM',
    mapName: 'Bermuda',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Solo BR',
      revivesAllowed: false,
      gunAttributes: true,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: 'No teaming. Elimination is final. 1st: ₹40, 2nd: ₹26, 3rd: ₹24 + ₹7/kill.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 2.0,
      secondPlaceMultiplier: 1.3,
      thirdPlaceMultiplier: 1.2,
      perKillReward: 7
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Solo', 'Fast Filling', 'Low Entry'],
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'match-br-50-01',
    matchCode: 'POP-BR-50-PRIME',
    title: 'Solo Bermuda Bounty Hunter #02',
    gameMode: 'solo-br' as GameModeId,
    gameModeName: 'Solo Battle Royale',
    entryFee: 50,
    maxPlayers: 48,
    minPlayers: 25,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'Tonight at 9:00 PM',
    mapName: 'Purgatory',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Solo BR',
      revivesAllowed: false,
      gunAttributes: true,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: '1st: ₹100, 2nd: ₹65, 3rd: ₹60 + ₹17 per confirmed kill.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 2.0,
      secondPlaceMultiplier: 1.3,
      thirdPlaceMultiplier: 1.2,
      perKillReward: 17
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['High Bounty', 'Prime Time'],
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'match-squad-200-01',
    matchCode: 'POP-SQ-200-NIGHT',
    title: 'Squad Bermuda Dominance #01',
    gameMode: 'squad-br' as GameModeId,
    gameModeName: 'Squad Battle Royale (4v4)',
    entryFee: 200,
    maxPlayers: 48,
    minPlayers: 24,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'Tonight at 9:45 PM',
    mapName: 'Bermuda',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Squad (4 Players)',
      revivesAllowed: false,
      gunAttributes: true,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: 'Team split 25% each. 1st Squad: ₹400, 2nd Squad: ₹260, 3rd Squad: ₹240 + ₹67/kill.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 2.0,
      secondPlaceMultiplier: 1.3,
      thirdPlaceMultiplier: 1.2,
      perKillReward: 67
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Squad 4v4', 'Esports Mode'],
    bannerImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'match-cs-100-01',
    matchCode: 'POP-CS-100-DUEL',
    title: 'Clash Squad 1v1 High Stakes',
    gameMode: 'cs-1v1' as GameModeId,
    gameModeName: 'Clash Squad 1v1 Duel',
    entryFee: 100,
    maxPlayers: 2,
    minPlayers: 2,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'In 20 minutes',
    mapName: 'Iron Cage CS',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: '1v1 Duel (Best of 13)',
      revivesAllowed: false,
      gunAttributes: false,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: 'Winner takes ₹150 direct cash payout (150% Total Return: 100% Entry Return + ₹50 Bonus). No per-kill.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 1.5,
      secondPlaceMultiplier: 0,
      thirdPlaceMultiplier: 0,
      perKillReward: 0,
      fixedWinnerPrize: 150,
      fixedRunnerUpPrize: 0
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['1v1 Duel', '150% Return', 'Instant Match'],
    bannerImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'match-lw-50-01',
    matchCode: 'POP-LW-50-CAGE',
    title: 'Lone Wolf 1v1 Iron Cage Skirmish',
    gameMode: 'lone-wolf-1v1' as GameModeId,
    gameModeName: 'Lone Wolf 1v1 Arena',
    entryFee: 50,
    maxPlayers: 2,
    minPlayers: 2,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'In 10 minutes',
    mapName: 'Iron Cage',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Lone Wolf 1v1 (First to 5)',
      revivesAllowed: false,
      gunAttributes: false,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: 'Winner takes ₹75 payout (150% Total Return: Entry ₹50 + ₹25 Bonus). No per-kill calculation.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 1.5,
      secondPlaceMultiplier: 0,
      thirdPlaceMultiplier: 0,
      perKillReward: 0,
      fixedWinnerPrize: 75,
      fixedRunnerUpPrize: 0
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Lone Wolf', '150% Return', 'Speed Match'],
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'match-br-100-01',
    matchCode: 'POP-BR-100-CHAMP',
    title: 'Solo Bermuda Elite #03',
    gameMode: 'solo-br' as GameModeId,
    gameModeName: 'Solo Battle Royale',
    entryFee: 100,
    maxPlayers: 48,
    minPlayers: 25,
    approvedCount: 0,
    status: 'REGISTRATION_OPEN' as const,
    scheduledStart: 'Tonight at 10:30 PM',
    mapName: 'Kalahari',
    serverRegion: 'India (FF MAX)',
    rulesSnapshot: {
      format: 'Solo BR',
      revivesAllowed: false,
      gunAttributes: true,
      characterSkill: true,
      limitedAmmo: true,
      customNotes: '1st: ₹200, 2nd: ₹130, 3rd: ₹120 + ₹34 per kill bounty.'
    },
    rewardConfig: {
      firstPlaceMultiplier: 2.0,
      secondPlaceMultiplier: 1.3,
      thirdPlaceMultiplier: 1.2,
      perKillReward: 34
    },
    credentialsReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Elite Tier', 'Kalahari'],
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80'
  }
];

export const PROMO_BANNERS = [
  {
    id: 'promo-bermuda-carnage',
    title: 'BERMUDA VOLCANIC CARNAGE',
    tagline: 'ULTRA HIGH BOUNTY • SOLO & SQUAD',
    description: 'High-stakes battle royale on the revised Bermuda terrain. Special night storm event with double kill bonuses and instant UPI transfer to champions.',
    badge: 'SPECIAL EVENT',
    themeColor: 'from-orange-600 via-amber-600 to-red-700',
    entryFee: 100,
    prizePool: '₹5,000 GTD',
    gameMode: 'solo-br' as GameModeId,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    aiPromptSummary: 'Futuristic Free Fire warriors in cyber-tactical armor with glowing neon weapons in front of volcanic explosions',
    scheduleText: 'Live Tonight • 9:30 PM IST',
    features: ['Double Kill Multiplier', 'Official Referee Cast', 'Instant UPI Payout']
  },
  {
    id: 'promo-iron-cage-duel',
    title: 'IRON CAGE 1V1 GLORY CLASH',
    tagline: 'ONE-TAP ONLY • NO ARMOR REPAIRS',
    description: 'The definitive duel tournament. Desert Eagle & M500 headshot duels inside the high-voltage iron cage arena. 7 rounds to conquer.',
    badge: 'DUEL ARENA',
    themeColor: 'from-cyan-600 via-blue-600 to-indigo-800',
    entryFee: 50,
    prizePool: '₹1,500 WINNER TAKES ALL',
    gameMode: 'cs-1v1' as GameModeId,
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1600&auto=format&fit=crop&q=80',
    aiPromptSummary: 'Intense 1v1 Free Fire headshot duel under dramatic neon spotlights with electric crosshairs',
    scheduleText: 'Starts in 35 Mins • 1v1 Duel',
    features: ['Headshots Only Mode', 'Best of 13 Rounds', 'Fast 10-Min Match']
  },
  {
    id: 'promo-squad-warfare',
    title: '4V4 SQUAD WARFARE ROYALE',
    tagline: 'CLAN RIVALRY • SQUAD ELITE SHOWDOWN',
    description: 'Form your 4-man powerhouse squad. Compete across 3 back-to-back maps with strategic zone closures and full points classification.',
    badge: 'SQUAD 4V4',
    themeColor: 'from-purple-600 via-violet-600 to-fuchsia-800',
    entryFee: 400,
    prizePool: '₹8,000 PRIZE POOL',
    gameMode: 'squad-br' as GameModeId,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80',
    aiPromptSummary: '4-player esports tactical squad in high-tech glowing gear advancing through a cyber battlefield',
    scheduleText: 'Registration Open • 10:15 PM IST',
    features: ['4-Player Team Roster', '2.0X 1st Place Bonus', 'Top 3 Podium Payouts']
  },
  {
    id: 'promo-grand-championship',
    title: 'POP MEGA INVITATIONAL 2026',
    tagline: '4-DAY ESPORTS MARATHON • NATIONWIDE',
    description: 'The pinnacle event of the season. 64 verified squads, 4 stages from qualifiers to the Grand Final Sunday live broadcast.',
    badge: 'FLAGSHIP INVITATIONAL',
    themeColor: 'from-amber-500 via-yellow-600 to-orange-700',
    entryFee: 1000,
    prizePool: '₹25,000+ TOTAL POOL',
    gameMode: 'monthly-championship' as GameModeId,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
    aiPromptSummary: 'Grand esports championship stage with trophies, pyro flames, and high adrenaline Free Fire battle royale imagery',
    scheduleText: 'Weekend Grand Finals • 7:00 PM IST',
    features: ['6-Map Circuit Rotation', 'Live Stream Casting', 'Verified Trophy Award']
  }
];

