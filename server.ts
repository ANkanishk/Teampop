import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

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
  host: savedDiskConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: savedDiskConfig.port || parseInt(process.env.SMTP_PORT || '465', 10),
  secure: savedDiskConfig.secure !== undefined ? savedDiskConfig.secure : (process.env.SMTP_SECURE === 'false' ? false : true),
  user: savedDiskConfig.user || process.env.SMTP_USER || 'wepopearn@gmail.com',
  pass: savedDiskConfig.pass || process.env.SMTP_PASS || 'uqrd dnyo gxit ghkr',
  from: savedDiskConfig.from || process.env.SMTP_FROM || 'POP Gaming Tournaments <wepopearn@gmail.com>',
};

// Lazy transporter creation
let transporter: nodemailer.Transporter | null = null;
let isSimulated = false;

function initMailTransporter(config?: Partial<SmtpRuntimeConfig>): { transporter: nodemailer.Transporter; simulated: boolean } {
  if (config) {
    activeSmtpConfig = { ...activeSmtpConfig, ...config };
    transporter = null; // force re-creation
  }

  if (transporter) {
    return { transporter, simulated: isSimulated };
  }

  const { host, port, user, pass } = activeSmtpConfig;

  if (user && pass && pass.trim().length > 0) {
    try {
      // Clean app password for Gmail (stripping any accidental inner spaces)
      const cleanPass = pass.trim().replace(/\s+/g, '');
      
      // If host is Gmail, use nodemailer's built-in gmail service with TLS fallback
      if (host.includes('gmail') || user.includes('@gmail.com')) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: user.trim(),
            pass: cleanPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
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
      console.log(`[Email Engine] Connected Live SMTP for ${user} (service/host: ${host})`);
      return { transporter, simulated: false };
    } catch (e) {
      console.error('[Email Engine] Live SMTP failed, falling back to simulated mode', e);
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'POP Gaming Tournament Backend',
      time: new Date().toISOString(),
    });
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
      const adminEmail = activeSmtpConfig.user || 'wepopearn@gmail.com';
      const playerEmail = data.captainEmail;

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">🎮 New Payment Received - Verification Needed</h2>
            <p style="margin: 4px 0 0 0; color: #ffedd5; font-size: 13px;">POP Gaming Tournament Entry Verification</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Registration ID:</strong> <span style="color: #fb923c; font-family: monospace; font-size: 14px;">${data.registrationId || data.id}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Tournament Match:</strong> <span style="color: #fff; font-weight: bold;">${data.matchTitle}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Amount Paid:</strong> <span style="color: #22c55e; font-size: 16px; font-weight: bold;">₹${data.totalPayable || data.entryFee}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>UPI UTR Number:</strong> <span style="color: #38bdf8; font-family: monospace; font-weight: bold;">${data.utrNumber}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Captain Name:</strong> ${data.captainName}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Phone:</strong> ${data.captainPhone}</p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;"><strong>Game UID:</strong> ${data.players && data.players[0] ? data.players[0].gameUid : 'N/A'}</p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            Please check your UPI banking app (Google Pay / PhonePe / Paytm / Bank) for UTR: <strong>${data.utrNumber}</strong> and approve the slot from the Admin Panel.
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
        subject: `⚡ [NEW PAYMENT ₹${data.totalPayable || data.entryFee}] ${data.captainName} - ${data.matchTitle} (UTR: ${data.utrNumber})`,
        html: htmlContent,
      });

      const logEntry: NotificationLogEntry = {
        id: `notif-sub-${Date.now()}`,
        registrationId: data.registrationId || data.id || 'N/A',
        recipientEmail: recipients.join(', '),
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
      const adminEmail = activeSmtpConfig.user || 'wepopearn@gmail.com';
      const playerEmail = data.userEmail;

      const htmlContent = `
        <div style="background-color: #0c0a09; color: #f5f5f4; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #292524; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; text-transform: uppercase;">💸 New Withdrawal Payout Request</h2>
            <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px;">POP Gaming Instant Payout Engine</p>
          </div>

          <div style="background-color: #1c1917; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #44403c;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Withdrawal ID:</strong> <span style="color: #34d399; font-family: monospace; font-size: 14px; font-weight: bold;">${data.id || data.withdrawalId}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Requested Amount:</strong> <span style="color: #22c55e; font-size: 18px; font-weight: bold;">₹${data.amount}</span> <span style="color: #a3a3a3; font-size: 11px;">(Max ₹500/hr limit compliant)</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Player Name:</strong> <span style="color: #fff; font-weight: bold;">${data.userName || 'Player'}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Player Email:</strong> ${data.userEmail || '-'}</p>
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
            Transfer ₹${data.amount} to UPI <strong>${data.upiId || 'Bank'}</strong> and mark as PROCESSED in Admin Panel.
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
        subject: `💸 [WITHDRAWAL ₹${data.amount}] ${data.userName || 'Player'} requested payout to ${data.upiId || 'Bank'}`,
        html: htmlContent,
      });

      const logEntry: NotificationLogEntry = {
        id: `notif-wth-${Date.now()}`,
        registrationId: data.id || data.withdrawalId || 'WTH',
        recipientEmail: recipients.join(', '),
        participantName: data.userName || 'Player',
        matchTitle: `Withdrawal ₹${data.amount}`,
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
      const adminEmail = activeSmtpConfig.user || 'wepopearn@gmail.com';
      const playerEmail = data.userEmail;

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
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Adjustment Amount:</strong> <span style="color: ${isCredit ? '#22c55e' : '#f87171'}; font-size: 18px; font-weight: bold;">${isCredit ? '+' : '-'}₹${data.amount}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a8a29e;"><strong>Category:</strong> <span style="color: #fb923c; font-weight: bold;">${data.category || 'Manual Adjustment'}</span></p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;"><strong>Admin Note:</strong> <span style="color: #fff;">${data.description || 'Admin wallet adjustment'}</span></p>
          </div>

          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">
            POP Gaming Esports Tournament Wallet Management System.
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
        subject: `${isCredit ? '💰 [WALLET CREDITED' : '⚠️ [WALLET ADJUSTED'} ₹${data.amount}] ${data.userName || data.userEmail} - ${data.description}`,
        html: htmlContent,
      });

      const logEntry: NotificationLogEntry = {
        id: `notif-adj-${Date.now()}`,
        registrationId: data.transactionId || 'WALLET-ADJ',
        recipientEmail: recipients.join(', '),
        participantName: data.userName || data.userEmail || 'Player',
        matchTitle: `${isCredit ? 'Credit' : 'Debit'} ₹${data.amount} (${data.category})`,
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

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
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

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
