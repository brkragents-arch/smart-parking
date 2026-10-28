import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Camera,
  LogIn,
  LogOut,
  Cpu,
  FileSpreadsheet,
  BarChart3,
  Tv,
  Settings,
  Car,
  Bus,
  Bike,
  Crown,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export type ScreenId =
  | 'dashboard'
  | 'map'
  | 'anpr'
  | 'entry'
  | 'exit'
  | 'allocation'
  | 'records'
  | 'analytics'
  | 'signboard'
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onSelectScreen }) => {
  const { summary } = useParking();

  const navItems = [
    {
      id: 'dashboard' as ScreenId,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: `${summary.totalAvailable} free`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'map' as ScreenId,
      label: 'Live Parking Map',
      icon: MapPin,
      badge: '330 Slots',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'anpr' as ScreenId,
      label: 'ANPR Monitoring',
      icon: Camera,
      badge: 'Live OCR',
      badgeColor: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    },
    {
      id: 'entry' as ScreenId,
      label: 'Vehicle Entry',
      icon: LogIn,
      badge: 'In Gate',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'exit' as ScreenId,
      label: 'Vehicle Exit',
      icon: LogOut,
      badge: 'Out Gate',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'allocation' as ScreenId,
      label: 'Slot Allocation',
      icon: Cpu,
      badge: 'AI Engine',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'records' as ScreenId,
      label: 'Vehicle Records',
      icon: FileSpreadsheet,
      badge: `${summary.totalEntriesToday}`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'analytics' as ScreenId,
      label: 'Analytics',
      icon: BarChart3,
      badge: 'Reports',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    },
    {
      id: 'signboard' as ScreenId,
      label: 'LED Signboard',
      icon: Tv,
      badge: 'VMS Preview',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'settings' as ScreenId,
      label: 'Administration',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4.25rem)] sticky top-0 shrink-0">
      {/* Navigation List */}
      <div className="p-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    item.badgeColor || 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Category Status Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>Live Lot Status</span>
          <span className="text-[10px] text-emerald-400 font-mono">Dynamic</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Car */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cars</span>
            </span>
            <span className="font-mono text-xs">
              <strong className="text-white">{summary.categoryStats.CAR?.occupied || 0}</strong>
              <span className="text-slate-500"> / {summary.categoryStats.CAR?.totalCapacity || 0}</span>
            </span>
          </div>

          {/* Bus */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Bus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Buses</span>
            </span>
            <span className="font-mono text-xs">
              <strong className="text-white">{summary.categoryStats.BUS?.occupied || 0}</strong>
              <span className="text-slate-500"> / {summary.categoryStats.BUS?.totalCapacity || 0}</span>
            </span>
          </div>

          {/* Bike */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Bikes</span>
            </span>
            <span className="font-mono text-xs">
              <strong className="text-white">{summary.categoryStats.BIKE?.occupied || 0}</strong>
              <span className="text-slate-500"> / {summary.categoryStats.BIKE?.totalCapacity || 0}</span>
            </span>
          </div>

          {/* VIP */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Crown className="w-3.5 h-3.5 text-rose-400" />
              <span>VIP</span>
            </span>
            <span className="font-mono text-xs">
              <strong className="text-white">{summary.categoryStats.VIP?.occupied || 0}</strong>
              <span className="text-slate-500"> / {summary.categoryStats.VIP?.totalCapacity || 0}</span>
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Overall Occupancy</span>
            <span className="font-bold text-white">{summary.overallOccupancyPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                summary.overallOccupancyPercentage > 85
                  ? 'bg-rose-500'
                  : summary.overallOccupancyPercentage > 65
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.overallOccupancyPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
