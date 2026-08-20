import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Wallet, 
  Key, 
  ShieldAlert, 
  Plus, 
  Minus, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Gamepad2, 
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { AuthPlayerProfile } from '../types';

export const AdminUsersListManager: React.FC = () => {
  const { 
    registeredUsers, 
    registeredUsersCount, 
    deleteUserAccount, 
    adminAdjustUserWallet, 
    resetPassword,
    adminEmail
  } = useTournaments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AuthPlayerProfile | null>(null);
  const [walletModalUser, setWalletModalUser] = useState<AuthPlayerProfile | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<AuthPlayerProfile | null>(null);
  
  // Wallet adjust form
  const [walletAmount, setWalletAmount] = useState('');
  const [walletAction, setWalletAction] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [walletReason, setWalletReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  // Password reset form
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AuthPlayerProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredUsers = registeredUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.inGameName?.toLowerCase().includes(q) ||
      u.gameUid?.includes(q) ||
      u.uid?.toLowerCase().includes(q)
    );
  });

  const totalWalletSum = registeredUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

  const handleDeleteUser = async (user: AuthPlayerProfile) => {
    if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
      alert('Master Admin account cannot be deleted.');
      return;
    }
    setDeleting(true);
    try {
      if (deleteUserAccount) {
        await deleteUserAccount(user.uid);
      } else {
        await fetch(`/api/users/${user.uid}`, { method: 'DELETE' });
      }
      setDeleteConfirmUser(null);
    } catch (e: any) {
      alert(e.message || 'Error deleting user');
    } finally {
      setDeleting(false);
    }
  };

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser) return;
    const num = Number(walletAmount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setAdjusting(true);
    setAdjustSuccess(null);
    try {
      const res = await adminAdjustUserWallet({
        userId: walletModalUser.uid,
        userEmail: walletModalUser.email,
        userName: walletModalUser.displayName,
        amount: num,
        actionType: walletAction,
        category: walletAction === 'CREDIT' ? 'MANUAL_ADJUSTMENT' : 'PENALTY',
        description: walletReason || (walletAction === 'CREDIT' ? 'Admin Cash Credit' : 'Admin Penalty / Debit'),
      });
      setAdjustSuccess(res.message);
      setTimeout(() => {
        setAdjustSuccess(null);
        setWalletModalUser(null);
        setWalletAmount('');
        setWalletReason('');
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Failed to adjust wallet');
    } finally {
      setAdjusting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (newPassword.trim().length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    setResetting(true);
    setResetSuccess(null);
    try {
      const res = await resetPassword(passwordModalUser.email || passwordModalUser.phone || '', newPassword.trim());
      if (res.success) {
        setResetSuccess('Password updated successfully!');
        setTimeout(() => {
          setResetSuccess(null);
          setPasswordModalUser(null);
          setNewPassword('');
        }, 1500);
      } else {
        alert(res.error || 'Failed to reset password');
      }
    } catch (e: any) {
      alert(e.message || 'Error resetting password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Total Registered Players</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{registeredUsersCount}</h3>
            <p className="text-[11px] text-emerald-400 mt-0.5">Synced across all devices</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Total Player Balances</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">₹{totalWalletSum.toLocaleString()}</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">In active user wallets</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Master Admin</p>
            <h3 className="text-lg font-bold text-white mt-1 truncate max-w-[180px]">{adminEmail}</h3>
            <p className="text-[11px] text-amber-400 mt-0.5">Full root permissions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table & List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span>Registered Users & Player Accounts ({filteredUsers.length})</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              View all player accounts, manage wallet balances, reset passwords, or delete accounts permanently.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, UID..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No registered users found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isMaster = user.email?.toLowerCase() === adminEmail.toLowerCase();
              return (
                <div
                  key={user.uid}
                  className={`bg-neutral-950 border rounded-xl p-4 space-y-3 relative transition hover:border-neutral-700 ${
                    isMaster ? 'border-amber-500/40 bg-amber-950/10' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {user.displayName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm truncate max-w-[140px]">
                            {user.displayName || 'Player'}
                          </h4>
                          {isMaster && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>

                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-lg shrink-0">
                      ₹{user.walletBalance || 0}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Mobile:
                      </span>
                      <span className="font-mono text-neutral-200">{user.phone || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Gamepad2 className="w-3.5 h-3.5" /> Free Fire UID:
                      </span>
                      <span className="font-mono text-orange-400 font-bold">{user.gameUid || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">In-Game Name:</span>
                      <span className="font-semibold text-neutral-200 truncate max-w-[120px]">
                        {user.inGameName || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                      <span>Joined:</span>
                      <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => setWalletModalUser(user)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition"
                      title="Add or Deduct Cash"
                    >
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Wallet</span>
                    </button>

                    <button
                      onClick={() => setPasswordModalUser(user)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition"
                      title="Reset User Password"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pass</span>
                    </button>

                    {!isMaster && (
                      <button
                        onClick={() => setDeleteConfirmUser(user)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        title="Delete User Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Wallet Adjust */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Adjust Wallet: {walletModalUser.displayName}</span>
              </h3>
              <button onClick={() => setWalletModalUser(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Current balance: <strong className="text-emerald-400">₹{walletModalUser.walletBalance || 0}</strong> • {walletModalUser.email}
            </p>

            <form onSubmit={handleAdjustWallet} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWalletAction('CREDIT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    walletAction === 'CREDIT'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Credit Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAction('DEBIT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    walletAction === 'DEBIT'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>- Debit Cash</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. Match Prize, Deposit Adjustment, Bonus"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {adjustSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{adjustSuccess}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModalUser(null)}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-lg disabled:opacity-50"
                >
                  {adjusting ? 'Updating...' : `Confirm ${walletAction === 'CREDIT' ? 'Credit' : 'Debit'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Password Reset */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Reset Password: {passwordModalUser.displayName}</span>
              </h3>
              <button onClick={() => setPasswordModalUser(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Enter a new password for <strong className="text-white">{passwordModalUser.email}</strong>. The user can log in with this new password immediately on all devices.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 4 chars)"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              {resetSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg disabled:opacity-50"
                >
                  {resetting ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-white text-base">Permanently Delete User Account?</h3>
              <p className="text-xs text-neutral-400">
                Are you sure you want to delete <strong className="text-red-400">{deleteConfirmUser.displayName} ({deleteConfirmUser.email})</strong>?
              </p>
              <p className="text-[11px] text-neutral-500">
                This action cannot be undone and will permanently remove this user account from the central server.
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
