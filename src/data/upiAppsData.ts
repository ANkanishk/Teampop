import { UpiAppConfig } from '../types';

// High-fidelity SVG icons matching the user's uploaded images exactly
export const DEFAULT_POP_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="110" fill="#0C0C0D"/>
  <g transform="translate(48, 120)">
    <!-- First 'p' -->
    <path d="M 40 240 L 40 40 L 115 40 C 155 40 175 65 175 110 C 175 155 155 180 115 180 L 85 180 L 85 240 Z" fill="#FF5E3A" />
    <path d="M 40 240 L 40 100 L 115 100 C 155 100 175 125 175 170 C 175 215 155 240 115 240 L 85 240 L 85 240 Z" fill="#FFFFFF" />
    <circle cx="108" cy="170" r="18" fill="#FF5E3A" />
    
    <!-- Middle 'o' -->
    <path d="M 210 40 C 255 40 280 65 280 110 C 280 155 255 180 210 180 C 165 180 140 155 140 110 C 140 65 165 40 210 40 Z" fill="#FF5E3A" />
    <path d="M 210 100 C 255 100 280 125 280 170 C 280 215 255 240 210 240 C 165 240 140 215 140 170 C 140 125 165 100 210 100 Z" fill="#FFFFFF" />
    <circle cx="210" cy="170" r="18" fill="#FF5E3A" />

    <!-- Last 'p' -->
    <path d="M 305 240 L 305 40 L 380 40 C 420 40 440 65 440 110 C 440 155 420 180 380 180 L 350 180 L 350 240 Z" fill="#FF5E3A" />
    <path d="M 305 240 L 305 100 L 380 100 C 420 100 440 125 440 170 C 440 215 420 240 380 240 L 350 240 L 350 240 Z" fill="#FFFFFF" />
    <circle cx="373" cy="170" r="18" fill="#FF5E3A" />
  </g>
</svg>
`)}`;

export const DEFAULT_PHONEPE_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <circle cx="256" cy="256" r="256" fill="#5F259F"/>
  <!-- PhonePe 'pe' symbol in Devanagari -->
  <path d="M 205 130 L 295 235 L 370 235 L 370 270 L 340 270 L 340 385 L 295 385 L 295 270 L 225 270 C 190 270 175 250 175 210 L 175 130 Z" fill="none"/>
  <path d="M 205 130 L 310 235 L 375 235 L 375 268 L 345 268 L 345 420 L 295 420 L 295 268 L 225 268 C 180 268 150 242 150 195 L 150 130 L 205 130 Z" fill="none"/>
  <!-- Accurate vector PhonePe पे -->
  <g fill="#FFFFFF">
    <path d="M 150 170 L 370 170 L 370 205 L 340 205 L 340 420 L 295 420 L 295 205 L 225 205 C 195 205 175 220 175 250 C 175 280 195 295 225 295 L 295 295 L 295 340 L 225 340 C 165 340 130 305 130 250 C 130 195 165 170 225 170 Z" />
    <polygon points="205,170 295,70 325,95 245,170" />
  </g>
</svg>
`)}`;

export const DEFAULT_PAYTM_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="12"/>
  <!-- Paytm wordmark -->
  <g transform="translate(45, 130)">
    <!-- Pay in dark navy blue -->
    <path d="M 20 15 L 20 95 L 45 95 L 45 65 L 70 65 C 95 65 110 50 110 40 C 110 25 95 15 70 15 Z M 45 35 L 68 35 C 80 35 85 40 85 40 C 85 45 80 50 68 50 L 45 50 Z" fill="#002970" />
    <path d="M 120 40 C 120 30 130 25 145 25 C 160 25 170 30 170 40 L 170 95 L 148 95 L 148 85 C 142 92 135 97 122 97 C 108 97 98 88 98 72 C 98 56 112 48 145 48 L 148 48 L 148 44 C 148 38 142 35 135 35 C 128 35 124 38 122 41 Z M 148 62 L 138 62 C 125 62 120 66 120 72 C 120 78 125 82 134 82 C 142 82 148 76 148 70 Z" fill="#002970" />
    <path d="M 180 30 L 202 75 L 224 30 L 248 30 L 214 98 L 214 125 L 190 125 L 190 98 L 158 30 Z" fill="#002970" />

    <!-- tm in cyan -->
    <path d="M 255 15 L 255 30 L 270 30 L 270 95 L 292 95 L 292 30 L 307 30 L 307 15 Z" fill="#00BAF2" />
    <path d="M 315 30 L 335 30 L 335 42 C 342 33 352 28 365 28 C 378 28 388 35 392 45 C 400 33 412 28 425 28 C 445 28 455 40 455 62 L 455 95 L 433 95 L 433 65 C 433 55 428 50 420 50 C 412 50 405 56 405 66 L 405 95 L 383 95 L 383 65 C 383 55 378 50 370 50 C 362 50 357 56 357 66 L 357 95 L 335 95 Z" fill="#00BAF2" />
  </g>

  <!-- Heart divider -->
  <g transform="translate(60, 245)">
    <rect x="0" y="15" width="135" height="10" rx="5" fill="#002970" />
    <path d="M 200 8 C 185 -10 160 5 160 25 C 160 48 200 68 200 68 C 200 68 240 48 240 25 C 240 5 215 -10 200 8 Z" fill="#FF1744" />
    <rect x="265" y="15" width="135" height="10" rx="5" fill="#00BAF2" />
  </g>

  <!-- UPI Section -->
  <g transform="translate(100, 340)">
    <!-- Slanted U -->
    <path d="M 20 0 L 45 0 L 30 50 C 26 65 38 70 52 70 C 66 70 78 65 82 50 L 97 0 L 122 0 L 105 55 C 95 85 68 95 42 95 C 16 95 0 85 8 55 Z" fill="#222222"/>
    <!-- Slanted P -->
    <path d="M 140 0 L 195 0 C 225 0 240 15 235 38 C 230 58 210 72 180 72 L 152 72 L 140 115 L 115 115 Z M 165 22 L 155 52 L 180 52 C 195 52 205 45 208 35 C 210 26 205 22 192 22 Z" fill="#222222"/>
    <!-- Slanted I with tricolor accents -->
    <path d="M 245 0 L 270 0 L 245 95 L 220 95 Z" fill="#222222"/>
    <polygon points="280,0 295,45 268,45" fill="#FF9933" />
    <polygon points="295,48 272,95 292,95" fill="#138808" />
  </g>
</svg>
`)}`;

export const DEFAULT_GPAY_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="8"/>
  <g transform="translate(50, 140)">
    <!-- Google G multi-color -->
    <g transform="translate(10, 20)">
      <path d="M 100 95 C 100 87 99 80 97 73 L 0 73 L 0 112 L 56 112 C 54 125 46 137 36 144 L 36 171 L 69 171 C 88 153 100 127 100 95 Z" fill="#4285F4" transform="translate(95, 0)"/>
      <path d="M 95 190 C 122 190 145 181 161 166 L 128 140 C 119 146 108 150 95 150 C 69 150 47 132 39 108 L 6 108 L 6 134 C 23 167 56 190 95 190 Z" fill="#34A853"/>
      <path d="M 39 108 C 37 101 36 93 36 85 C 36 77 37 69 39 62 L 39 36 L 6 36 C -1 51 -6 68 -6 85 C -6 102 -1 119 6 134 L 39 108 Z" fill="#FBBC05"/>
      <path d="M 95 20 C 110 20 123 25 134 35 L 162 7 C 145 -9 122 -18 95 -18 C 56 -18 23 5 6 38 L 39 64 C 47 40 69 20 95 20 Z" fill="#EA4335"/>
    </g>
    <!-- Pay text in sleek grey -->
    <g transform="translate(230, 20)">
      <!-- P -->
      <path d="M 20 0 L 65 0 C 95 0 115 18 115 48 C 115 78 95 96 65 96 L 46 96 L 46 170 L 20 170 Z M 46 25 L 46 71 L 64 71 C 80 71 90 62 90 48 C 90 34 80 25 64 25 Z" fill="#5F6368"/>
      <!-- a -->
      <path d="M 120 85 C 120 60 138 48 165 48 C 182 48 195 54 200 62 L 200 50 L 222 50 L 222 170 L 200 170 L 200 156 C 193 166 180 172 165 172 C 138 172 120 156 120 128 Z M 144 110 C 144 132 158 148 174 148 C 190 148 200 134 200 118 L 200 102 C 195 94 185 88 172 88 C 156 88 144 98 144 110 Z" fill="#5F6368"/>
      <!-- y -->
      <path d="M 235 50 L 260 50 L 285 125 L 310 50 L 335 50 L 295 165 C 285 195 272 210 248 210 L 235 210 L 235 188 L 244 188 C 258 188 266 180 272 162 Z" fill="#5F6368"/>
    </g>
  </g>
</svg>
`)}`;

export const DEFAULT_ANY_UPI_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="anyUpiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#anyUpiGrad)" stroke="#10B981" stroke-width="10"/>
  <!-- Phone outline with lightning/UPI pay icon -->
  <g transform="translate(136, 86)">
    <rect x="30" y="0" width="180" height="340" rx="36" fill="#022c22" stroke="#34D399" stroke-width="12"/>
    <rect x="85" y="16" width="70" height="10" rx="5" fill="#34D399"/>
    <!-- Screen content -->
    <rect x="50" y="45" width="140" height="240" rx="16" fill="#047857"/>
    <!-- Lightning bolt payment -->
    <polygon points="128,75 88,160 120,160 108,245 152,145 120,145" fill="#FBBF24" stroke="#FFF" stroke-width="4"/>
    <circle cx="120" cy="308" r="10" fill="#34D399"/>
  </g>
  <text x="256" y="455" fill="#ECFDF5" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="1">ANY UPI APP</text>
</svg>
`)}`;

export const INITIAL_UPI_APPS: UpiAppConfig[] = [
  {
    id: 'pop',
    name: 'POP UPI',
    shortName: 'POP',
    tagline: 'Direct Instant Pay',
    logoUrl: DEFAULT_POP_LOGO_SVG,
    packageScheme: 'upi://pay',
    enabled: true,
    colorTheme: '#FF5E3A',
    badgeText: 'Official POP App',
    order: 1,
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    tagline: 'Instant 1-Click Pay',
    logoUrl: DEFAULT_PHONEPE_LOGO_SVG,
    packageScheme: 'phonepe://pay',
    enabled: true,
    colorTheme: '#5F259F',
    badgeText: 'Fastest',
    order: 2,
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    tagline: 'Paytm Wallet & UPI',
    logoUrl: DEFAULT_PAYTM_LOGO_SVG,
    packageScheme: 'paytmmp://pay',
    enabled: true,
    colorTheme: '#00BAF2',
    badgeText: 'Instant',
    order: 3,
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    tagline: 'Google Verified Pay',
    logoUrl: DEFAULT_GPAY_LOGO_SVG,
    packageScheme: 'upi://pay',
    enabled: true,
    colorTheme: '#4285F4',
    badgeText: 'Secure',
    order: 4,
  },
  {
    id: 'any',
    name: 'Any UPI App on Phone',
    shortName: 'Any UPI App',
    tagline: 'Cred • BHIM • Amazon Pay • Navi • Bank App',
    logoUrl: DEFAULT_ANY_UPI_LOGO_SVG,
    packageScheme: 'upi://pay',
    enabled: true,
    colorTheme: '#10B981',
    badgeText: 'Universal',
    order: 5,
  },
];

/**
 * Builds standard UPI Intent URI pre-filled with exact tournament entry fee
 */
export const buildUpiDeepLink = (
  app: UpiAppConfig,
  globalUpiId: string,
  merchantName: string,
  entryFee: number,
  matchCode: string
): string => {
  const targetUpiId = (app.customUpiId && app.customUpiId.trim()) || globalUpiId || 'wepopearn@oksbi';
  const name = merchantName || 'POP Gaming Esports';
  const note = `POP Free Fire Match ${matchCode}`;
  const amount = Number(entryFee).toFixed(2);

  // Standard query params recognized by all NPCI compliant UPI apps
  const query = `pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;

  if (app.id === 'phonepe') {
    return `phonepe://pay?${query}`;
  }
  if (app.id === 'paytm') {
    return `paytmmp://pay?${query}`;
  }
  // Generic / Default intent triggers Android/iOS native UPI sheet for all apps
  return `upi://pay?${query}`;
};
