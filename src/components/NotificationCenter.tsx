import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Trophy, 
  ShieldCheck, 
  ArrowUpRight, 
  Flame, 
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    currentUser 
  } = useTournaments();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const userNotifs = notifications.filter((n) => {
    if (n.userId === 'all') return true;
    if (currentUser?.uid && n.userId === currentUser.uid) return true;
    if (!currentUser && (n.userId === 'sample-user-aman' || n.userId === 'all')) return true;
    return false;
  });

  const displayedNotifs = filter === 'UNREAD' 
    ? userNotifs.filter((n) => !n.read) 
    : userNotifs;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'PRIZE_WON':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'SLOT_APPROVED':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL_UPDATE':
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />;
      case 'SYSTEM':
      default:
        return <Flame className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Notifications</h4>
                <p className="text-[10px] text-neutral-400">
                  {unreadNotificationsCount} unread update{unreadNotificationsCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-orange-400" />
                </button>
              )}
              {userNotifs.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 text-xs cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3.5 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                filter === 'ALL'
                  ? 'bg-neutral-800 text-orange-400 border border-orange-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({userNotifs.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                filter === 'UNREAD'
                  ? 'bg-neutral-800 text-orange-400 border border-orange-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
            {displayedNotifs.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs">
                No notifications right now.
              </div>
            ) : (
              displayedNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.actionUrl && onNavigate) {
                      onNavigate(notif.actionUrl);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition cursor-pointer hover:bg-neutral-800/70 flex items-start gap-3 ${
                    !notif.read ? 'bg-orange-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-white truncate">{notif.title}</h5>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-neutral-500 block font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View Profile */}
          <div className="p-2.5 bg-neutral-950 border-t border-neutral-800/80 text-center">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('profile');
                setIsOpen(false);
              }}
              className="w-full py-1.5 rounded-lg text-xs font-bold text-orange-400 hover:text-orange-300 hover:bg-neutral-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to My Profile & Wallet</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
