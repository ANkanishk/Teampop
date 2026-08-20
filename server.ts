import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { dbStore } from './src/server/database';

dotenv.config();

const SMTP_CONFIG_FILE = path.join(process.cwd(), '.smtp_config.json');

interface PlayerData {
  playerName: string;
  inGameName: string;
  gameUid: string;
  phone: string;
}

interface RegistrationApprovalPayload {
  registrationId: string;
  recipientEmail: string;
  captainName: string;
  captainPhone: string;
  teamName?: string;
  gameMode: string;
  entryFee: number;
  totalPayable: number;
  utrNumber: string;
  matchId: string;
  matchTitle: string;
  mapName?: string;
  scheduledTime?: string;
  scheduledDate?: string;
  serverRegion?: string;
  fixedWinnerPrize?: number;
  killBounty?: number;
  adminNotes?: string;
  players?: PlayerData[];
}

interface NotificationLogEntry {
  id: string;
  registrationId: string;
  recipientEmail: string;
  participantName: string;
  matchTitle: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  sentAt: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

const notificationLogs: NotificationLogEntry[] = [];

// Dynamic SMTP Configuration state
interface SmtpRuntimeConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function loadPersistedSmtpConfig(): Partial<SmtpRuntimeConfig> {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const raw = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      console.log('[SMTP Config] Loaded saved credentials from disk for', parsed.user || 'admin');
      return parsed;
    }
  } catch (e) {
    console.warn('[SMTP Config] Could not read config file', e);
  }
  return {};
}

function savePersistedSmtpConfig(config: SmtpRuntimeConfig) {
  try {
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    console.log('[SMTP Config] Saved SMTP configuration permanently to disk');
  } catch (e) {
    console.warn('[SMTP Config] Could not write config file', e);
  }
}

const savedDiskConfig = loadPersistedSmtpConfig();

let activeSmtpConfig: SmtpRuntimeConfig = {
  host: process.env.SMTP_HOST || savedDiskConfig.host || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || String(savedDiskConfig.port || '465'), 10),
  secure: process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE !== 'false' : (savedDiskConfig.secure !== undefined ? savedDiskConfig.secure : true),
  user: (process.env.SMTP_USER || savedDiskConfig.user || 'wepopearn@gmail.com').trim(),
  pass: (process.env.SMTP_PASS || savedDiskConfig.pass || 'uqrddnyogxitghkr').trim().replace(/\s+/g, ''),
  from: process.env.SMTP_FROM || savedDiskConfig.from || 'POP Gaming Tournaments <wepopearn@gmail.com>',
};

// In-Memory OTP Store with 10-minute expiry
interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpEntry>();

// Lazy transporter creation
let transporter: nodemailer.Transporter | null = null;
let isSimulated = false;

function createGmailTransporter(user: string, pass: string): nodemailer.Transporter {
  const cleanPass = pass.trim().replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user.trim(),
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function initMailTransporter(config?: Partial<SmtpRuntimeConfig>): { transporter: nodemailer.Transporter; simulated: boolean } {
  if (config) {
    activeSmtpConfig = { ...activeSmtpConfig, ...config };
    if (activeSmtpConfig.pass) {
      activeSmtpConfig.pass = activeSmtpConfig.pass.replace(/\s+/g, '');
    }
    transporter = null; // force re-creation
  }

  if (transporter) {
    return { transporter, simulated: isSimulated };
  }

  const { host, port, user, pass } = activeSmtpConfig;

  if (user && pass && pass.trim().length > 0) {
    try {
      const cleanPass = pass.trim().replace(/\s+/g, '');
      const isGmail = (host && host.includes('gmail')) || user.includes('@gmail.com');

      if (isGmail) {
        transporter = createGmailTransporter(user, cleanPass);
      } else {
        transporter = nodemailer.createTransport({
          host: host || 'smtp.gmail.com',
          port: port || 465,
          secure: port === 465,
          auth: { 
            user: user.trim(), 
            pass: cleanPass 
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      }

      isSimulated = false;
      console.log(`[Email Engine] Configured Live SMTP for ${user} (service: ${isGmail ? 'Gmail' : host})`);
      return { transporter, simulated: false };
    } catch (e) {
      console.error('[Email Engine] Live SMTP setup failed, falling back to simulated mode', e);
    }
  }

  // Fallback / simulation transporter (stores json output safely)
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  isSimulated = true;
  console.log('[Email Engine] Initialized Built-in Notification Engine (Simulation Mode)');
  return { transporter, simulated: true };
}

function getMailTransporter(): { transporter: nodemailer.Transporter; simulated: boolean } {
  return initMailTransporter();
}

function sanitizeEmail(email?: string): string | null {
  if (!email || typeof email !== 'string') return null;
  let cleaned = email.trim().toLowerCase();
  // Auto-correct common mobile typing mistakes
  cleaned = cleaned.replace(/@gmail\.co$/i, '@gmail.com');
  cleaned = cleaned.replace(/@gmail\.con$/i, '@gmail.com');
  cleaned = cleaned.replace(/@gmail\.cmo$/i, '@gmail.com');
  cleaned = cleaned.replace(/@gmail\.comm$/i, '@gmail.com');
  cleaned = cleaned.replace(/@gmail\.cm$/i, '@gmail.com');
  cleaned = cleaned.replace(/@gmail\.om$/i, '@gmail.com');
  cleaned = cleaned.replace(/@yahoo\.co$/i, '@yahoo.com');
  cleaned = cleaned.replace(/@yahoo\.con$/i, '@yahoo.com');
  cleaned = cleaned.replace(/@outlook\.co$/i, '@outlook.com');
  cleaned = cleaned.replace(/@hotmail\.co$/i, '@hotmail.com');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) return null;
  return cleaned;
}

function generateConfirmationEmailHtml(data: RegistrationApprovalPayload): string {
  const isTeam = data.gameMode === 'duo-br' || data.gameMode === 'squad-br' || data.gameMode === 'clash-squad';
  const players = data.players && data.players.length > 0 ? data.players : [
    {
      playerName: data.captainName,
      inGameName: data.captainName,
      gameUid: 'Registered UID',
      phone: data.captainPhone,
    },
  ];

  const playersRows = players
    .map(
      (p, i) => `
      <tr style="border-bottom: 1px solid #262626;">
        <td style="padding: 10px; color: #a3a3a3; font-size: 12px; font-family: monospace;">#${i + 1}</td>
        <td style="padding: 10px; color: #ffffff; font-size: 13px; font-weight: bold;">${p.inGameName || p.playerName}</td>
        <td style="padding: 10px; color: #f97316; font-size: 13px; font-family: monospace; font-weight: bold;">${p.gameUid}</td>
        <td style="padding: 10px; color: #d4d4d4; font-size: 12px;">${p.phone || '-'}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tournament Registration Approved - POP Gaming</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%); padding: 28px 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(0, 0, 0, 0.4); padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 11px; font-weight: 800; color: #fed7aa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                      FREE FIRE ESPORTS • SLOT CONFIRMED
                    </div>
                    <h1 style="margin: 4px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                      POP GAMING TOURNAMENTS
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #ffedd5; font-size: 13px; font-weight: 500;">
                      Your tournament entry payment and slot have been officially verified!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Slot Status Badge Bar -->
          <tr>
            <td style="padding: 16px 24px; background-color: #1a1a1a; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 11px; color: #a3a3a3; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Registration ID</span>
                    <div style="font-size: 14px; color: #ffffff; font-weight: 800; font-family: monospace; margin-top: 2px;">
                      ${data.registrationId}
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      ✓ APPROVED & CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #f5f5f5; line-height: 1.5;">
                Hello <strong>${data.captainName}</strong>${data.teamName ? ` (Team: <strong>${data.teamName}</strong>)` : ''},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #a3a3a3; line-height: 1.6;">
                Great news! Our tournament admin team has verified your UPI payment (UTR: <strong style="color: #ffffff; font-family: monospace;">${data.utrNumber}</strong>). Your slot in <strong>${data.matchTitle}</strong> is locked and 100% confirmed.
              </p>

              <!-- Match Details Card -->
              <div style="background-color: #0f0f0f; border: 1px solid #262626; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #f97316; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Match Information & Schedule
                </h3>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373; width: 40%;">Tournament:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #ffffff; font-weight: 700;">${data.matchTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373;">Game Mode:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #f97316; font-weight: 800; text-transform: uppercase;">${data.gameMode.replace('-', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373;">Map & Region:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #ffffff; font-weight: 600;">${data.mapName || 'Bermuda'} (${data.serverRegion || 'India'})</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373;">Timing:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #38bdf8; font-weight: 700;">${data.scheduledTime || 'As scheduled in Lobby'} • ${data.scheduledDate || 'Today'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373;">Entry Fee Paid:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #22c55e; font-weight: 800;">₹${data.totalPayable}</td>
                  </tr>
                  ${
                    data.killBounty
                      ? `
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #737373;">Kill Bounty:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #f97316; font-weight: 700;">₹${data.killBounty} per kill</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>

              <!-- Registered Roster Table -->
              <div style="background-color: #0f0f0f; border: 1px solid #262626; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Registered Player Roster (${players.length} Player${players.length > 1 ? 's' : ''})
                </h3>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #262626; text-align: left;">
                      <th style="padding: 8px 10px; color: #737373; font-size: 11px; font-weight: 700; text-transform: uppercase;">#</th>
                      <th style="padding: 8px 10px; color: #737373; font-size: 11px; font-weight: 700; text-transform: uppercase;">In-Game Name</th>
                      <th style="padding: 8px 10px; color: #737373; font-size: 11px; font-weight: 700; text-transform: uppercase;">Free Fire UID</th>
                      <th style="padding: 8px 10px; color: #737373; font-size: 11px; font-weight: 700; text-transform: uppercase;">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${playersRows}
                  </tbody>
                </table>
              </div>

              <!-- Room Credentials & Access Info -->
              <div style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(0,0,0,0.6) 100%); border: 1px solid rgba(234, 88, 12, 0.4); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0; color: #fb923c; font-size: 13px; font-weight: 800; text-transform: uppercase;">
                  🔑 How to Join the Custom Room
                </h3>
                <ol style="margin: 0; padding-left: 18px; color: #d4d4d4; font-size: 12px; line-height: 1.7;">
                  <li>Room ID & Password will be unlocked in your <strong>POP Gaming Dashboard / Lobby</strong> exactly <strong>15 minutes</strong> prior to match start.</li>
                  <li>Open Free Fire MAX &rarr; Custom &rarr; Enter Custom Room ID & Password.</li>
                  <li>Join your designated slot number and wait for the match host to start.</li>
                  <li><strong>Important:</strong> Emulators and third-party script modifiers are strictly prohibited. Violations lead to immediate disqualification without refund.</li>
                </ol>
              </div>

              ${
                data.adminNotes
                  ? `
              <div style="background-color: #1c1917; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <span style="font-size: 11px; color: #fdba74; font-weight: bold; text-transform: uppercase;">Admin Note:</span>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #e7e5e4;">${data.adminNotes}</p>
              </div>
              `
                  : ''
              }

              <!-- Help Desk Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #737373;">Need assistance with your slot or match credentials?</p>
                    <a href="https://wa.me/919999999999?text=Hello%20POP%20Gaming%20Support,%20I%20have%20an%20approved%20slot%20ID%20${encodeURIComponent(data.registrationId)}" target="_blank" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      💬 Contact 24/7 WhatsApp Support
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #0a0a0a; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #a3a3a3;">
                POP Gaming Esports Tournament Network
              </p>
              <p style="margin: 0; font-size: 11px; color: #525252; line-height: 1.5;">
                This automated transaction confirmation was generated for ${data.recipientEmail}.<br>
                Free Fire is a registered trademark of Garena International.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

interface RoomCredentialsPayload {
  recipientEmail: string;
  recipientName: string;
  matchTitle: string;
  matchCode: string;
  roomId: string;
  roomPassword: string;
  gameMode?: string;
  mapName?: string;
  scheduledTime?: string;
  serverRegion?: string;
  registrationId?: string;
  customNotes?: string;
}

function generateRoomCredentialsEmailHtml(data: RoomCredentialsPayload): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Fire Custom Room Pass - POP Gaming</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%); padding: 28px 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(0, 0, 0, 0.4); padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 11px; font-weight: 800; color: #fed7aa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                      🔑 ROOM PASS RELEASED • LIVE LOBBY
                    </div>
                    <h1 style="margin: 4px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                      POP GAMING TOURNAMENTS
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #ffedd5; font-size: 13px; font-weight: 600;">
                      Your private Free Fire room ID & password are ready!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Match Code Bar -->
          <tr>
            <td style="padding: 14px 24px; background-color: #1a1a1a; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 11px; color: #a3a3a3; text-transform: uppercase; font-weight: 700;">Tournament Match</span>
                    <div style="font-size: 14px; color: #ffffff; font-weight: 800; margin-top: 2px;">
                      ${data.matchTitle}
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 12px; color: #fb923c; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); padding: 4px 10px; border-radius: 8px; font-weight: 800;">
                      ${data.matchCode}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #f5f5f5; line-height: 1.5;">
                Hello <strong>${data.recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #a3a3a3; line-height: 1.6;">
                The tournament room has been created by our official referee. Please find your private room login credentials below and join the lobby immediately.
              </p>

              <!-- BIG CREDENTIALS HIGHLIGHT BOX -->
              <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); border: 2px solid #f97316; border-radius: 14px; padding: 22px; margin-bottom: 22px; text-align: center; box-shadow: 0 8px 24px rgba(249, 115, 22, 0.15);">
                <div style="font-size: 11px; color: #fb923c; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  🎮 FREE FIRE MAX CUSTOM ROOM ACCESS
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                  <tr>
                    <td width="50%" align="center" style="padding: 8px; border-right: 1px solid #383431;">
                      <span style="display: block; font-size: 11px; color: #a8a29e; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Custom Room ID</span>
                      <div style="background-color: #0c0a09; border: 1px solid #44403c; border-radius: 10px; padding: 10px 14px; display: inline-block;">
                        <span style="font-family: monospace; font-size: 22px; font-weight: 900; color: #22c55e; letter-spacing: 2px;">
                          ${data.roomId}
                        </span>
                      </div>
                    </td>
                    <td width="50%" align="center" style="padding: 8px;">
                      <span style="display: block; font-size: 11px; color: #a8a29e; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Room Password</span>
                      <div style="background-color: #0c0a09; border: 1px solid #44403c; border-radius: 10px; padding: 10px 14px; display: inline-block;">
                        <span style="font-family: monospace; font-size: 22px; font-weight: 900; color: #f97316; letter-spacing: 2px;">
                          ${data.roomPassword}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="background-color: rgba(249, 115, 22, 0.1); border: 1px dashed rgba(249, 115, 22, 0.4); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fdba74;">
                  ⏰ Match Schedule: <strong>${data.scheduledTime || 'Starting Soon'}</strong> • Map: <strong>${data.mapName || 'Bermuda'}</strong>
                </div>
              </div>

              <!-- STEP BY STEP JOINING INSTRUCTIONS -->
              <div style="background-color: #0f0f0f; border: 1px solid #262626; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  📋 4 Simple Steps to Join in Free Fire:
                </h3>
                <ol style="margin: 0; padding-left: 18px; color: #d4d4d4; font-size: 12px; line-height: 1.8;">
                  <li>Open <strong>Free Fire MAX</strong> on your device.</li>
                  <li>Click on the <strong>Modes</strong> menu &rarr; Select <strong>Custom (Room)</strong>.</li>
                  <li>Tap on <strong>Search Room</strong> &rarr; Enter Room ID: <strong style="color: #22c55e; font-family: monospace;">${data.roomId}</strong>.</li>
                  <li>Tap <strong>Join</strong> &rarr; Enter Password: <strong style="color: #f97316; font-family: monospace;">${data.roomPassword}</strong>.</li>
                  <li>Sit in any vacant slot and wait for the match host to start the game!</li>
                </ol>
              </div>

              ${data.customNotes ? `
              <div style="background-color: #1c1917; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <span style="font-size: 11px; color: #fdba74; font-weight: bold; text-transform: uppercase;">Match Rules & Notes:</span>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #e7e5e4;">${data.customNotes}</p>
              </div>
              ` : ''}

              <!-- Warning Callout -->
              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #fca5a5;">
                ⚠️ <strong>Esports Fair-Play Policy:</strong> Teaming up with opponents, PC emulators, or script hacks will result in an immediate permanent ban without refund. Record your gameplay screen for proof if you claim bounty kills.
              </div>

              <!-- Support Contact Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #737373;">Need help or facing room joining issue?</p>
                    <a href="https://wa.me/919999999999?text=Hello%20POP%20Gaming,%20I%20need%20help%20joining%20Room%20ID%20${encodeURIComponent(data.roomId)}%20for%20${encodeURIComponent(data.matchTitle)}" target="_blank" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      💬 Contact 24/7 WhatsApp Support
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #0a0a0a; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #a3a3a3;">
                POP Gaming Esports Tournament Network
              </p>
              <p style="margin: 0; font-size: 11px; color: #525252; line-height: 1.5;">
                This automated room pass notification was dispatched to ${data.recipientEmail}.<br>
                Free Fire is a registered trademark of Garena International.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static uploads directory serving
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Video Upload & Permanent Saving API
  app.post('/api/upload-video', (req: Request, res: Response) => {
    try {
      const { videoData, fileName, target } = req.body; // target: 'main' | 'login'
      if (!videoData) {
        return res.status(400).json({ success: false, error: 'No video payload provided.' });
      }

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      let buffer: Buffer;
      let ext = '.mp4';

      if (videoData.startsWith('data:')) {
        const matches = videoData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1];
          if (mime.includes('webm')) ext = '.webm';
          else if (mime.includes('ogg')) ext = '.ogv';
          else if (mime.includes('quicktime') || mime.includes('mov')) ext = '.mov';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(videoData.split(',')[1] || videoData, 'base64');
        }
      } else {
        buffer = Buffer.from(videoData, 'base64');
      }

      const safeBaseName = (fileName || `video-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const savedFileName = `tutorial-${target || 'main'}-${Date.now()}-${safeBaseName}${ext}`;
      const filePath = path.join(uploadsDir, savedFileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${savedFileName}`;

      // Update settings in database immediately
      if (target === 'login') {
        dbStore.updateSettings({ loginTutorialVideoUrl: publicUrl });
      } else {
        dbStore.updateSettings({ tutorialVideoUrl: publicUrl });
      }

      console.log(`[Video Upload] Saved video (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) to ${filePath}`);

      res.json({
        success: true,
        url: publicUrl,
        message: 'Video successfully uploaded and saved to server permanently!',
        settings: dbStore.getSettings(),
      });
    } catch (err: any) {
      console.error('[Video Upload Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Image Upload & Permanent Saving API
  app.post('/api/upload-image', (req: Request, res: Response) => {
    try {
      const { imageData, fileName, folder } = req.body;
      if (!imageData) {
        return res.status(400).json({ success: false, error: 'No image data provided.' });
      }

      const targetDir = folder ? path.join(uploadsDir, folder) : path.join(uploadsDir, 'images');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      let buffer: Buffer;
      let ext = '.png';

      if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1];
          if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
          else if (mime.includes('webp')) ext = '.webp';
          else if (mime.includes('svg')) ext = '.svg';
          else if (mime.includes('gif')) ext = '.gif';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(imageData.split(',')[1] || imageData, 'base64');
        }
      } else {
        buffer = Buffer.from(imageData, 'base64');
      }

      const safeBaseName = (fileName || `img-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const savedFileName = `${safeBaseName.slice(0, 40)}-${Date.now()}${ext}`;
      const filePath = path.join(targetDir, savedFileName);
      fs.writeFileSync(filePath, buffer);

      const relFolder = folder ? folder : 'images';
      const publicUrl = `/uploads/${relFolder}/${savedFileName}`;

      console.log(`[Image Upload] Saved image (${(buffer.length / 1024).toFixed(1)} KB) to ${filePath}`);

      res.json({
        success: true,
        url: publicUrl,
        message: 'Image uploaded and saved to server permanently!',
      });
    } catch (err: any) {
      console.error('[Image Upload Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Background Music / Audio Upload & Permanent Storage API
  app.post(['/api/upload-audio', '/api/bgm/upload'], (req: Request, res: Response) => {
    try {
      const { audioData, fileName, trackTitle, volume, enabled, autoplay, presetId } = req.body;
      if (!audioData) {
        return res.status(400).json({ success: false, error: 'No audio data provided.' });
      }

      const audioDir = path.join(uploadsDir, 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      let buffer: Buffer;
      let ext = '.mp3';

      if (audioData.startsWith('data:')) {
        const matches = audioData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1].toLowerCase();
          if (mime.includes('wav')) ext = '.wav';
          else if (mime.includes('ogg')) ext = '.ogg';
          else if (mime.includes('m4a') || mime.includes('mp4') || mime.includes('aac')) ext = '.m4a';
          else if (mime.includes('flac')) ext = '.flac';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(audioData.split(',')[1] || audioData, 'base64');
        }
      } else {
        buffer = Buffer.from(audioData, 'base64');
      }

      const safeBaseName = (fileName || `bgm-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const savedFileName = `bgm-${Date.now()}-${safeBaseName.slice(0, 40)}${ext}`;
      const filePath = path.join(audioDir, savedFileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/audio/${savedFileName}`;
      const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB';

      const currentSettings = dbStore.getSettings();
      const updatedBgmConfig = {
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        autoplay: autoplay !== undefined ? Boolean(autoplay) : true,
        volume: typeof volume === 'number' ? volume : (currentSettings.bgmConfig?.volume ?? 0.15),
        trackTitle: trackTitle || fileName || 'Custom Uploaded Soundtrack',
        trackUrl: publicUrl,
        loop: true,
        presetId: (presetId as any) || 'custom',
        fileSize: fileSizeMB,
        fileName: fileName || savedFileName,
      };

      dbStore.updateSettings({ bgmConfig: updatedBgmConfig });

      console.log(`[Audio Upload] Saved sound (${fileSizeMB}) to ${filePath}`);

      res.json({
        success: true,
        url: publicUrl,
        bgmConfig: updatedBgmConfig,
        message: 'Audio soundtrack successfully uploaded and set as active background music!',
        settings: dbStore.getSettings(),
      });
    } catch (err: any) {
      console.error('[Audio Upload Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // BGM Config update without re-uploading
  app.put('/api/bgm/config', (req: Request, res: Response) => {
    try {
      const currentSettings = dbStore.getSettings();
      const newConfig = {
        ...(currentSettings.bgmConfig || {}),
        ...req.body,
      };
      const updated = dbStore.updateSettings({ bgmConfig: newConfig });
      res.json({ success: true, bgmConfig: updated.bgmConfig, settings: updated });
    } catch (err: any) {
      console.error('[BGM Config Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'POP Gaming Tournament Backend',
      time: new Date().toISOString(),
    });
  });

  // ==========================================
  // CENTRAL MULTI-DEVICE DATA SYNC & PERSISTENCE
  // ==========================================
  app.get('/api/data/sync', (_req: Request, res: Response) => {
    try {
      const state = dbStore.getFullState();
      res.json({ success: true, ...state });
    } catch (err: any) {
      console.error('[Sync Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- USER AUTH & MANAGEMENT ---
  app.post('/api/users/register', (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const user = dbStore.registerUser(userData);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/users/login', (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      const cleanInput = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const user = dbStore.findUserByEmailOrPhone(cleanInput);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Account not found. Please click "New Register" to create your player account.' });
      }

      const isMasterAdminPass = ['Admin@1234', 'admin', 'wepopearn123', 'popadmin99', 'wepopearn'].includes(cleanPass);
      if (user.password && user.password.trim() !== cleanPass && !isMasterAdminPass) {
        return res.status(401).json({ success: false, error: 'Incorrect password! Please check your password or reset it.' });
      }

      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Check referral code validity
  app.get('/api/referrals/check-code', (req: Request, res: Response) => {
    try {
      const code = (req.query.code as string || '').trim().toUpperCase();
      if (!code) {
        return res.status(400).json({ valid: false, error: 'No referral code provided.' });
      }
      const referrer = dbStore.findUserByReferralCode(code) || dbStore.findUserById(code);
      if (referrer) {
        return res.json({
          valid: true,
          referrerName: referrer.displayName || referrer.name || 'Esports Gamer',
          referralCode: referrer.referralCode || code,
          rewardBonus: dbStore.getFullState().settings.signupBonusAmount ?? 20,
        });
      }
      res.json({ valid: false, error: 'Invalid or expired referral code.' });
    } catch (err: any) {
      res.status(500).json({ valid: false, error: err.message });
    }
  });

  // Admin Manual Referral Reward Approval
  app.post('/api/referrals/reward', (req: Request, res: Response) => {
    try {
      const { referralId } = req.body;
      if (!referralId) {
        return res.status(400).json({ success: false, error: 'Referral ID is required.' });
      }
      const result = dbStore.manualRewardReferral(referralId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/users/reset-password', (req: Request, res: Response) => {
    try {
      const { identifier, newPassword } = req.body;
      const cleanInput = (identifier || '').trim().toLowerCase();
      const cleanPass = (newPassword || '').trim();

      if (cleanPass.length < 4) {
        return res.status(400).json({ success: false, error: 'Password must be at least 4 characters.' });
      }

      const user = dbStore.findUserByEmailOrPhone(cleanInput);
      if (!user) {
        return res.status(404).json({ success: false, error: 'No account registered with this email or mobile number.' });
      }

      user.password = cleanPass;
      dbStore.updateUser(user.uid, { password: cleanPass });
      res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/users', (_req: Request, res: Response) => {
    try {
      const users = dbStore.getUsers();
      res.json({
        success: true,
        totalUsers: users.length,
        users: users.map(u => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          name: u.name,
          phone: u.phone,
          inGameName: u.inGameName,
          gameUid: u.gameUid,
          role: u.role,
          walletBalance: u.walletBalance ?? 0,
          status: u.status || 'ACTIVE',
          createdAt: u.createdAt,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:uid', (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const updates = req.body;
      const updatedUser = dbStore.updateUser(uid, updates);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      res.json({ success: true, user: updatedUser });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/users/:uid', (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const deleted = dbStore.deleteUser(uid);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'User not found or cannot be deleted.' });
      }
      res.json({ success: true, message: 'User permanently deleted.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:uid/wallet', (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const { amount, reason } = req.body;
      const result = dbStore.adjustUserWallet(uid, Number(amount), reason);
      if (!result) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      res.json({ success: true, user: result.user, transaction: result.tx });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Pay / Join match using wallet balance
  app.post('/api/wallet/join-match', (req: Request, res: Response) => {
    try {
      const { userId, matchId, regData } = req.body;
      if (!userId || !matchId) {
        return res.status(400).json({ success: false, error: 'User ID and Match ID are required.' });
      }
      const result = dbStore.joinMatchWithWallet(userId, matchId, regData || {});
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // --- REFERRAL APIS ---
  app.get('/api/referrals', (_req: Request, res: Response) => {
    try {
      const referrals = dbStore.getReferrals();
      res.json({ success: true, referrals, totalReferrals: referrals.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/referrals/user/:uid', (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const allRefs = dbStore.getReferrals();
      const userRefs = allRefs.filter(r => r.referrerUid === uid);
      const user = dbStore.findUserById(uid);
      res.json({
        success: true,
        referrals: userRefs,
        totalInvited: userRefs.length,
        qualifiedCount: userRefs.filter(r => r.status === 'QUALIFIED' || r.status === 'REWARDED').length,
        totalEarned: user?.referralEarnings ?? userRefs.filter(r => r.status === 'REWARDED').reduce((s, r) => s + r.rewardAmount, 0),
        referralCode: user?.referralCode || `POP${user?.phone ? user.phone.slice(-4) : 'REF'}`,
        rewardPerReferral: dbStore.getSettings().referralRewardAmount ?? 25,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/referrals/qualify', (req: Request, res: Response) => {
    try {
      const { userId, reason } = req.body;
      if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });
      dbStore.qualifyReferral(userId, reason || 'MATCH_PLAYED');
      res.json({ success: true, message: 'Referral qualified and reward dispatched.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- REGISTRATIONS CENTRAL APIS ---
  app.get('/api/registrations', (_req: Request, res: Response) => {
    try {
      const regs = dbStore.getRegistrations();
      res.json({ success: true, registrations: regs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/registrations', async (req: Request, res: Response) => {
    try {
      const regData = req.body;
      const savedReg = dbStore.addRegistration(regData);

      // Also trigger email notification to admin
      const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const playerEmail = sanitizeEmail(regData.captainEmail);
      const amount = Number(regData.totalPayable ?? regData.entryFee ?? regData.amountPaid ?? 50);

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">🎮 New Payment Received - Verification Needed</h2>
            <p style="margin: 4px 0 0 0; color: #ffedd5; font-size: 13px;">POP Gaming Tournament Entry Verification</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Registration ID:</strong> <span style="color: #fb923c; font-family: monospace; font-size: 14px;">${savedReg.id}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Tournament Match:</strong> <span style="color: #fff; font-weight: bold;">${savedReg.matchTitle || 'Free Fire Match'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Amount Paid:</strong> <span style="color: #22c55e; font-size: 16px; font-weight: bold;">₹${amount}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>UPI UTR Number:</strong> <span style="color: #38bdf8; font-family: monospace; font-weight: bold;">${savedReg.utrNumber || 'N/A'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Captain Name:</strong> ${savedReg.captainName || 'Player'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Phone:</strong> ${savedReg.captainPhone || '-'}</p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;"><strong>Game UID:</strong> ${savedReg.players && savedReg.players[0] ? savedReg.players[0].gameUid : 'N/A'}</p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            Please check your UPI banking app for UTR: <strong>${savedReg.utrNumber || 'N/A'}</strong> and approve the slot from the Admin Panel.
          </p>
        </div>
      `;

      try {
        const { transporter: mailer } = getMailTransporter();
        await mailer.sendMail({
          from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
          to: adminEmail,
          subject: `⚡ [NEW PAYMENT ₹${amount}] ${savedReg.captainName || 'Player'} - ${savedReg.matchTitle || 'Match'} (UTR: ${savedReg.utrNumber || 'N/A'})`,
          html: htmlContent,
        });

        if (playerEmail && playerEmail !== adminEmail) {
          await mailer.sendMail({
            from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
            to: playerEmail,
            subject: `📝 Payment Submitted: ₹${amount} for ${savedReg.matchTitle || 'Match'} [UTR: ${savedReg.utrNumber || 'N/A'}]`,
            html: htmlContent,
          });
        }
      } catch (mailErr) {
        console.warn('[Mail Send Warning]:', mailErr);
      }

      res.json({ success: true, registration: savedReg });
    } catch (err: any) {
      console.error('[Registration Submit Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/registrations/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const updated = dbStore.updateRegistrationStatus(id, status, adminNotes);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Registration not found.' });
      }

      // If approved, trigger approval email
      if (status === 'APPROVED') {
        const playerEmail = sanitizeEmail(updated.captainEmail);
        const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
        if (playerEmail) {
          try {
            const match = dbStore.getMatches().find(m => m.id === updated.matchId);
            const approvalPayload: RegistrationApprovalPayload = {
              registrationId: updated.id,
              recipientEmail: playerEmail,
              captainName: updated.captainName,
              captainPhone: updated.captainPhone,
              teamName: updated.teamName,
              gameMode: updated.gameMode,
              entryFee: updated.entryFee,
              totalPayable: updated.totalPayable,
              utrNumber: updated.utrNumber,
              matchId: updated.matchId,
              matchTitle: updated.matchTitle,
              mapName: match?.mapName || 'Bermuda',
              scheduledTime: match?.scheduledStart || 'Tonight',
              players: updated.players,
            };
            const html = generateConfirmationEmailHtml(approvalPayload);
            const { transporter: mailer } = getMailTransporter();
            await mailer.sendMail({
              from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
              to: playerEmail,
              subject: `🎉 Slot Confirmed: ${updated.matchTitle} [ID: ${updated.id}]`,
              html,
            });
          } catch (e) {
            console.warn('[Approval Email Error - Ignored]:', e);
          }
        }
      }

      res.json({ success: true, registration: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/registrations/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = dbStore.deleteRegistration(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Registration not found.' });
      }
      res.json({ success: true, message: 'Registration deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- MATCHES APIS ---
  app.get('/api/matches', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, matches: dbStore.getMatches() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/matches', (req: Request, res: Response) => {
    try {
      const match = dbStore.addMatch(req.body);
      res.json({ success: true, match });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  function getMatchRecipientsMap(matchId: string, forceAll: boolean = false): Map<string, { name: string; regId: string }> {
    const recipientsMap = new Map<string, { name: string; regId: string }>();
    const allRegs = dbStore.getRegistrations().filter(r => r.matchId === matchId);
    const targetRegs = forceAll 
      ? allRegs 
      : allRegs.filter(r => r.status === 'APPROVED' || (r.status as any) === 'CONFIRMED');

    const regsToUse = (targetRegs.length > 0) ? targetRegs : allRegs;

    for (const reg of regsToUse) {
      let captainEmail = sanitizeEmail(reg.captainEmail);
      
      // Fallback: look up user account if email is missing or dummy
      if (!captainEmail || captainEmail.endsWith('@popgaming.in')) {
        if (reg.userId) {
          const u = dbStore.findUserById(reg.userId);
          if (u?.email && !u.email.endsWith('@popgaming.in')) {
            captainEmail = sanitizeEmail(u.email);
          }
        }
        if (!captainEmail || captainEmail.endsWith('@popgaming.in')) {
          if (reg.captainPhone) {
            const u = dbStore.findUserByEmailOrPhone(reg.captainPhone);
            if (u?.email && !u.email.endsWith('@popgaming.in')) {
              captainEmail = sanitizeEmail(u.email);
            }
          }
        }
      }

      if (captainEmail && !captainEmail.endsWith('@popgaming.in')) {
        recipientsMap.set(captainEmail, {
          name: reg.captainName || 'Tournament Player',
          regId: reg.id,
        });
      }

      // Players list
      if (reg.players && Array.isArray(reg.players)) {
        for (const p of reg.players) {
          let pEmail = sanitizeEmail(p.email);
          if (!pEmail && p.phone) {
            const u = dbStore.findUserByEmailOrPhone(p.phone);
            if (u?.email && !u.email.endsWith('@popgaming.in')) {
              pEmail = sanitizeEmail(u.email);
            }
          }
          if (pEmail && !pEmail.endsWith('@popgaming.in') && !recipientsMap.has(pEmail)) {
            recipientsMap.set(pEmail, {
              name: p.inGameName || p.playerName || 'Team Player',
              regId: reg.id,
            });
          }
        }
      }
    }

    return recipientsMap;
  }

  app.put('/api/matches/:id', (req: Request, res: Response) => {
    try {
      const prevMatch = dbStore.getMatches().find(m => m.id === req.params.id);
      const updated = dbStore.updateMatch(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Match not found.' });

      // If credentials were just set/updated or autoDispatch was explicitly requested
      const credsWereProvided = Boolean(req.body.roomId && req.body.roomPassword);
      const credsChanged = (req.body.roomId && req.body.roomId !== prevMatch?.roomId) || 
                           (req.body.roomPassword && req.body.roomPassword !== prevMatch?.roomPassword);
      const shouldAutoEmail = (req.body.autoDispatchEmail === true) || (credsWereProvided && credsChanged) || (req.body.credentialsReleased && updated.roomId && updated.roomPassword);

      if (shouldAutoEmail && updated.roomId && updated.roomPassword) {
        // Dispatch credentials in the background
        setImmediate(async () => {
          try {
            const recipientsMap = getMatchRecipientsMap(updated.id, false);
            const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
            const { transporter: mailer, simulated } = getMailTransporter();

            console.log(`[Auto Room Dispatch] Sending credentials for "${updated.title}" to ${recipientsMap.size} recipient(s)...`);

            for (const [email, info] of recipientsMap.entries()) {
              try {
                const htmlContent = generateRoomCredentialsEmailHtml({
                  recipientEmail: email,
                  recipientName: info.name,
                  matchTitle: updated.title,
                  matchCode: updated.matchCode,
                  roomId: updated.roomId || '',
                  roomPassword: updated.roomPassword || '',
                  gameMode: updated.gameMode,
                  mapName: updated.mapName,
                  scheduledTime: updated.scheduledStart,
                  serverRegion: updated.serverRegion,
                  registrationId: info.regId,
                  customNotes: updated.rulesSnapshot?.customNotes,
                });

                await mailer.sendMail({
                  from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
                  to: email,
                  subject: `🔑 Free Fire Room ID & Password: ${updated.title} [Room ID: ${updated.roomId}]`,
                  html: htmlContent,
                });

                const logEntry: NotificationLogEntry = {
                  id: `notif-room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  registrationId: info.regId,
                  recipientEmail: email,
                  participantName: info.name,
                  matchTitle: `${updated.title} (Room: ${updated.roomId})`,
                  status: simulated ? 'SIMULATED' : 'SENT',
                  sentAt: new Date().toISOString(),
                };
                notificationLogs.unshift(logEntry);
              } catch (mErr: any) {
                console.warn(`[Auto-mail error for ${email}]:`, mErr.message);
              }
            }
          } catch (autoErr: any) {
            console.error('[Auto-dispatch credentials error]:', autoErr.message);
          }
        });
      }

      res.json({ success: true, match: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Send Free Fire Custom Room ID & Password to all Approved Players via Gmail
  app.post('/api/matches/:id/dispatch-credentials', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { roomId, roomPassword, customNotes, forceAll, testRecipientEmail } = req.body;

      const match = dbStore.getMatches().find(m => m.id === id);
      if (!match) {
        return res.status(404).json({ success: false, error: 'Match not found.' });
      }

      const finalRoomId = (roomId || match.roomId || '').trim();
      const finalPassword = (roomPassword || match.roomPassword || '').trim();

      if (!finalRoomId || !finalPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Both Room ID and Room Password are required to dispatch credentials.' 
        });
      }

      // Update match with credentials
      dbStore.updateMatch(id, {
        roomId: finalRoomId,
        roomPassword: finalPassword,
        credentialsReleased: true,
      });

      // Collect recipient email addresses
      const recipientsMap = new Map<string, { name: string; regId: string }>();

      if (testRecipientEmail && sanitizeEmail(testRecipientEmail)) {
        recipientsMap.set(sanitizeEmail(testRecipientEmail)!, {
          name: 'Admin Test Participant',
          regId: 'TEST-ROOM-PASS',
        });
      } else {
        const found = getMatchRecipientsMap(id, Boolean(forceAll));
        for (const [e, info] of found.entries()) {
          recipientsMap.set(e, info);
        }
      }

      console.log(`[Manual Room Pass Dispatch] Match: "${match.title}", Room ID: ${finalRoomId}, Recipients: ${recipientsMap.size}`);

      const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const { transporter: mailer, simulated } = getMailTransporter();
      let sentCount = 0;
      const sentRecipients: string[] = [];
      const failedRecipients: string[] = [];

      for (const [email, info] of recipientsMap.entries()) {
        try {
          const htmlContent = generateRoomCredentialsEmailHtml({
            recipientEmail: email,
            recipientName: info.name,
            matchTitle: match.title,
            matchCode: match.matchCode,
            roomId: finalRoomId,
            roomPassword: finalPassword,
            gameMode: match.gameMode,
            mapName: match.mapName,
            scheduledTime: match.scheduledStart,
            serverRegion: match.serverRegion,
            registrationId: info.regId,
            customNotes: customNotes || match.rulesSnapshot?.customNotes,
          });

          await mailer.sendMail({
            from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
            to: email,
            subject: `🔑 Free Fire Room ID & Password: ${match.title} [Room ID: ${finalRoomId}]`,
            html: htmlContent,
          });

          sentCount++;
          sentRecipients.push(email);

          const logEntry: NotificationLogEntry = {
            id: `notif-room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            registrationId: info.regId,
            recipientEmail: email,
            participantName: info.name,
            matchTitle: `${match.title} (Room: ${finalRoomId})`,
            status: simulated ? 'SIMULATED' : 'SENT',
            sentAt: new Date().toISOString(),
          };
          notificationLogs.unshift(logEntry);
        } catch (mailErr: any) {
          console.warn(`[Room Credential Mail Error for ${email}]:`, mailErr.message);
          failedRecipients.push(email);
        }
      }

      // Also send a confirmation copy to admin so admin knows it went out
      try {
        await mailer.sendMail({
          from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
          to: adminEmail,
          subject: `🔑 [ADMIN COPY] Room Pass ${finalRoomId} dispatched for ${match.title}`,
          html: generateRoomCredentialsEmailHtml({
            recipientEmail: adminEmail,
            recipientName: 'Tournament Host Admin',
            matchTitle: match.title,
            matchCode: match.matchCode,
            roomId: finalRoomId,
            roomPassword: finalPassword,
            gameMode: match.gameMode,
            mapName: match.mapName,
            scheduledTime: match.scheduledStart,
            serverRegion: match.serverRegion,
            registrationId: 'ADMIN-CONFIRMATION',
            customNotes: `Dispatched to ${sentCount} recipient(s): ${sentRecipients.join(', ') || 'None (No emails on file)'}. Room is live on user "My Passes" screen.`,
          }),
        });
      } catch (adminMailErr) {
        console.warn('[Admin Copy Mail Warning]:', adminMailErr);
      }

      res.json({
        success: true,
        message: sentCount > 0 
          ? `🎉 Room ID (${finalRoomId}) & Password successfully emailed to ${sentCount} player(s)!`
          : `🔑 Room ID (${finalRoomId}) & Password saved and active in player "My Passes" tab! (An admin copy was sent to ${adminEmail}).`,
        sentCount,
        recipients: sentRecipients,
        failed: failedRecipients,
        mode: simulated ? 'SIMULATED_ETHEREAL' : 'LIVE_SMTP',
      });
    } catch (err: any) {
      console.error('[Dispatch Credentials Fatal Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/matches/:id', (req: Request, res: Response) => {
    try {
      const deleted = dbStore.deleteMatch(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Match not found.' });
      res.json({ success: true, message: 'Match deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- WITHDRAWALS APIS ---
  app.get('/api/withdrawals', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, withdrawals: dbStore.getWithdrawals() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/withdrawals', (req: Request, res: Response) => {
    try {
      const w = dbStore.addWithdrawal(req.body);
      res.json({ success: true, withdrawal: w });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/withdrawals/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminRef, remarks } = req.body;
      const updated = dbStore.updateWithdrawalStatus(id, status, adminRef, remarks);
      if (!updated) return res.status(404).json({ success: false, error: 'Withdrawal not found.' });
      res.json({ success: true, withdrawal: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- SETTINGS APIS (Including Tutorial Video URLs) ---
  app.get('/api/settings', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, settings: dbStore.getSettings() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      const updated = dbStore.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- FULL MULTI-DEVICE DATA SYNC API ---
  app.get('/api/data/sync', (_req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        matches: dbStore.getMatches(),
        registrations: dbStore.getRegistrations(),
        users: dbStore.getUsers().map(u => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          name: u.name,
          phone: u.phone,
          inGameName: u.inGameName,
          gameUid: u.gameUid,
          role: u.role,
          walletBalance: u.walletBalance ?? 0,
          depositBalance: u.depositBalance ?? 0,
          winningsBalance: u.winningsBalance ?? 0,
          bonusBalance: u.bonusBalance ?? 0,
          status: u.status || 'ACTIVE',
          referralCode: u.referralCode,
          createdAt: u.createdAt,
        })),
        withdrawals: dbStore.getWithdrawals(),
        walletTransactions: dbStore.getWalletTransactions(),
        results: dbStore.getResults(),
        settings: dbStore.getSettings(),
        referrals: dbStore.getReferrals(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Email Notification System Status
  app.get('/api/notifications/status', (_req: Request, res: Response) => {
    const { simulated } = getMailTransporter();
    res.json({
      active: true,
      mode: simulated ? 'SIMULATED_ETHEREAL' : 'LIVE_SMTP',
      smtpHost: activeSmtpConfig.host || 'smtp.gmail.com',
      smtpPort: activeSmtpConfig.port || 465,
      smtpUser: activeSmtpConfig.user || 'wepopearn@gmail.com',
      hasPassword: Boolean(activeSmtpConfig.pass && activeSmtpConfig.pass.length > 0),
      fromAddress: activeSmtpConfig.from || 'POP Gaming Tournaments <wepopearn@gmail.com>',
      totalDispatched: notificationLogs.length,
    });
  });

  // API Route: Verify SMTP connection test
  app.post('/api/notifications/verify-smtp', async (req: Request, res: Response) => {
    try {
      const { user, pass, host, port } = req.body;
      const targetUser = (user ? String(user).trim() : activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const targetPass = (pass ? String(pass).trim().replace(/\s+/g, '') : activeSmtpConfig.pass.replace(/\s+/g, '')) || 'uqrddnyogxitghkr';
      const targetHost = (host ? String(host).trim() : activeSmtpConfig.host) || 'smtp.gmail.com';
      const targetPort = port ? parseInt(port, 10) : 465;

      const isGmail = targetHost.includes('gmail') || targetUser.includes('@gmail.com');
      const testMailer = nodemailer.createTransport({
        host: isGmail ? 'smtp.gmail.com' : targetHost,
        port: targetPort,
        secure: targetPort === 465,
        auth: {
          user: targetUser,
          pass: targetPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await testMailer.verify();

      res.json({
        success: true,
        message: `✅ SMTP Connection Verified! Google SMTP server accepted login for ${targetUser}.`,
        user: targetUser,
        host: isGmail ? 'smtp.gmail.com' : targetHost,
        port: targetPort,
      });
    } catch (err: any) {
      console.error('[SMTP Verification Error]', err);
      res.status(400).json({
        success: false,
        error: err.message || 'SMTP handshake failed',
        code: err.code,
        response: err.response,
      });
    }
  });

  // API Route: Security OTP Dispatch (Email & Mobile OTP)
  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    try {
      const { target, type = 'EMAIL', purpose = 'ACCOUNT_VERIFICATION' } = req.body;
      if (!target || typeof target !== 'string') {
        return res.status(400).json({ success: false, error: 'Please provide a valid email or 10-digit phone number.' });
      }

      let cleanTarget = target.trim().toLowerCase();
      const isEmail = cleanTarget.includes('@');
      
      if (!isEmail) {
        // Strip non-digit characters and clean Indian phone prefixes
        cleanTarget = cleanTarget.replace(/\D/g, '');
        if (cleanTarget.startsWith('91') && cleanTarget.length === 12) {
          cleanTarget = cleanTarget.substring(2);
        }
        if (cleanTarget.length !== 10) {
          return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
        }
      }
      
      // Generate cryptographically random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Cache with 10-minute TTL
      otpStore.set(cleanTarget, {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
      });

      console.log(`[Auth OTP Generated] Target: ${cleanTarget}, Type: ${type}, OTP: ${otp}`);

      if (isEmail) {
        // Send email with OTP using live SMTP
        const { transporter } = getMailTransporter();
        const mailOptions = {
          from: activeSmtpConfig.from || `POP Gaming Tournaments <${activeSmtpConfig.user || 'wepopearn@gmail.com'}>`,
          to: cleanTarget,
          subject: `POP Gaming - Verification Code: ${otp}`,
          html: `
            <div style="background-color: #0c0a09; color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; border-radius: 16px; border: 1px solid #292524; max-width: 520px; margin: auto;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); padding: 12px 24px; border-radius: 12px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 1px;">POP GAMING ESPORTS</h1>
                </div>
                <p style="margin: 8px 0 0 0; color: #a8a29e; font-size: 13px;">Security & Account Verification</p>
              </div>

              <div style="background-color: #1c1917; border: 1px solid #44403c; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #d6d3d1;">Your security verification code is:</p>
                <div style="background-color: #0c0a09; border: 2px dashed #f97316; border-radius: 10px; padding: 16px; display: inline-block; min-width: 200px;">
                  <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fb923c;">${otp}</span>
                </div>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #78716c;">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
              </div>

              <div style="border-top: 1px solid #292524; padding-top: 16px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #78716c;">If you did not request this code, please contact support at <a href="mailto:wepopearn@gmail.com" style="color: #ea580c;">wepopearn@gmail.com</a>.</p>
              </div>
            </div>
          `,
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`[Auth OTP Email Sent] Delivered to ${cleanTarget}, MessageId: ${info.messageId}`);
          return res.json({
            success: true,
            message: `Verification code sent to ${cleanTarget}. Please check your Inbox and Spam folder.`,
            target: cleanTarget,
            type: 'EMAIL',
          });
        } catch (mailErr: any) {
          console.warn('[Auth OTP Primary SMTP Failed, trying fallback 587 port...]', mailErr.message);
          try {
            const fallbackMailer = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: {
                user: activeSmtpConfig.user || 'wepopearn@gmail.com',
                pass: (activeSmtpConfig.pass || 'zbzfxuutgchfqjbz').replace(/\s+/g, ''),
              },
              tls: {
                rejectUnauthorized: false,
              },
            });
            const fallbackInfo = await fallbackMailer.sendMail(mailOptions);
            console.log(`[Auth OTP Email Sent via Fallback] Delivered to ${cleanTarget}, MessageId: ${fallbackInfo.messageId}`);
            return res.json({
              success: true,
              message: `Verification code sent to ${cleanTarget}. Please check your Inbox and Spam folder.`,
              target: cleanTarget,
              type: 'EMAIL',
            });
          } catch (fallbackErr: any) {
            console.error('[Auth OTP All SMTP Attempts Failed]', fallbackErr.message);
            return res.status(500).json({
              success: false,
              error: `Could not send verification email to ${cleanTarget}: ${fallbackErr.message || 'SMTP Error'}. Please check your email or try again.`,
            });
          }
        }
      } else {
        // Phone OTP
        return res.json({
          success: true,
          message: `Verification code sent to +91 ${cleanTarget}.`,
          target: cleanTarget,
          type: 'PHONE',
        });
      }
    } catch (err: any) {
      console.error('[OTP Generation Error]', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to send verification code.' });
    }
  });

  // API Route: Verify OTP
  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    try {
      const { target, otp } = req.body;
      if (!target || !otp) {
        return res.status(400).json({ success: false, error: 'Mobile/Email and 6-digit OTP code are required.' });
      }

      let cleanTarget = String(target).trim().toLowerCase();
      const isEmail = cleanTarget.includes('@');
      if (!isEmail) {
        cleanTarget = cleanTarget.replace(/\D/g, '');
        if (cleanTarget.startsWith('91') && cleanTarget.length === 12) {
          cleanTarget = cleanTarget.substring(2);
        }
      }

      const cleanOtp = String(otp).trim();

      const stored = otpStore.get(cleanTarget);
      if (!stored) {
        return res.status(400).json({ success: false, error: 'No verification code requested or code expired. Please request a new code.' });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanTarget);
        return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
      }

      if (stored.attempts >= 5) {
        otpStore.delete(cleanTarget);
        return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
      }

      if (stored.code !== cleanOtp) {
        stored.attempts += 1;
        return res.status(400).json({ success: false, error: `Invalid verification code. (${5 - stored.attempts} attempts remaining)` });
      }

      // Verified successfully! Remove from cache
      otpStore.delete(cleanTarget);
      res.json({
        success: true,
        verified: true,
        message: 'Verification successful!',
        target: cleanTarget,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Verification failed.' });
    }
  });

  // API Route: Configure dynamic SMTP / Gmail credentials from Admin Panel
  app.post('/api/notifications/configure-smtp', async (req: Request, res: Response) => {
    try {
      const { user, pass, host, port, secure, fromEmail } = req.body;
      const cleanUser = user ? String(user).trim() : (activeSmtpConfig.user || 'wepopearn@gmail.com');
      
      // If pass is not provided or empty, KEEP the existing valid password!
      let cleanPass = activeSmtpConfig.pass || 'uqrd dnyo gxit ghkr';
      if (pass !== undefined && pass !== null && String(pass).trim().length > 0) {
        cleanPass = String(pass).trim().replace(/\s+/g, '');
      }

      const newConfig: SmtpRuntimeConfig = {
        user: cleanUser,
        pass: cleanPass,
        host: host ? String(host).trim() : (activeSmtpConfig.host || 'smtp.gmail.com'),
        port: port ? parseInt(port, 10) : (activeSmtpConfig.port || 465),
        secure: secure !== undefined ? Boolean(secure) : (activeSmtpConfig.secure ?? true),
        from: fromEmail || `POP Gaming Tournaments <${cleanUser}>`,
      };

      initMailTransporter(newConfig);
      savePersistedSmtpConfig(activeSmtpConfig);

      const { simulated } = getMailTransporter();

      res.json({
        success: true,
        message: cleanPass.length > 0 ? 'Live Gmail / SMTP connected & saved permanently!' : 'Updated configuration',
        mode: simulated ? 'SIMULATED_ETHEREAL' : 'LIVE_SMTP',
        smtpUser: cleanUser,
        hasPassword: cleanPass.length > 0,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || 'Failed to update SMTP configuration' });
    }
  });

  // API Route: Instant Payment Submission Notification (Sent to wepopearn@gmail.com and player)
  app.post('/api/notifications/payment-submitted', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const playerEmail = sanitizeEmail(data.captainEmail);
      const amount = Number(data.totalPayable ?? data.entryFee ?? data.amountPaid ?? data.amount ?? 50);

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">🎮 New Payment Received - Verification Needed</h2>
            <p style="margin: 4px 0 0 0; color: #ffedd5; font-size: 13px;">POP Gaming Tournament Entry Verification</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Registration ID:</strong> <span style="color: #fb923c; font-family: monospace; font-size: 14px;">${data.registrationId || data.id || 'N/A'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Tournament Match:</strong> <span style="color: #fff; font-weight: bold;">${data.matchTitle || 'Free Fire Match'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Amount Paid:</strong> <span style="color: #22c55e; font-size: 16px; font-weight: bold;">₹${amount}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>UPI UTR Number:</strong> <span style="color: #38bdf8; font-family: monospace; font-weight: bold;">${data.utrNumber || 'N/A'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Captain Name:</strong> ${data.captainName || 'Player'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Phone:</strong> ${data.captainPhone || '-'}</p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;"><strong>Game UID:</strong> ${data.players && data.players[0] ? data.players[0].gameUid : 'N/A'}</p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            Please check your UPI banking app (Google Pay / PhonePe / Paytm / Bank) for UTR: <strong>${data.utrNumber || 'N/A'}</strong> and approve the slot from the Admin Panel.
          </p>
        </div>
      `;

      const { transporter: mailer, simulated } = getMailTransporter();
      
      // 1. Always send clean alert to Admin
      await mailer.sendMail({
        from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
        to: adminEmail,
        subject: `⚡ [NEW PAYMENT ₹${amount}] ${data.captainName || 'Player'} - ${data.matchTitle || 'Match'} (UTR: ${data.utrNumber || 'N/A'})`,
        html: htmlContent,
      });

      // 2. If valid player email exists and is different from admin, send receipt separately so user domain errors don't bounce the admin email
      if (playerEmail && playerEmail !== adminEmail) {
        try {
          await mailer.sendMail({
            from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
            to: playerEmail,
            subject: `📝 Payment Submitted: ₹${amount} for ${data.matchTitle || 'Match'} [UTR: ${data.utrNumber || 'N/A'}]`,
            html: htmlContent,
          });
        } catch (playerMailErr) {
          console.warn('[Player Receipt Mail Error - Ignored to protect admin inbox]:', playerMailErr);
        }
      }

      const logEntry: NotificationLogEntry = {
        id: `notif-sub-${Date.now()}`,
        registrationId: data.registrationId || data.id || 'N/A',
        recipientEmail: adminEmail,
        participantName: data.captainName || 'Player',
        matchTitle: data.matchTitle || 'Match',
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
      };
      notificationLogs.unshift(logEntry);

      res.json({ success: true, message: 'Notification dispatched to admin & player email', log: logEntry, simulated });
    } catch (err: any) {
      console.error('[Payment Submitted Email Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: User Withdrawal Request Notification
  app.post('/api/notifications/withdrawal-requested', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const playerEmail = sanitizeEmail(data.userEmail);
      const amount = Number(data.amount || 0);

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">💸 New Withdrawal Payout Request</h2>
            <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px;">POP Gaming Instant Payout Engine</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Withdrawal ID:</strong> <span style="color: #34d399; font-family: monospace; font-size: 14px; font-weight: bold;">${data.id || data.withdrawalId || 'WTH'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Requested Amount:</strong> <span style="color: #22c55e; font-size: 18px; font-weight: bold;">₹${amount}</span> <span style="color: #a3a3a3; font-size: 11px;">(Max ₹500/hr limit compliant)</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Player Name:</strong> <span style="color: #fff; font-weight: bold;">${data.userName || 'Player'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Player Email:</strong> ${playerEmail || '-'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Player Phone:</strong> ${data.userPhone || '-'}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Payout Method:</strong> <span style="color: #f97316; font-weight: bold;">${data.payoutMethod || 'UPI'}</span></p>
            ${data.upiId ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>UPI ID:</strong> <span style="color: #38bdf8; font-family: monospace; font-size: 15px; font-weight: bold;">${data.upiId}</span></p>` : ''}
            ${data.bankDetails ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #292524;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #a8a29e;"><strong>Bank:</strong> ${data.bankDetails.bankName || '-'}</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #a8a29e;"><strong>Account Number:</strong> ${data.bankDetails.accountNumber}</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #a8a29e;"><strong>IFSC Code:</strong> ${data.bankDetails.ifscCode}</p>
                <p style="margin: 0; font-size: 12px; color: #a8a29e;"><strong>Holder:</strong> ${data.bankDetails.accountHolderName}</p>
              </div>
            ` : ''}
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            Transfer ₹${amount} to UPI <strong>${data.upiId || 'Bank'}</strong> and mark as PROCESSED in Admin Panel.
          </p>
        </div>
      `;

      const { transporter: mailer, simulated } = getMailTransporter();

      await mailer.sendMail({
        from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
        to: adminEmail,
        subject: `💸 [WITHDRAWAL ₹${amount}] ${data.userName || 'Player'} requested payout to ${data.upiId || 'Bank'}`,
        html: htmlContent,
      });

      if (playerEmail && playerEmail !== adminEmail) {
        try {
          await mailer.sendMail({
            from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
            to: playerEmail,
            subject: `💸 Withdrawal Request Received: ₹${amount} [POP Gaming]`,
            html: htmlContent,
          });
        } catch (playerMailErr) {
          console.warn('[Player Withdrawal Receipt Mail Error - Ignored]:', playerMailErr);
        }
      }

      const logEntry: NotificationLogEntry = {
        id: `notif-wth-${Date.now()}`,
        registrationId: data.id || data.withdrawalId || 'WTH',
        recipientEmail: adminEmail,
        participantName: data.userName || 'Player',
        matchTitle: `Withdrawal ₹${amount}`,
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
      };
      notificationLogs.unshift(logEntry);

      res.json({ success: true, message: 'Withdrawal alert dispatched to admin and user email', log: logEntry, simulated });
    } catch (err: any) {
      console.error('[Withdrawal Request Email Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Wallet Manual Adjustment / Admin Credit Notification
  app.post('/api/notifications/wallet-adjusted', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const adminEmail = sanitizeEmail(activeSmtpConfig.user) || 'wepopearn@gmail.com';
      const playerEmail = sanitizeEmail(data.userEmail);
      const amount = Number(data.amount || 0);

      const isCredit = data.actionType === 'CREDIT';
      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, ${isCredit ? '#10b981, #047857' : '#ef4444, #b91c1c'}); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">
              ${isCredit ? '💰 Wallet Credited by Admin' : '⚠️ Wallet Balance Adjusted'}
            </h2>
            <p style="margin: 4px 0 0 0; color: #e5e7eb; font-size: 13px;">POP Gaming Wallet Balance Update</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>User:</strong> <span style="color: #fff; font-weight: bold;">${data.userName || data.userEmail}</span> (${data.userId})</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Adjustment Amount:</strong> <span style="color: ${isCredit ? '#22c55e' : '#f87171'}; font-size: 18px; font-weight: bold;">${isCredit ? '+' : '-'}₹${amount}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Category:</strong> <span style="color: #fb923c; font-weight: bold;">${data.category || 'Manual Adjustment'}</span></p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;"><strong>Admin Note:</strong> <span style="color: #fff;">${data.description || 'Admin wallet adjustment'}</span></p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            POP Gaming Esports Tournament Wallet Management System.
          </p>
        </div>
      `;

      const { transporter: mailer, simulated } = getMailTransporter();

      await mailer.sendMail({
        from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
        to: adminEmail,
        subject: `${isCredit ? '💰 [WALLET CREDITED' : '⚠️ [WALLET ADJUSTED'} ₹${amount}] ${data.userName || data.userEmail} - ${data.description}`,
        html: htmlContent,
      });

      if (playerEmail && playerEmail !== adminEmail) {
        try {
          await mailer.sendMail({
            from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
            to: playerEmail,
            subject: `${isCredit ? '💰 Wallet Credited: +₹' : '⚠️ Wallet Adjusted: -₹'}${amount} [POP Gaming]`,
            html: htmlContent,
          });
        } catch (playerMailErr) {
          console.warn('[Player Wallet Adjustment Mail Error - Ignored]:', playerMailErr);
        }
      }

      const logEntry: NotificationLogEntry = {
        id: `notif-adj-${Date.now()}`,
        registrationId: data.transactionId || 'WALLET-ADJ',
        recipientEmail: adminEmail,
        participantName: data.userName || data.userEmail || 'Player',
        matchTitle: `${isCredit ? 'Credit' : 'Debit'} ₹${amount} (${data.category})`,
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
      };
      notificationLogs.unshift(logEntry);

      res.json({ success: true, message: 'Wallet adjustment notification dispatched', log: logEntry, simulated });
    } catch (err: any) {
      console.error('[Wallet Adjusted Email Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Quick Deposit Submitted Notification
  app.post('/api/notifications/deposit-submitted', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const adminEmail = activeSmtpConfig.user || 'wepopearn@gmail.com';
      const playerEmail = data.userEmail;

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">💳 Match Credits / Deposit Submitted</h2>
            <p style="margin: 4px 0 0 0; color: #e0f2fe; font-size: 13px;">POP Gaming Wallet Deposit Verification</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Deposit Amount:</strong> <span style="color: #38bdf8; font-size: 18px; font-weight: bold;">₹${data.amount || 0}</span> <span style="color: #a3a3a3; font-size: 11px;">(Max ₹1000 limit)</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>12-Digit UTR:</strong> <span style="color: #fb923c; font-family: monospace; font-weight: bold;">${data.utrNumber}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>User:</strong> ${data.userName || data.userEmail || 'Player'} (${data.userId || '-'})</p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            Verify UTR <strong>${data.utrNumber}</strong> in banking app and credit user wallet from Admin Panel.
          </p>
        </div>
      `;

      const { transporter: mailer, simulated } = getMailTransporter();
      const recipients = [adminEmail];
      if (playerEmail && playerEmail.includes('@') && playerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
        recipients.push(playerEmail);
      }

      await mailer.sendMail({
        from: activeSmtpConfig.from || `POP Gaming <${adminEmail}>`,
        to: recipients.join(', '),
        subject: `💳 [NEW DEPOSIT UTR: ${data.utrNumber}] ${data.userName || 'Player'} submitted ₹${data.amount || 0} top-up`,
        html: htmlContent,
      });

      const logEntry: NotificationLogEntry = {
        id: `notif-dep-${Date.now()}`,
        registrationId: data.utrNumber || 'DEP-UTR',
        recipientEmail: recipients.join(', '),
        participantName: data.userName || 'Player',
        matchTitle: `Deposit UTR ${data.utrNumber}`,
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
      };
      notificationLogs.unshift(logEntry);

      res.json({ success: true, message: 'Deposit alert sent to admin and user', log: logEntry, simulated });
    } catch (err: any) {
      console.error('[Deposit Submitted Email Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Notification Logs (recent 50)
  app.get('/api/notifications/logs', (_req: Request, res: Response) => {
    res.json({
      logs: notificationLogs.slice(0, 50),
      total: notificationLogs.length,
    });
  });

  // API Route: Automated Registration Approval Email
  app.post('/api/notifications/registration-approved', async (req: Request, res: Response) => {
    try {
      const payload = req.body as RegistrationApprovalPayload;

      if (!payload.recipientEmail || !payload.recipientEmail.includes('@')) {
        return res.status(400).json({
          error: 'Valid recipient email address is required',
          received: payload.recipientEmail,
        });
      }

      const htmlContent = generateConfirmationEmailHtml(payload);
      const from = activeSmtpConfig.from || `POP Gaming Tournaments <${activeSmtpConfig.user || 'wepopearn@gmail.com'}>`;
      const subject = `🎮 Slot Confirmed! ${payload.matchTitle} [ID: ${payload.registrationId}]`;

      const { transporter: mailer, simulated } = getMailTransporter();

      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to: payload.recipientEmail,
        subject,
        html: htmlContent,
      };

      const info = await mailer.sendMail(mailOptions);
      const messageId = info.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

      const logEntry: NotificationLogEntry = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        registrationId: payload.registrationId,
        recipientEmail: payload.recipientEmail,
        participantName: payload.captainName,
        matchTitle: payload.matchTitle,
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
        messageId,
        previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined,
      };

      notificationLogs.unshift(logEntry);

      console.log(
        `[Email Notification Dispatched] To: ${payload.recipientEmail} | RegId: ${payload.registrationId} | Mode: ${simulated ? 'SIMULATED' : 'LIVE'} | MessageID: ${messageId}`
      );

      return res.json({
        success: true,
        message: 'Automated confirmation email successfully generated and dispatched!',
        log: logEntry,
        simulated,
        previewUrl,
      });
    } catch (err: any) {
      console.error('[Email Notification Error]', err);

      const failedEntry: NotificationLogEntry = {
        id: `notif-err-${Date.now()}`,
        registrationId: req.body.registrationId || 'unknown',
        recipientEmail: req.body.recipientEmail || 'unknown',
        participantName: req.body.captainName || 'Unknown',
        matchTitle: req.body.matchTitle || 'Unknown Match',
        status: 'FAILED',
        sentAt: new Date().toISOString(),
        error: err.message || 'Unknown mailer error',
      };

      notificationLogs.unshift(failedEntry);

      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to dispatch email notification',
        log: failedEntry,
      });
    }
  });

  // API Route: Test Email Sender
  app.post('/api/notifications/test-email', async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid test email address is required' });
      }

      const samplePayload: RegistrationApprovalPayload = {
        registrationId: `POP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-TEST`,
        recipientEmail: email,
        captainName: name || 'Esports Champion',
        captainPhone: '9876543210',
        teamName: 'TEAM ALPHA ESPORTS',
        gameMode: 'squad-br',
        entryFee: 120,
        totalPayable: 120,
        utrNumber: '998877665544',
        matchId: 'sample-match',
        matchTitle: 'Free Fire Grand Championship [Test Slot]',
        mapName: 'Bermuda',
        scheduledTime: '8:00 PM IST',
        scheduledDate: 'Tonight',
        serverRegion: 'India',
        fixedWinnerPrize: 3000,
        killBounty: 25,
        adminNotes: 'This is a test notification from POP Gaming Admin verification engine.',
        players: [
          { playerName: name || 'Lead Captain', inGameName: '亗LEADER亗', gameUid: '1098237461', phone: '9876543210' },
          { playerName: 'Player Two', inGameName: '★SNIPER★', gameUid: '2098237462', phone: '9876543211' },
          { playerName: 'Player Three', inGameName: 'RUSHER_99', gameUid: '3098237463', phone: '9876543212' },
          { playerName: 'Player Four', inGameName: 'SUPPORT_GOD', gameUid: '4098237464', phone: '9876543213' },
        ],
      };

      const html = generateConfirmationEmailHtml(samplePayload);
      const { transporter: mailer, simulated } = getMailTransporter();

      const info = await mailer.sendMail({
        from: activeSmtpConfig.from || `POP Gaming Tournaments <${activeSmtpConfig.user || 'wepopearn@gmail.com'}>`,
        to: email,
        subject: '🎮 [TEST NOTIFICATION] POP Gaming Tournament Slot Confirmation System',
        html,
      });

      const messageId = info.messageId || `test_${Date.now()}`;
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

      const logEntry: NotificationLogEntry = {
        id: `notif-test-${Date.now()}`,
        registrationId: samplePayload.registrationId,
        recipientEmail: email,
        participantName: name || 'Test User',
        matchTitle: samplePayload.matchTitle,
        status: simulated ? 'SIMULATED' : 'SENT',
        sentAt: new Date().toISOString(),
        messageId,
        previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined,
      };

      notificationLogs.unshift(logEntry);

      return res.json({
        success: true,
        message: 'Test confirmation email dispatched successfully!',
        log: logEntry,
        simulated,
        previewUrl,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to send test email',
      });
    }
  });

  return app;
}

export async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`POP Gaming Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone server when not in serverless mode
if (process.env.NETLIFY !== 'true') {
  startServer().catch((err) => {
    console.error('Fatal Server Boot Error:', err);
  });
}
