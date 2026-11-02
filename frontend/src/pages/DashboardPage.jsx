import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  Car,
  CheckCircle2,
  AlertOctagon,
  CalendarClock,
  ArrowDownRight,
  ArrowUpRight,
  Percent,
  PlusCircle,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsData, occData, trafficData, actData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getOccupancy(),
        dashboardApi.getTraffic(),
        dashboardApi.getActivities(),
      ]);

      setStats(statsData);
      setOccupancy(occData);
      setTraffic(trafficData);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh stats every 30 seconds for live monitoring
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading facility analytics...</p>
      </div>
    );
  }

  // Pie chart data for slot distribution
  const pieData = occupancy?.statusDistribution
    ? [
        { name: 'Available', value: occupancy.statusDistribution.AVAILABLE || 0, color: '#10b981' },
        { name: 'Occupied', value: occupancy.statusDistribution.OCCUPIED || 0, color: '#ef4444' },
        { name: 'Reserved', value: occupancy.statusDistribution.RESERVED || 0, color: '#f59e0b' },
      ]
    : [];

  // Vehicle type breakdown
  const vehicleTypeData = occupancy?.vehicleTypeDistribution
    ? [
        { type: 'Cars', count: occupancy.vehicleTypeDistribution.CAR || 0 },
        { type: 'Bikes', count: occupancy.vehicleTypeDistribution.BIKE || 0 },
        { type: 'EVs', count: occupancy.vehicleTypeDistribution.EV || 0 },
        { type: 'Trucks', count: occupancy.vehicleTypeDistribution.TRUCK || 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Facility Overview & Analytics</span>
            <span className="p-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Live</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time occupancy metrics, entry/exit logs, and parking slot utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/entry"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Entry
          </Link>
          <Link
            to="/exit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Process Exit
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Parking Slots"
          value={stats?.totalSlots || 0}
          subtitle="All zones and floors"
          icon={Car}
          color="blue"
          trend="Capacity 100%"
        />
        <StatCard
          title="Available Slots"
          value={stats?.availableSlots || 0}
          subtitle="Ready for incoming vehicles"
          icon={CheckCircle2}
          color="emerald"
          trend={`${stats?.totalSlots ? Math.round(((stats.availableSlots || 0) / stats.totalSlots) * 100) : 0}% Free`}
        />
        <StatCard
          title="Occupied Slots"
          value={stats?.occupiedSlots || 0}
          subtitle={`${stats?.totalVehiclesParked || 0} active vehicles inside`}
          icon={AlertOctagon}
          color="rose"
          trend={`${stats?.occupancyPercentage || 0}% Occupied`}
        />
        <StatCard
          title="Reserved Slots"
          value={stats?.reservedSlots || 0}
          subtitle="Upcoming advance bookings"
          icon={CalendarClock}
          color="amber"
          trend="Confirmed Slots"
        />
      </div>

      {/* Secondary Metrics Grid: Entries, Exits, Occupancy Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Entries
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
              {stats?.todayEntries || 0}
            </div>
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Inbound Traffic Today
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            IN
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Exits
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
              {stats?.todayExits || 0}
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Outbound Completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            OUT
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Occupancy Rate
            </span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {stats?.occupancyPercentage || 0}%
            </span>
          </div>
          <div className="my-2">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (stats?.occupancyPercentage || 0) > 85
                    ? 'bg-rose-500'
                    : (stats?.occupancyPercentage || 0) > 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(stats?.occupancyPercentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {(stats?.occupancyPercentage || 0) > 80
              ? 'Warning: Facility reaching maximum capacity'
              : 'Facility operating within optimal flow capacity'}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Traffic Flow Chart (Area Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                7-Day Inbound vs Outbound Traffic
              </h3>
              <p className="text-xs text-slate-500">Daily vehicle entries compared to exits</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Entries
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Exits
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="entryColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="entries" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#entryColor)" name="Entries" />
                <Area type="monotone" dataKey="exits" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#exitColor)" name="Exits" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slot Status Distribution (Donut Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Slot Status Distribution</h3>
            <p className="text-xs text-slate-500">Live breakdown of all facility slots</p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div>
              <div className="text-xs text-slate-500">Available</div>
              <div className="text-base font-bold text-emerald-600 font-mono">
                {occupancy?.statusDistribution?.AVAILABLE || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Occupied</div>
              <div className="text-base font-bold text-rose-600 font-mono">
                {occupancy?.statusDistribution?.OCCUPIED || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Reserved</div>
              <div className="text-base font-bold text-amber-600 font-mono">
                {occupancy?.statusDistribution?.RESERVED || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Zone Occupancy & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Zone Occupancy Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Capacity and occupancy by floor zone</p>

          <div className="space-y-3.5">
            {occupancy?.zoneOccupancy?.map((zone) => (
              <div key={zone.zone} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{zone.zone}</span>
                  <span className="font-mono text-slate-600">
                    {zone.occupied} / {zone.total} slots ({zone.occupancyRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      zone.occupancyRate > 75 ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(zone.occupancyRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Activities Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Facility Activities</h3>
              <p className="text-xs text-slate-500">Audit stream of vehicle check-ins, exits, and bookings</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Full History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent activity records found.
              </div>
            ) : (
              activities.map((act) => {
                const getBadge = (color) => {
                  switch (color) {
                    case 'blue':
                      return 'bg-blue-50 text-blue-700 border-blue-200';
                    case 'emerald':
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    case 'amber':
                      return 'bg-amber-50 text-amber-700 border-amber-200';
                    default:
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadge(
                          act.badgeColor
                        )}`}
                      >
                        {act.type}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{act.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{act.description}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
