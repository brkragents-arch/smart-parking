import React from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Settings,
  Shield,
  Sliders,
  Database,
  Camera,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Wrench,
  Radio,
} from 'lucide-react';
import { UserRole } from '../../types';

export const AdminSettingsScreen: React.FC = () => {
  const {
    zones,
    settings,
    updateSettings,
    userRole,
    setUserRole,
    resetToDemoData,
    isSimulationActive,
    toggleSimulation,
    updateZoneStatus,
  } = useParking();

  const handleRetentionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ retention_days: Number(e.target.value) });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ anpr_confidence_threshold: Number(e.target.value) });
  };

  const handleSimulationIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ simulation_interval_ms: Number(e.target.value) });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950 border border-rose-800 px-2 py-0.5 rounded">
              Module H • System Administration
            </span>
            <span className="text-xs text-slate-400">Control Room Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            <span>Administration, Zone Thresholds & Security Policies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure role permissions, ANPR confidence cutoffs, data privacy retention policies, sensor diagnostics, and simulation parameters.
          </p>
        </div>

        {/* Current Active Role Badge */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Logged in as:</span>
          <strong className="text-white font-mono">{userRole}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Role-Based Access Control Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </h3>

          <div className="space-y-3 text-xs">
            {(['ADMIN', 'OPERATOR', 'TRAFFIC_POLICE'] as UserRole[]).map((r) => (
              <div
                key={r}
                onClick={() => setUserRole(r)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  userRole === r
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-sm shadow-cyan-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{r === 'ADMIN' ? 'Control Room Administrator' : r === 'OPERATOR' ? 'Gate Operator' : 'Traffic Police Inspector'}</span>
                    {userRole === r && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-600 text-white font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {r === 'ADMIN'
                      ? 'Full privileges: Edit capacities, override gates, change retention, manage zones'
                      : r === 'OPERATOR'
                      ? 'Operate entry/exit gates, review low-confidence OCR, manual allocate'
                      : 'Read-only live dashboards, monitor ghat congestion, view roadside VMS'}
                  </div>
                </div>

                <input
                  type="radio"
                  name="user_role"
                  checked={userRole === r}
                  onChange={() => setUserRole(r)}
                  className="w-4 h-4 text-cyan-600 focus:ring-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ANPR Computer Vision & Retention Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>ANPR Detection & Privacy Policies</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Confidence Threshold */}
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>ANPR Verification Confidence Cutoff:</span>
                <span className="font-mono text-cyan-300 font-bold">{settings.anpr_confidence_threshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={settings.anpr_confidence_threshold}
                onChange={handleThresholdChange}
                className="w-full accent-cyan-500"
              />
              <div className="text-[11px] text-slate-400 mt-0.5">
                Plates detected with confidence score below {settings.anpr_confidence_threshold}% trigger mandatory manual review modal.
              </div>
            </div>

            {/* Privacy Retention Policy */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                License Plate Photo Retention Limit (Indian DPDP Act):
              </label>
              <select
                value={settings.retention_days}
                onChange={handleRetentionChange}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              >
                <option value={7}>7 Days (Strict Pushkaralu Festival Cleanup)</option>
                <option value={14}>14 Days (Standard Pilgrimage Window)</option>
                <option value={30}>30 Days (Statutory Audit Archive)</option>
              </select>
              <div className="text-[11px] text-slate-400 mt-1">
                Captured number-plate crops are automatically purged after the retention window to ensure pilgrim privacy.
              </div>
            </div>
          </div>
        </div>

        {/* Parking Zone Operational Status Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Zone Capacity & Status Overrides</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {zones.map((zone) => (
              <div
                key={zone.zone_id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{zone.zone_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Cap: {zone.capacity} • {zone.vehicle_category} • {zone.gate_id}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={zone.operational_status}
                    onChange={(e) => updateZoneStatus(zone.zone_id, e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Hardware Health & Simulation Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Hardware Diagnostics & Simulation Controls</span>
          </h3>

          {/* Hardware Status Chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">ANPR Cam 1 (North)</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">ANPR Cam 2 (Central)</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Barrier Controller PLC</span>
              <span className="text-emerald-400 font-mono font-bold">READY</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">VMS LED Gantry 1</span>
              <span className="text-emerald-400 font-mono font-bold">SYNCED</span>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300">Live Traffic Simulation Engine:</div>
            
            <div className="flex items-center justify-between">
              <span>Traffic Generation State:</span>
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition ${
                  isSimulationActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulationActive ? 'Pause Simulation' : 'Start Simulation'}</span>
              </button>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Simulation Event Interval:</span>
                <span className="font-mono text-white font-bold">{settings.simulation_interval_ms / 1000} seconds</span>
              </div>
              <input
                type="range"
                min="2000"
                max="8000"
                step="500"
                value={settings.simulation_interval_ms}
                onChange={handleSimulationIntervalChange}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Restore Benchmark Seed Data:</span>
              <button
                onClick={() => {
                  if (window.confirm('Reset all parking lots to the official demonstration benchmark? (200 Cars: 120/80, 20 Buses: 12/8, 100 Bikes: 45/55, 10 VIP: 5/5)')) {
                    resetToDemoData();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset Benchmark</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
