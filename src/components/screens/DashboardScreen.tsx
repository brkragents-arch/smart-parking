import React from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Car,
  Bus,
  Bike,
  Crown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  LogIn,
  LogOut,
  MapPin,
  Camera,
  Layers,
  ShieldCheck,
  Activity,
  Info,
} from 'lucide-react';
import { ScreenId } from '../layout/Sidebar';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenConceptModal: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, onOpenConceptModal }) => {
  const { summary, sessions, anprEvents, toggleSimulation, isSimulationActive } = useParking();

  const categories = [
    {
      key: 'CAR' as const,
      name: 'Car Parking',
      icon: Car,
      color: 'emerald',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      progressColor: 'bg-emerald-500',
      stats: summary.categoryStats.CAR,
    },
    {
      key: 'BUS' as const,
      name: 'Bus Parking',
      icon: Bus,
      color: 'cyan',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      progressColor: 'bg-cyan-500',
      stats: summary.categoryStats.BUS,
    },
    {
      key: 'BIKE' as const,
      name: 'Bike Parking',
      icon: Bike,
      color: 'amber',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      progressColor: 'bg-amber-500',
      stats: summary.categoryStats.BIKE,
    },
    {
      key: 'VIP' as const,
      name: 'VIP Parking',
      icon: Crown,
      color: 'rose',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      progressColor: 'bg-rose-500',
      stats: summary.categoryStats.VIP,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Scenic Rajahmundry Godavari Riverfront Control Room Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Smart Pushkaralu 2027 • Intelligent Transportation Systems</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rajahmundry Godavari Riverfront Parking Control Room
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Automated Number Plate Recognition (ANPR) integrated with real-time slot occupancy sensors, 
              intelligent rule-based slot allocation, and roadside variable message signboards to manage pilgrim crowd surges across Kotilingala, Pushkar, and Saraswathi Ghats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('entry')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Process Vehicle Entry</span>
            </button>
            <button
              onClick={() => onNavigate('exit')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>Release Exit Vehicle</span>
            </button>
            <button
              onClick={onOpenConceptModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-semibold text-xs transition"
            >
              <Layers className="w-4 h-4" />
              <span>Slide Architecture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module A: 4 Core Category Summary Cards (Matching Demo Baseline) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Real-Time Category Occupancy</span>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                Dynamic Sensor Driven
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live capacity tracking across cars, tour buses, two-wheelers, and protocol VIP fleets.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Updated: {new Date(summary.lastUpdated).toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const stats = cat.stats || {
              totalCapacity: 0,
              occupied: 0,
              available: 0,
              occupancyPercentage: 0,
              entryCount: 0,
              exitCount: 0,
              status: 'AVAILABLE',
            };

            return (
              <div
                key={cat.key}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group"
              >
                {/* Glow accent */}
                <div className={`absolute top-0 right-0 w-28 h-28 ${cat.bgColor} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${cat.bgColor} border ${cat.borderColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cat.textColor}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">Cap: {stats.totalCapacity} slots</span>
                    </div>
                  </div>

                  {/* Status chip */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      stats.status === 'AVAILABLE'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : stats.status === 'LIMITED'
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800'
                    }`}
                  >
                    {stats.status}
                  </span>
                </div>

                {/* Main Occupied vs Available counts */}
                <div className="grid grid-cols-2 gap-2 my-3 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <div className="text-[10px] font-medium text-slate-400">Occupied</div>
                    <div className="text-xl font-extrabold text-white font-mono">{stats.occupied}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-400">Available</div>
                    <div className="text-xl font-extrabold text-emerald-400 font-mono">{stats.available}</div>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Occupancy Rate</span>
                    <span className="font-bold text-white">{stats.occupancyPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.progressColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, stats.occupancyPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Today's movement counts */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In: <strong className="text-slate-200">{stats.entryCount}</strong></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Out: <strong className="text-slate-200">{stats.exitCount}</strong></span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Room Overall Metrics Row & Slide Mini Dashboard Replica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Overall Operations Metrics */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Global Smart Pushkaralu Parking Metrics</span>
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-medium">Control Room Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Total Capacity */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Capacity</div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {summary.totalCapacity} <span className="text-xs font-normal text-slate-400">slots</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across 5 Sacred Zones</div>
            </div>

            {/* Total Occupied */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Occupied</div>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                {summary.totalOccupied} <span className="text-xs font-normal text-slate-400">vehicles</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{summary.overallOccupancyPercentage}% occupied</div>
            </div>

            {/* Total Free Spaces */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Available Spaces</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {summary.totalAvailable} <span className="text-xs font-normal text-slate-400">free</span>
              </div>
              <div className="text-[11px] text-emerald-500 mt-1">Ready for allocation</div>
            </div>

            {/* Today's Entries */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Vehicles Entered Today</div>
              <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
                <span>{summary.totalEntriesToday}</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">ANPR Verified Entries</div>
            </div>

            {/* Today's Exits */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Vehicles Exited Today</div>
              <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
                <span>{summary.totalExitsToday}</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Released back to pool</div>
            </div>

            {/* Congestion Level */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Ghat Congestion Status</div>
              <div className="text-xl font-extrabold uppercase font-mono mt-1">
                <span className={`px-2 py-0.5 rounded text-sm ${
                  summary.congestionStatus === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  summary.congestionStatus === 'MODERATE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                  summary.congestionStatus === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>{summary.congestionStatus}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Godavari Bund Road Flow</div>
            </div>

          </div>

          {/* Quick Nav Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open 2D Slot Map</span>
            </button>
            <button
              onClick={() => onNavigate('anpr')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Camera className="w-3.5 h-3.5 text-violet-400" />
              <span>Live ANPR Cameras</span>
            </button>
            <button
              onClick={() => onNavigate('signboard')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <span>LED VMS Signboards</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>

        {/* Right Col: High-Fidelity Replica of Poster's "Parking Dashboard (Live)" Widget */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-black text-white tracking-wider uppercase">
                  Parking Dashboard (Live)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                As in Slide 11
              </span>
            </div>

            {/* 3 Major Category Mini Tiles (Cars, Buses, VIP) as printed on slide */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              
              {/* Car Slots */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  Car Slots
                </div>
                <div className="my-2 flex justify-center">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Car className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {summary.categoryStats.CAR?.occupied || 120}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  / {summary.categoryStats.CAR?.totalCapacity || 200}
                </div>
              </div>

              {/* Bus Slots */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">
                  Bus Slots
                </div>
                <div className="my-2 flex justify-center">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {summary.categoryStats.BUS?.occupied || 12}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  / {summary.categoryStats.BUS?.totalCapacity || 20}
                </div>
              </div>

              {/* VIP Slots */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">
                  VIP Slots
                </div>
                <div className="my-2 flex justify-center">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-rose-400" />
                  </div>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {summary.categoryStats.VIP?.occupied || 5}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  / {summary.categoryStats.VIP?.totalCapacity || 10}
                </div>
              </div>

            </div>

            {/* Slide's Distinctive Bottom Green Banner Bar */}
            <div className="bg-emerald-600 rounded-xl py-2.5 px-4 text-center text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-900/40 flex items-center justify-around">
              <span>Available Slots: {summary.totalAvailable}</span>
              <span>|</span>
              <span>Occupancy: {summary.overallOccupancyPercentage}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Reference Vehicle: <strong className="text-cyan-300">AP 39 XX 1234</strong></span>
            <span className="text-emerald-400 font-semibold">Ghat Gate 1</span>
          </div>
        </div>

      </div>

      {/* Slide Concept Panels: Problem vs Objective vs Solution vs How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Problem Card */}
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span>PROBLEM IDENTIFIED</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>Drivers spend excessive time hunting for parking, causing massive vehicular queues at entrance checkpoints.</li>
            <li>Roadside spillover and chaotic parking choke Godavari ghat approaches, impeding ambulance and emergency routes.</li>
            <li>Pilgrim safety compromised during peak Pushkaralu holy dip hours (4 AM - 8 AM).</li>
          </ul>
        </div>

        {/* Proposed Solution Card */}
        <div className="bg-slate-900/90 border border-cyan-900/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <span>PROPOSED SMART SOLUTION</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>Combine entry/exit ANPR cameras with slot sensors for synchronized occupancy accounting.</li>
            <li>Intelligent rule-based allocation engine dynamically assigns slots by vehicle category and distance.</li>
            <li>Synchronized roadside LED Variable Message Signs (VMS) divert incoming pilgrim traffic before bottlenecks form.</li>
          </ul>
        </div>

        {/* How It Works Card */}
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span>HOW THE PIPELINE WORKS</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
              <span>ANPR cameras capture plate & verify registration</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
              <span>Sensors provide real-time slot vacancy telemetry</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
              <span>Rule engine allocates optimal slot & issues token</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
              <span>Roadside LED signboards guide drivers seamlessly</span>
            </div>
          </div>
        </div>

      </div>

      {/* Live Recent Activity Stream & ANPR Capture Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Vehicle Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Recent Parking Sessions</span>
            </h4>
            <button
              onClick={() => onNavigate('records')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              View All Records →
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
            {sessions.slice(0, 6).map((sess) => (
              <div
                key={sess.session_id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sess.vehicle_category === 'CAR' ? 'bg-emerald-500/20 text-emerald-400' :
                    sess.vehicle_category === 'BUS' ? 'bg-cyan-500/20 text-cyan-400' :
                    sess.vehicle_category === 'BIKE' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {sess.vehicle_category === 'CAR' ? <Car className="w-4 h-4" /> :
                     sess.vehicle_category === 'BUS' ? <Bus className="w-4 h-4" /> :
                     sess.vehicle_category === 'BIKE' ? <Bike className="w-4 h-4" /> :
                     <Crown className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white font-mono tracking-wide">
                      {sess.registration_number}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Slot: <span className="text-cyan-300 font-mono font-medium">{sess.slot_id}</span> • Token: {sess.token_number}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sess.session_status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sess.session_status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(sess.entry_time).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live ANPR Camera OCR Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Live ANPR OCR Captures</span>
            </h4>
            <button
              onClick={() => onNavigate('anpr')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              Open Camera Lab →
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
            {anprEvents.slice(0, 5).map((evt) => (
              <div
                key={evt.event_id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    <span className="font-mono text-[9px] text-cyan-400 font-bold">ANPR</span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white font-mono tracking-wider">
                      {evt.extracted_registration}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Camera: <span className="text-slate-300 font-mono">{evt.camera_id}</span> • Gate: {evt.gate_id}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                    {evt.confidence_score}% CONF
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {evt.verification_status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
