import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Wrench, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Radio
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { GlobalAnnouncement } from '../types';

export const GlobalAnnouncementsManager: React.FC = () => {
  const { settings, updateSettings } = useTournaments();
  const announcements: GlobalAnnouncement[] = settings.announcements || [];

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'INFO' | 'URGENT' | 'EVENT' | 'MAINTENANCE'>('URGENT');
  const [actionText, setActionText] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [active, setActive] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAnnouncement: GlobalAnnouncement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      active,
      createdAt: new Date().toISOString(),
      actionText: actionText.trim() || undefined,
      actionUrl: actionUrl.trim() || undefined,
    };

    const updated = [newAnnouncement, ...announcements];
    updateSettings({ announcements: updated });

    setTitle('');
    setMessage('');
    setActionText('');
    setActionUrl('');
    setSaveStatus('Announcement broadcasted successfully to Home View!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleToggle = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    updateSettings({ announcements: updated });
  };

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    updateSettings({ announcements: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Global Tournament Announcements & Broadcasts
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Broadcast emergency server notices, mega tournament reminders, room rule changes, or maintenance alerts live to all players on the Home View.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Broadcasts: {announcements.filter((a) => a.active).length}</span>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Create Announcement */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-400" />
            <span>Create New Live Broadcast</span>
          </h3>

          <form onSubmit={handleAddAnnouncement} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400">Broadcast Type / Severity</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('URGENT')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    type === 'URGENT'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>URGENT / ALERT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('EVENT')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    type === 'EVENT'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>SPECIAL EVENT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('MAINTENANCE')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    type === 'MAINTENANCE'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>MAINTENANCE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('INFO')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    type === 'INFO'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>GENERAL INFO</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Free Fire Mega Sunday Finals at 9 PM!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400">Message Content</label>
              <textarea
                required
                rows={3}
                placeholder="Detailed notice text shown to players..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-medium focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400">Button Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. View Schedule"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400">Link URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. #tournaments"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs font-bold text-neutral-300">Publish Immediately</span>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className="cursor-pointer"
              >
                {active ? (
                  <ToggleRight className="w-6 h-6 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-neutral-600" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-orange-600/20"
            >
              Broadcast Announcement
            </button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-black text-white uppercase flex items-center justify-between">
            <span>Broadcast Feed ({announcements.length})</span>
            <span className="text-xs text-neutral-500 font-normal">Shows on top of player Home View</span>
          </h3>

          {announcements.length === 0 ? (
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
              <Megaphone className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">No announcements published yet.</p>
              <p className="text-[11px] text-neutral-500">Create one on the left to broadcast to players.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-2xl bg-neutral-900 border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    ann.active
                      ? ann.type === 'URGENT'
                        ? 'border-red-500/40 bg-red-950/10'
                        : ann.type === 'EVENT'
                        ? 'border-orange-500/40 bg-orange-950/10'
                        : 'border-neutral-700'
                      : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          ann.type === 'URGENT'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : ann.type === 'EVENT'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : ann.type === 'MAINTENANCE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {ann.type}
                      </span>
                      {ann.active ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          LIVE ON HOME
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 text-[10px] font-bold">
                          PAUSED
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                    <p className="text-xs text-neutral-300 line-clamp-2">{ann.message}</p>

                    {ann.actionText && (
                      <span className="inline-block text-[11px] font-bold text-orange-400 underline">
                        {ann.actionText}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggle(ann.id)}
                      title={ann.active ? 'Pause Broadcast' : 'Activate Broadcast'}
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                    >
                      {ann.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      title="Delete Announcement"
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
