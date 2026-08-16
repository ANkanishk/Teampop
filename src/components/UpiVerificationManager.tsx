import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Smartphone, 
  CreditCard, 
  FileText, 
  AlertCircle,
  Eye,
  X,
  Clock,
  Filter,
  ShieldCheck,
  Building,
  User,
  Hash,
  Mail,
  Send,
  RefreshCw
} from 'lucide-react';
import { Registration } from '../types';
import { useTournaments } from '../context/TournamentContext';

interface UpiVerificationManagerProps {
  registrations: Registration[];
  onApprove: (regId: string, remarks?: string) => void;
  onReject: (regId: string, remarks?: string) => void;
}

export const UpiVerificationManager: React.FC<UpiVerificationManagerProps> = ({
  registrations,
  onApprove,
  onReject,
}) => {
  const { resendApprovalEmail } = useTournaments();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; title: string; utr: string } | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [rejectModalReg, setRejectModalReg] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('UTR not found in bank statement');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

  const handleResendNotification = async (regId: string) => {
    setResendingId(regId);
    setResendStatus(null);
    try {
      const res = await resendApprovalEmail(regId);
      if (res.success) {
        setResendStatus({ id: regId, msg: 'Confirmation email dispatched successfully!' });
      } else {
        setResendStatus({ id: regId, msg: res.error || 'Failed to dispatch email', isError: true });
      }
    } catch (e: any) {
      setResendStatus({ id: regId, msg: e.message || 'Error sending email', isError: true });
    } finally {
      setResendingId(null);
      setTimeout(() => setResendStatus(null), 4000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const filtered = registrations.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.utrNumber.toLowerCase().includes(q) ||
        r.captainName.toLowerCase().includes(q) ||
        r.captainPhone.includes(q) ||
        r.matchTitle.toLowerCase().includes(q) ||
        (r.teamName && r.teamName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = registrations.filter((r) => r.status === 'REJECTED').length;

  return (
    <div id="upi-verification-manager" className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStatus('PENDING')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'PENDING' 
              ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10' 
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Pending Verifications</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{pendingCount}</p>
          <span className="text-[11px] text-neutral-400">Needs 12-digit UTR confirmation</span>
        </div>

        <div 
          onClick={() => setFilterStatus('APPROVED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'APPROVED' 
              ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10' 
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Approved & Confirmed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{approvedCount}</p>
          <span className="text-[11px] text-neutral-400">Credentials released to players</span>
        </div>

        <div 
          onClick={() => setFilterStatus('REJECTED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'REJECTED' 
              ? 'bg-red-500/15 border-red-500 shadow-lg shadow-red-500/10' 
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Rejected Requests</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{rejectedCount}</p>
          <span className="text-[11px] text-neutral-400">Flagged for mismatch / fake UTR</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {st} {st === 'PENDING' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search UTR, phone, name, reg ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Registrations List with Detailed Verification UI */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/60 border border-neutral-800 rounded-3xl text-neutral-400 space-y-2">
            <p className="text-sm font-semibold">No payment verification requests matching current criteria.</p>
            <p className="text-xs text-neutral-500">New player tournament bookings will appear here instantly in real-time.</p>
          </div>
        ) : (
          filtered.map((reg) => {
            const isPending = reg.status === 'PENDING';
            const isApproved = reg.status === 'APPROVED';
            const isRejected = reg.status === 'REJECTED';

            return (
              <div
                key={reg.id}
                id={`admin-upi-card-${reg.id}`}
                className={`p-5 rounded-3xl border transition-all duration-200 space-y-4 shadow-xl ${
                  isPending
                    ? 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border-amber-500/40'
                    : isApproved
                    ? 'bg-neutral-900/90 border-neutral-800'
                    : 'bg-neutral-900/70 border-red-500/20 opacity-80'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-orange-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                        {reg.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isRejected
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {reg.status}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        • {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white">
                      {reg.matchTitle}
                      {reg.teamName && <span className="text-orange-400 font-semibold ml-2">({reg.teamName})</span>}
                    </h3>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
                    <span className="text-lg font-black text-emerald-400">₹{reg.totalPayable}</span>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">UPI Amount</span>
                  </div>
                </div>

                {/* 3-Column Verification Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Payment Verification Card */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        Transaction Reference
                      </span>
                      <span className="text-[10px] text-neutral-500">Method: {reg.paymentMethod}</span>
                    </div>

                    <div className="flex items-center justify-between bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                      <span className="font-mono text-xs font-black text-white tracking-wider truncate mr-2">
                        {reg.utrNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(reg.utrNumber)}
                        className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedUtr === reg.utrNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUtr === reg.utrNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Screenshot Preview / Thumbnail */}
                    {reg.paymentScreenshotUrl ? (
                      <div className="pt-1">
                        <button
                          onClick={() =>
                            setSelectedScreenshot({
                              url: reg.paymentScreenshotUrl!,
                              title: `${reg.captainName} - ${reg.matchTitle}`,
                              utr: reg.utrNumber,
                            })
                          }
                          className="w-full py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Payment Receipt Screenshot</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic">No screenshot attached (Verify via UTR in UPI App).</p>
                    )}
                  </div>

                  {/* Column 2: Player Contact Details */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                    <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      Captain / Contact
                    </span>
                    <div>
                      <strong className="text-white text-xs block">{reg.captainName}</strong>
                      <p className="text-neutral-400 text-xs font-mono">{reg.captainPhone}</p>
                      {reg.captainEmail && <p className="text-neutral-500 text-[11px] truncate">{reg.captainEmail}</p>}
                    </div>
                  </div>

                  {/* Column 3: Registered Free Fire UIDs */}
                  <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                    <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-neutral-400">
                      <Hash className="w-3.5 h-3.5 text-orange-400" />
                      Free Fire UIDs ({reg.players.length})
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {reg.players.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-neutral-200 font-semibold truncate">{p.inGameName}</span>
                          <span className="text-neutral-500 font-mono ml-2">{p.gameUid}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                    {reg.adminNotes && (
                      <span>
                        Note: <strong className="text-neutral-300">{reg.adminNotes}</strong>
                      </span>
                    )}

                    {/* Email Notification Status Pill */}
                    {isApproved && (
                      <div className="flex items-center gap-1.5 ml-1">
                        {reg.emailNotificationSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                            <Mail className="w-3 h-3" />
                            Email Dispatched
                          </span>
                        ) : reg.emailNotificationError ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-[10px]">
                            <Mail className="w-3 h-3" />
                            Email Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                            <Mail className="w-3 h-3" />
                            Sending Email...
                          </span>
                        )}

                        {/* Resend Confirmation Email Button */}
                        <button
                          onClick={() => handleResendNotification(reg.id)}
                          disabled={resendingId === reg.id}
                          className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          title="Resend official slot confirmation email"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${resendingId === reg.id ? 'animate-spin' : ''}`} />
                          <span>{resendingId === reg.id ? 'Sending...' : 'Resend Email'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        onClick={() => onApprove(reg.id, 'Verified on Merchant UPI ledger.')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer transition transform active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Slot & Approve</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        onClick={() => setRejectModalReg(reg)}
                        className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Transaction</span>
                      </button>
                    )}
                  </div>
                </div>

                {resendStatus && resendStatus.id === reg.id && (
                  <div className={`mt-2 p-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    resendStatus.isError ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{resendStatus.msg}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SCREENSHOT FULLSCREEN MODAL */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">{selectedScreenshot.title}</h3>
                <p className="text-xs font-mono text-orange-400">UTR: {selectedScreenshot.utr}</p>
              </div>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-neutral-950 flex items-center justify-center p-2 border border-neutral-800">
              <img
                src={selectedScreenshot.url}
                alt="Payment Screenshot Receipt"
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-neutral-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Reject Payment Request</h3>
                <p className="text-xs text-neutral-400">Reg ID: {rejectModalReg.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-neutral-300">Select Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs"
              >
                <option value="UTR not found in bank statement">UTR not found in bank statement</option>
                <option value="Incorrect amount paid">Incorrect amount paid</option>
                <option value="Duplicate UTR submission">Duplicate / Re-used UTR</option>
                <option value="Unreadable screenshot">Unreadable screenshot</option>
                <option value="Lobby full before payment receipt">Lobby full before payment receipt</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectModalReg(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(rejectModalReg.id, rejectReason);
                  setRejectModalReg(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
