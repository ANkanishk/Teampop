import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Building2, 
  Smartphone, 
  IndianRupee, 
  ShieldCheck, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { WithdrawalRequest } from '../types';

export const WithdrawalsManager: React.FC = () => {
  const { withdrawals, processWithdrawalRequest } = useTournaments();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PROCESSED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  // Modal form states
  const [adminRef, setAdminRef] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const matchesSearch = 
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userPhone.includes(searchTerm) ||
      (w.upiId && w.upiId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.userEmail && w.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const processedCount = withdrawals.filter((w) => w.status === 'PROCESSED' || w.status === 'APPROVED').length;
  const pendingAmount = withdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amount, 0);
  const processedAmount = withdrawals
    .filter((w) => w.status === 'PROCESSED' || w.status === 'APPROVED')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !modalAction) return;

    setIsProcessing(true);
    if (modalAction === 'APPROVE') {
      await processWithdrawalRequest(
        selectedWithdrawal.id,
        'PROCESSED',
        adminRef.trim() || `UPI-TXN-${Date.now()}`,
        adminRemarks.trim() || 'Payout transferred successfully.'
      );
    } else {
      await processWithdrawalRequest(
        selectedWithdrawal.id,
        'REJECTED',
        undefined,
        adminRemarks.trim() || 'Could not verify payment details.'
      );
    }
    setIsProcessing(false);
    setSelectedWithdrawal(null);
    setModalAction(null);
    setAdminRef('');
    setAdminRemarks('');
  };

  return (
    <div id="admin-withdrawals-manager" className="space-y-6">
      {/* Counters Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Pending Requests</span>
            <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Pending Amount</span>
            <div className="text-2xl font-black text-amber-400">₹{pendingAmount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Total Disbursed</span>
            <div className="text-2xl font-black text-emerald-400">₹{processedAmount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">Completed Payouts</span>
            <div className="text-2xl font-black text-emerald-400">{processedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Limits & Email Policy Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Enforced Limits:</strong> Max ₹500 Withdrawal per 1 Hour • Max ₹1,000 Deposit per Tx
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
            LIVE EMAIL DISPATCH ACTIVE
          </span>
          <span>User & Admin copy automatically sent upon approval</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'PROCESSED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by ID, Name, UPI, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {filteredWithdrawals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-2">
            <ArrowUpRight className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold text-neutral-300">No withdrawal requests match your filters</p>
          </div>
        ) : (
          filteredWithdrawals.map((wth) => (
            <div
              key={wth.id}
              className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-orange-400">{wth.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      wth.status === 'PROCESSED' || wth.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : wth.status === 'REJECTED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {wth.status === 'PROCESSED' ? 'PROCESSED / PAID' : wth.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-white">₹{wth.amount}</span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {new Date(wth.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {/* User Details & Payment Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Participant Info</span>
                  <p className="font-bold text-white text-sm">{wth.userName}</p>
                  <p className="text-neutral-400">Phone: <span className="font-mono text-neutral-200">{wth.userPhone}</span></p>
                  {wth.userEmail && (
                    <p className="text-neutral-400">Email: <span className="text-neutral-200">{wth.userEmail}</span></p>
                  )}
                </div>

                <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Payout Destination</span>
                  {wth.payoutMethod === 'UPI' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-orange-400" />
                        <span className="font-mono font-bold text-white text-sm">{wth.upiId}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(wth.upiId || '', `upi-${wth.id}`)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedField === `upi-${wth.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">Copy UPI</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>{wth.bankDetails?.bankName || 'Bank Transfer'}</span>
                      </div>
                      <p className="text-neutral-300">Name: <span className="font-bold text-white">{wth.bankDetails?.accountHolderName}</span></p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-neutral-200">A/C: {wth.bankDetails?.accountNumber}</p>
                        <p className="font-mono text-neutral-200">IFSC: {wth.bankDetails?.ifscCode}</p>
                      </div>
                    </div>
                  )}

                  {wth.adminTransactionRef && (
                    <p className="text-emerald-400 font-mono text-xs pt-1 border-t border-neutral-800">
                      Disbursed Ref: {wth.adminTransactionRef}
                    </p>
                  )}
                  {wth.adminRemarks && (
                    <p className="text-neutral-400 text-xs italic">
                      Remarks: {wth.adminRemarks}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Pending */}
              {wth.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(wth);
                      setModalAction('REJECT');
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 text-xs font-bold border border-neutral-700 transition cursor-pointer"
                  >
                    Reject & Refund
                  </button>

                  <button
                    onClick={() => {
                      setSelectedWithdrawal(wth);
                      setModalAction('APPROVE');
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Enter Payout Ref</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CONFIRMATION / ACTION MODAL */}
      {selectedWithdrawal && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="text-base font-black text-white">
                {modalAction === 'APPROVE' ? 'Disburse & Approve Payout' : 'Reject Withdrawal Request'}
              </h4>
              <button
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setModalAction(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
              <p className="text-neutral-400">Recipient: <span className="font-bold text-white">{selectedWithdrawal.userName}</span></p>
              <p className="text-neutral-400">Amount: <span className="font-black text-emerald-400 text-base font-mono">₹{selectedWithdrawal.amount}</span></p>
              <p className="text-neutral-400">Mode: <span className="font-bold text-orange-400">{selectedWithdrawal.payoutMethod} ({selectedWithdrawal.upiId || selectedWithdrawal.bankDetails?.bankName})</span></p>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3">
              {modalAction === 'APPROVE' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Bank UTR / Payout Reference Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPI/482910492817/SBI"
                    value={adminRef}
                    onChange={(e) => setAdminRef(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500">
                    This reference code will be displayed to the user on their profile wallet receipt.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Reason for Rejection</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Invalid UPI ID / Account mismatch"
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-500">
                    The requested amount (₹{selectedWithdrawal.amount}) will be automatically refunded back to the user's wallet.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWithdrawal(null);
                    setModalAction(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-2.5 rounded-xl text-white font-black text-xs shadow-md cursor-pointer ${
                    modalAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                  }`}
                >
                  {isProcessing ? 'Processing...' : modalAction === 'APPROVE' ? 'Confirm Payout' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
