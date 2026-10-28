import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Car,
  Bus,
  Bike,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { summary, sessions, anprEvents, auditLogs } = useParking();

  const [timeRange, setTimeRange] = useState<'TODAY' | '7DAYS' | 'ALL'>('TODAY');

  // Pushkaralu Hourly Flow Dataset (Simulating 24-hr pilgrimage arrival surges: holy dip at dawn 4 AM - 8 AM, and evening aarti 4 PM - 8 PM)
  const hourlyData = [
    { hour: '04:00', in: 48, out: 4 },
    { hour: '06:00', in: 92, out: 18 },
    { hour: '08:00', in: 74, out: 35 },
    { hour: '10:00', in: 45, out: 52 },
    { hour: '12:00', in: 32, out: 40 },
    { hour: '14:00', in: 28, out: 30 },
    { hour: '16:00', in: 68, out: 24 },
    { hour: '18:00', in: 85, out: 42 },
    { hour: '20:00', in: 55, out: 65 },
    { hour: '22:00', in: 20, out: 38 },
  ];

  const maxFlow = Math.max(...hourlyData.map((d) => Math.max(d.in, d.out)));

  const handleExportAnalyticsReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Hour,Inflow (Entries),Outflow (Exits)',
        ...hourlyData.map((d) => `${d.hour},${d.in},${d.out}`),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pushkaralu_Hourly_Traffic_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
              Module G • Intelligent Transportation Analytics
            </span>
            <span className="text-xs text-slate-400">Pushkaralu Crowd Control Room</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Smart City Parking & Pilgrim Traffic Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry reports on hourly vehicular flow, turnover velocity, ANPR OCR recognition accuracy, and congestion heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {(['TODAY', '7DAYS', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  timeRange === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'TODAY' ? 'Pushkaralu Day 1' : t === '7DAYS' ? 'Weekly Aggregate' : 'All-Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalyticsReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>ANPR Recognition Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">97.8%</div>
          <div className="text-[11px] text-emerald-400 mt-1">2.2% Manual Correction Rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Avg Pilgrim Parking Duration</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">2h 15m</div>
          <div className="text-[11px] text-slate-400 mt-1">Sufficient for Godavari Snanam</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Peak Pilgrim Arrival Hour</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">06:00 AM</div>
          <div className="text-[11px] text-slate-400 mt-1">Surge: 92 vehicles / hour</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Allocation Engine Success</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">99.4%</div>
          <div className="text-[11px] text-cyan-400 mt-1">Zero Double-Booking Incidents</div>
        </div>

      </div>

      {/* Hourly Flow Chart (Inflow vs Outflow) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Hourly Vehicle Entries & Exits Across Pushkaralu Ghat Gates</span>
            </h3>
            <p className="text-xs text-slate-400">
              Corresponds with holy dip periods (Brahma Muhurtham 4-8 AM & Evening Harathi 4-8 PM)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Inflow (Entries)</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Outflow (Exits)</span>
            </span>
          </div>
        </div>

        {/* SVG Responsive Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2">
          {hourlyData.map((bar) => {
            const inHeight = Math.round((bar.in / maxFlow) * 100);
            const outHeight = Math.round((bar.out / maxFlow) * 100);

            return (
              <div key={bar.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-48">
                  {/* In Bar */}
                  <div
                    className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:brightness-125 relative"
                    style={{ height: `${inHeight}%` }}
                    title={`In: ${bar.in} vehicles`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white font-bold bg-slate-950 px-1 rounded transition">
                      {bar.in}
                    </span>
                  </div>

                  {/* Out Bar */}
                  <div
                    className="w-1/2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t transition-all group-hover:brightness-125 relative"
                    style={{ height: `${outHeight}%` }}
                    title={`Out: ${bar.out} vehicles`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white font-bold bg-slate-950 px-1 rounded transition">
                      {bar.out}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {bar.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Congestion Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Vehicular Category Utilization Share</span>
          </h3>

          <div className="space-y-3.5">
            {[
              { label: 'Cars / SUVs (Zone A & B)', occ: summary.categoryStats.CAR?.occupied || 120, cap: 200, color: 'bg-emerald-500' },
              { label: 'APSRTC Pilgrim Buses (Zone C)', occ: summary.categoryStats.BUS?.occupied || 12, cap: 20, color: 'bg-cyan-500' },
              { label: 'Motorcycles & Scooters (Zone D)', occ: summary.categoryStats.BIKE?.occupied || 45, cap: 100, color: 'bg-amber-500' },
              { label: 'Protocol VIP Enclave (Zone V)', occ: summary.categoryStats.VIP?.occupied || 5, cap: 10, color: 'bg-rose-500' },
            ].map((item) => {
              const pct = Math.round((item.occ / item.cap) * 100);
              return (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>{item.label}</span>
                    <span className="font-mono text-white font-bold">
                      {item.occ} / {item.cap} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ghat Corridor Congestion Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Ghat Corridor Congestion & Inflow Speed</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Kotilingala Ghat North Corridor</div>
                <div className="text-[11px] text-slate-400">Gate 1 Approach Road (NH-16 feeder)</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold text-[11px]">
                MODERATE (22 km/h)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Main Pushkar Ghat South Bund</div>
                <div className="text-[11px] text-slate-400">Gate 2 Havelock Bridge Junction</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono font-bold text-[11px]">
                HIGH (11 km/h)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Saraswathi Ghat Riverfront Promenade</div>
                <div className="text-[11px] text-slate-400">Gate 4 Two-Wheeler Ingress</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold text-[11px]">
                LOW (35 km/h)
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
