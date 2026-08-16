import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  Smartphone, 
  UserCheck, 
  Activity, 
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTournaments } from '../context/TournamentContext';

export const AdminAnalyticsDashboard: React.FC = () => {
  const { 
    appOpensCount, 
    registeredUsersCount, 
    trafficAnalytics,
    registrations,
    results,
    matches,
    withdrawals
  } = useTournaments();

  const [searchUser, setSearchUser] = useState('');
  const [chartMetric, setChartMetric] = useState<'traffic' | 'financials'>('traffic');

  const totalRevenue = registrations
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.totalPayable, 0);

  const totalPayouts = results.reduce((sum, r) => sum + r.totalPayout, 0);
  const pendingApprovals = registrations.filter((r) => r.status === 'PENDING').length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* App Opens Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">App Opens</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {appOpensCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-400 font-semibold">
              <Activity className="w-3 h-3" />
              <span>Real-Time Live Counter</span>
            </div>
          </div>
        </div>

        {/* Registered Users Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Registered Players</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {registeredUsersCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-semibold">
              <UserCheck className="w-3 h-3" />
              <span>100% Active Profiles</span>
            </div>
          </div>
        </div>

        {/* Total Tournament Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Verified Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-400">
              <span>{registrations.filter(r => r.status === 'APPROVED').length} paid slots</span>
            </div>
          </div>
        </div>

        {/* Total Distributed Prizes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Rewards Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-400 tracking-tight">
              ₹{totalPayouts.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-400">
              <span>{results.length} matches completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section with Recharts */}
      <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span>Traffic & Player Engagement Analytics</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Live interactive chart visualizing daily app opens, logins, and registrations
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              onClick={() => setChartMetric('traffic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMetric === 'traffic'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              App Traffic (Opens & Logins)
            </button>
            <button
              onClick={() => setChartMetric('financials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMetric === 'financials'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Revenue Volume (₹)
            </button>
          </div>
        </div>

        {/* Animated Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'traffic' ? (
              <AreaChart data={trafficAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#404040', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="opens" name="App Opens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOpens)" />
                <Area type="monotone" dataKey="logins" name="User Logins" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorLogins)" />
                <Area type="monotone" dataKey="registrations" name="Slot Registrations" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRegs)" />
              </AreaChart>
            ) : (
              <BarChart data={trafficAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#404040', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Daily Revenue Collection (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Alerts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold">Active Tournament Matches</span>
            <div className="text-xl font-bold text-white mt-0.5">{matches.length} Rooms</div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/30">
            {matches.filter(m => m.status === 'REGISTRATION_OPEN').length} Open
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold">Pending Payment Approvals</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{pendingApprovals} Pending</div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
            UTR Check
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold">Pending Payout Transfers</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{pendingWithdrawals} Requests</div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/30">
            UPI/Bank
          </span>
        </div>
      </div>
    </div>
  );
};
