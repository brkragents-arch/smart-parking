import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Settings2,
  Sliders,
  Car,
  Bus,
  Bike,
  Crown,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { VehicleCategory } from '../../types';
import { allocateOptimalSlot } from '../../utils/allocationEngine';

export const SlotAllocationScreen: React.FC = () => {
  const { zones, slots, summary } = useParking();

  // Sandbox inputs
  const [testPlate, setTestPlate] = useState<string>('AP 39 XX 1234');
  const [testCategory, setTestCategory] = useState<VehicleCategory>('CAR');
  const [testIsVip, setTestIsVip] = useState<boolean>(false);
  const [testIsAccessible, setTestIsAccessible] = useState<boolean>(false);
  const [preferredZone, setPreferredZone] = useState<string>('AUTO');

  // Algorithm Weights (Customizable by Admin/Operator)
  const [weightAvailability, setWeightAvailability] = useState<number>(45);
  const [weightCongestion, setWeightCongestion] = useState<number>(30);
  const [weightDistance, setWeightDistance] = useState<number>(25);

  const recommendation = allocateOptimalSlot(
    {
      vehicleCategory: testCategory,
      isVip: testIsVip,
      isAccessible: testIsAccessible,
      preferredZoneId: preferredZone === 'AUTO' ? undefined : preferredZone,
      registrationNumber: testPlate,
    },
    zones,
    slots
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
              Module D • Rule-Based AI Engine
            </span>
            <span className="text-xs text-slate-400">Heuristic Multi-Objective Optimizer</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Intelligent Slot Allocation Engine & Rule Visualizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates vacancy telemetry, walking distance to sacred Godavari ghats, vehicular category, and real-time road congestion to compute optimal parking allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-xl">
            ✓ Concurrency Guard Active (No Double-Booking)
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Sandbox on Left, Decision Tree & Math on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Sandbox Inputs & Weight Tuning */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Test Case Simulator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Allocation Sandbox Parameters</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Live Simulation</span>
            </div>

            {/* Test Plate */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Vehicle Registration Plate:
              </label>
              <input
                type="text"
                value={testPlate}
                onChange={(e) => setTestPlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Vehicle Category:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'CAR' as const, label: 'Car', icon: Car },
                  { type: 'BUS' as const, label: 'Bus', icon: Bus },
                  { type: 'BIKE' as const, label: 'Bike', icon: Bike },
                  { type: 'VIP' as const, label: 'VIP', icon: Crown },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = testCategory === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => {
                        setTestCategory(item.type);
                        if (item.type === 'VIP') setTestIsVip(true);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={testIsAccessible}
                  onChange={(e) => setTestIsAccessible(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                />
                <span>♿ Accessible Requirement (Divyangjan)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={testIsVip}
                  onChange={(e) => setTestIsVip(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                />
                <span>⭐ Dignitary / Protocol VIP Pass</span>
              </label>
            </div>

            {/* Zone Preference */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Preferred Zone (Optional Override):
              </label>
              <select
                value={preferredZone}
                onChange={(e) => setPreferredZone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
              >
                <option value="AUTO">Optimal System Choice (Algorithm Ranked)</option>
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.zone_name} ({z.vehicle_category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Engine Scoring Formula & Weight Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Optimization Objective Function</span>
              <span className="text-[10px] text-cyan-400 font-mono">Normalized Sum</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
              ZoneScore = (W_avail &times; Free/Cap) + (W_flow &times; (1 - Cong)) + (W_dist &times; (1 - Dist/600))
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vacancy Availability Weight (W_avail)</span>
                  <span className="font-bold text-white">{weightAvailability}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={weightAvailability}
                  onChange={(e) => setWeightAvailability(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Congestion Avoidance Weight (W_flow)</span>
                  <span className="font-bold text-white">{weightCongestion}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weightCongestion}
                  onChange={(e) => setWeightCongestion(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Proximity to Ghat Walkway (W_dist)</span>
                  <span className="font-bold text-white">{weightDistance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={weightDistance}
                  onChange={(e) => setWeightDistance(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Decision Trace & Step-by-Step Explanation */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Active Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Engine Allocation Decision Trace</span>
              </h3>
              {recommendation && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Optimization Score: {recommendation.score} / 100
                </span>
              )}
            </div>

            {recommendation ? (
              <div className="space-y-4">
                
                {/* Result Hero Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Optimal Slot Recommendation
                    </span>
                    <div className="text-3xl font-black font-mono text-white tracking-wider mt-0.5">
                      {recommendation.recommended_slot.slot_id}
                    </div>
                    <div className="text-xs text-cyan-300 font-medium mt-1">
                      {recommendation.recommended_zone.zone_name}
                    </div>
                  </div>

                  <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-right">
                    <div className="text-[10px] text-slate-400">Ghat Walking Distance</div>
                    <div className="text-lg font-black text-white font-mono">
                      {recommendation.walking_distance} m
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      ~{recommendation.recommended_zone.walking_time_mins} minutes walk
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Rule Execution Pipeline */}
                <div className="space-y-2.5 text-xs">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Execution Steps:
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <div className="font-semibold text-white">Identify Compatible Zones</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Filtered 5 parking zones for category <strong>{testCategory}</strong>. {testIsVip ? 'VIP protocol clearance bypasses regular lot limits.' : 'Restricted from VIP-only zones.'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <div className="font-semibold text-white">Exclude Unavailable & Maintenance Slots</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Occupied, reserved, and maintenance slots excluded from active allocation pool.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <div className="font-semibold text-white">Multi-Objective Zone Ranking</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Top ranked zone is <strong>{recommendation.recommended_zone.zone_name}</strong> with {recommendation.recommended_zone.congestion_level} congestion and shortest pilgrimage transit time.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      <div className="font-semibold text-white">Select Individual Bay</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Allocated Bay <strong>{recommendation.recommended_slot.slot_id}</strong> {testIsAccessible ? '(♿ Priority Accessible Bay)' : '(Row nearest to pedestrian gate)'}.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification summary */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs">
                  <div className="font-bold text-cyan-300 mb-1">Human-Readable Justification:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {recommendation.reason}
                  </p>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-900/40 space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto" />
                <div className="font-bold text-sm">No Eligible Slots Available!</div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  All parking zones for {testCategory} are currently at 100% capacity. The driver guidance system will redirect arrivals to outer satellite parking.
                </p>
              </div>
            )}

          </div>

          {/* Fallback & Safety Rules Note */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Statutory Safety Overrides</span>
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-400">
              Per Smart Pushkaralu 2027 Safety Guidelines, VIP and protocol priority status shall <strong>never</strong> override emergency access corridors, fire tender lanes, or structural bridge load restrictions.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
