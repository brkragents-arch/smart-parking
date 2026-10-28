import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Play,
  Pause,
  RotateCcw,
  Shield,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenConceptModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenConceptModal }) => {
  const {
    isSimulationActive,
    toggleSimulation,
    resetToDemoData,
    userRole,
    setUserRole,
    summary,
  } = useParking();

  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl relative z-20">
      {/* Decorative Godavari Sunrise Gradient Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400" />

      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Pushkaralu 2027 Titles */}
          <div className="flex items-center gap-3.5">
            {/* Pushkaralu Insignia / Gopuram Icon */}
            <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-cyan-500 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                <span className="font-black text-amber-400 text-lg tracking-tighter">SP27</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                  Smart Pushkaralu 2027 | Rajahmundry
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Godavari Sacred Ghats</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Smart Parking Slot Allocation Using ANPR
              </h1>
            </div>
          </div>

          {/* Controls: Demo Indicator, Simulation Toggle, Reset, Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Demo Mode Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span className={`w-2 h-2 rounded-full ${isSimulationActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="hidden lg:inline">DEMO MODE – NOT CONNECTED TO LIVE HARDWARE</span>
              <span className="lg:hidden">DEMO MODE</span>
            </div>

            {/* Simulation Run / Pause Button */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                isSimulationActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 ring-1 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isSimulationActive ? 'Pause automated vehicle traffic simulation' : 'Start live traffic simulation'}
            >
              {isSimulationActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Sim Running</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Start Sim</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset parking lots to official Smart Pushkaralu 2027 benchmark seed data? (200 Cars, 20 Buses, 100 Bikes, 10 VIP)')) {
                  resetToDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Reset to benchmark values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
              {(['ADMIN', 'OPERATOR', 'TRAFFIC_POLICE'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded transition ${
                    userRole === role
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role === 'ADMIN' ? 'Admin' : role === 'OPERATOR' ? 'Operator' : 'Police'}
                </button>
              ))}
            </div>

            {/* View Slide Concept Button */}
            <button
              onClick={onOpenConceptModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-900/30 transition"
              title="View original Smart Pushkaralu 2027 slide concept and architecture"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reference Concept</span>
            </button>
          </div>
        </div>

        {/* Live Status Ticker Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Control Room Time: <strong className="text-slate-200">{currentTime}</strong></span>
            </span>
            <span>
              Total Available: <strong className="text-emerald-400">{summary.totalAvailable}</strong> / {summary.totalCapacity}
            </span>
            <span>
              Occupancy: <strong className={summary.overallOccupancyPercentage >= 80 ? 'text-rose-400' : 'text-cyan-400'}>{summary.overallOccupancyPercentage}%</strong>
            </span>
            <span>
              Congestion: <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] ${
                summary.congestionStatus === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                summary.congestionStatus === 'MODERATE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                summary.congestionStatus === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>{summary.congestionStatus}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">
              Active User: <span className="text-cyan-300 font-medium">{userRole}</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Camera Nodes: <span className="text-emerald-400 font-medium">5 Online</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
