import { Registration, Match, NotificationLog } from '../types';

export interface DispatchEmailResult {
  success: boolean;
  message?: string;
  simulated?: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
  log?: NotificationLog;
}

/**
 * Dispatches an automated confirmation email to the participant when their registration is approved.
 */
export async function sendRegistrationApprovalNotification(
  registration: Registration,
  match?: Match,
  adminNotes?: string
): Promise<DispatchEmailResult> {
  const recipientEmail = registration.captainEmail || registration.players?.find(p => p.email)?.email;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn(`[NotificationService] No valid email provided for registration ${registration.id}. Skipping email dispatch.`);
    return {
      success: false,
      error: 'No email address registered for this participant.',
    };
  }

  try {
    const payload = {
      registrationId: registration.id,
      recipientEmail: recipientEmail.trim(),
      captainName: registration.captainName,
      captainPhone: registration.captainPhone,
      teamName: registration.teamName,
      gameMode: registration.gameMode,
      entryFee: registration.entryFee,
      totalPayable: registration.totalPayable,
      utrNumber: registration.utrNumber,
      matchId: registration.matchId,
      matchTitle: match ? match.title : registration.matchTitle,
      mapName: match?.mapName || 'Bermuda',
      scheduledTime: match?.scheduledStart || 'As scheduled in Lobby',
      scheduledDate: 'Today',
      serverRegion: match?.serverRegion || 'India',
      fixedWinnerPrize: match?.rewardConfig?.fixedWinnerPrize,
      adminNotes: adminNotes || registration.adminNotes,
      players: registration.players.map((p) => ({
        playerName: p.playerName,
        inGameName: p.inGameName,
        gameUid: p.gameUid,
        phone: p.phone,
      })),
    };

    const response = await fetch('/api/notifications/registration-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server rejected email dispatch request');
    }

    return {
      success: true,
      message: data.message,
      simulated: data.simulated,
      messageId: data.log?.messageId,
      previewUrl: data.previewUrl || data.log?.previewUrl,
      log: data.log,
    };
  } catch (err: any) {
    console.error('[NotificationService Error]', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email',
    };
  }
}

/**
 * Fetches recent email notification logs from backend
 */
export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
  try {
    const res = await fetch('/api/notifications/logs').catch(() => null);
    if (!res || !res.ok) return [];
    const data = await res.json().catch(() => ({ logs: [] }));
    return data.logs || [];
  } catch (e) {
    return [];
  }
}

/**
 * Triggers a test email notification from Admin Panel
 */
export async function sendTestEmailNotification(email: string, name: string): Promise<DispatchEmailResult> {
  try {
    const res = await fetch('/api/notifications/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Test email failed');
    return {
      success: true,
      message: data.message,
      simulated: data.simulated,
      previewUrl: data.previewUrl,
      log: data.log,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to send test email',
    };
  }
}
