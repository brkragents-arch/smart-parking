import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  LogIn,
  Car,
  Bus,
  Bike,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Compass,
  MapPin,
  Clock,
} from 'lucide-react';
import { VehicleCategory, ParkingSession, AllocationRecommendation } from '../../types';
import { normalizeRegistrationNumber, SAMPLE_VEHICLES } from '../../utils/anprEngine';
import { allocateOptimalSlot } from '../../utils/allocationEngine';
import { ParkingTicketModal } from '../common/ParkingTicketModal';

interface VehicleEntryScreenProps {
  initialPlate?: string;
  initialCategory?: VehicleCategory;
}

export const VehicleEntryScreen: React.FC<VehicleEntryScreenProps> = ({
  initialPlate = 'AP 39 XX 1234',
  initialCategory = 'CAR',
}) => {
  const {
    zones,
    slots,
    sessions,
    handleVehicleEntry,
    getZoneById,
  } = useParking();

  const [plateNumber, setPlateNumber] = useState<string>(initialPlate);
  const [category, setCategory] = useState<VehicleCategory>(initialCategory);
  const [isVip, setIsVip] = useState<boolean>(initialCategory === 'VIP');
  const [isAccessible, setIsAccessible] = useState<boolean>(false);
  const [selectedGate, setSelectedGate] = useState<string>('GATE-01-NORTH');

  // Preview allocation recommendation
  const [previewAlloc, setPreviewAlloc] = useState<AllocationRecommendation | null>(null);

  // Barrier status animation
  const [barrierStatus, setBarrierStatus] = useState<'LOWERED' | 'RAISING' | 'RAISED'>('LOWERED');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ticket modal
  const [completedSession, setCompletedSession] = useState<ParkingSession | null>(null);

  // Recalculate allocation recommendation whenever inputs change
  useEffect(() => {
    const norm = normalizeRegistrationNumber(plateNumber);
    if (!norm) {
      setPreviewAlloc(null);
      return;
    }

    const rec = allocateOptimalSlot(
      {
        vehicleCategory: category,
        isVip,
        isAccessible,
        registrationNumber: norm,
      },
      zones,
      slots
    );
    setPreviewAlloc(rec);
  }, [plateNumber, category, isVip, isAccessible, zones, slots]);

  // Check duplicate active vehicle
  const duplicateActiveSession = sessions.find(
    (s) =>
      s.session_status === 'ACTIVE' &&
      s.registration_number === normalizeRegistrationNumber(plateNumber)
  );

  const handleConfirmEntry = async () => {
    setErrorMessage('');
    const norm = normalizeRegistrationNumber(plateNumber);
    if (!norm) {
      setErrorMessage('Please enter a valid registration number.');
      return;
    }

    const res = await handleVehicleEntry({
      registrationNumber: norm,
      vehicleCategory: category,
      isVip,
      isAccessible,
      gateId: selectedGate,
    });

    if (res.success && res.session) {
      // Trigger barrier raise animation
      setBarrierStatus('RAISING');
      setTimeout(() => setBarrierStatus('RAISED'), 600);
      setTimeout(() => setBarrierStatus('LOWERED'), 4000);

      setCompletedSession(res.session);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              Module E • Ingress Gate Management
            </span>
            <span className="text-xs text-slate-400">Pushkaralu Inbound Checkpoint</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-400" />
            <span>Vehicle Entry & Smart Slot Allocation Dispatch</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronizes automated camera capture with rule-based slot allocation, verifies passes, prints tickets, and controls barrier access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Entry Gate:</span>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            <option value="GATE-01-NORTH">Gate 1 - Kotilingala North Approach</option>
            <option value="GATE-02-CENTRAL">Gate 2 - Main Pushkar Ghat Approach</option>
            <option value="GATE-03-BUS-SOUTH">Gate 3 - Heavy Bus South Bay</option>
            <option value="GATE-04-BIKE-EAST">Gate 4 - Two-Wheeler East Approach</option>
            <option value="GATE-05-VIP-SPECIAL">Gate 5 - Protocol VIP VIP Enclave</option>
          </select>
        </div>
      </div>

      {/* Main Ingress Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Ingress Form & Options */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>Step 1: Vehicle Identification & Category Selection</span>
          </h3>

          {/* Registration Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              License Plate Registration Number:
            </label>
            <div className="relative">
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AP 39 XX 1234"
                className="w-full bg-slate-950 border-2 border-cyan-500/50 focus:border-cyan-400 rounded-xl px-4 py-3 text-lg font-black text-white font-mono tracking-widest uppercase focus:outline-none shadow-inner"
              />
              <span className="absolute right-3 top-3 text-[10px] font-bold px-2 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ANPR Synced
              </span>
            </div>
            
            {/* Quick preset selector buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Quick Samples:</span>
              {SAMPLE_VEHICLES.slice(0, 4).map((s) => (
                <button
                  key={s.plate}
                  type="button"
                  onClick={() => {
                    setPlateNumber(s.plate);
                    setCategory(s.category);
                    setIsVip(s.category === 'VIP');
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {s.plate}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Vehicle Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'CAR' as const, label: 'Car / SUV', icon: Car, color: 'text-emerald-400' },
                { type: 'BUS' as const, label: 'Pilgrim Bus', icon: Bus, color: 'text-cyan-400' },
                { type: 'BIKE' as const, label: 'Two-Wheeler', icon: Bike, color: 'text-amber-400' },
                { type: 'VIP' as const, label: 'VIP Convoy', icon: Crown, color: 'text-rose-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setCategory(item.type);
                      if (item.type === 'VIP') setIsVip(true);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${item.color}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Priority & Accessibility Checkboxes */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Special Requirements & Passes:</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => setIsAccessible(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>♿ Accessible Bay (Divyangjan / Elderly)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>⭐ Protocol VIP Clearance Pass</span>
              </label>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Repeat Entry Warning */}
          {duplicateActiveSession && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Active Parking Session Conflict:</strong>
                <p className="mt-0.5">
                  Vehicle {plateNumber} is already inside at Slot <strong>{duplicateActiveSession.slot_id}</strong>.
                  Clear exit before registering a new entry.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): AI Allocation Preview & Gate Action */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Allocation Recommendation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Intelligent Slot Recommendation</span>
              </h3>
              {previewAlloc && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Score: {previewAlloc.score}/100
                </span>
              )}
            </div>

            {previewAlloc ? (
              <div className="space-y-4">
                
                {/* Big Allocated Slot Display */}
                <div className="p-4 rounded-xl bg-slate-950 border-2 border-emerald-500/40 text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Assigned Slot ID
                  </div>
                  <div className="text-3xl font-black font-mono tracking-widest text-white">
                    {previewAlloc.recommended_slot.slot_id}
                  </div>
                  <div className="text-xs font-bold text-cyan-300">
                    {previewAlloc.recommended_zone.zone_name}
                  </div>
                </div>

                {/* Algorithmic Reason Explanation */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Allocation Engine Justification:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {previewAlloc.reason}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Walking Distance</div>
                    <div className="font-bold text-white font-mono mt-0.5">
                      {previewAlloc.walking_distance} meters
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Zone Congestion</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">
                      {previewAlloc.congestion_status}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Enter vehicle details to generate an allocation recommendation.
              </div>
            )}

            {/* Boom Barrier Gate Indicator */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Physical Boom Barrier:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  barrierStatus === 'LOWERED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  barrierStatus === 'RAISING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {barrierStatus === 'LOWERED' ? 'Barrier Closed' : barrierStatus === 'RAISING' ? 'Raising Arm...' : 'Barrier Open'}
                </span>
              </div>

              {/* Graphic of Boom Barrier */}
              <div className="relative h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center px-4 overflow-hidden">
                {/* Gate Post */}
                <div className="w-5 h-8 bg-amber-500 rounded-sm shadow-md" />
                {/* Barrier Arm */}
                <div
                  className={`h-2 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-full transition-all duration-700 origin-left ml-1 ${
                    barrierStatus === 'RAISED'
                      ? 'w-48 -rotate-45'
                      : barrierStatus === 'RAISING'
                      ? 'w-48 -rotate-25'
                      : 'w-48 rotate-0'
                  }`}
                />
              </div>

              <div className="text-[10px] text-slate-500 text-center">
                Statutory Notice: Physical barrier triggers only upon cryptographic token generation.
              </div>
            </div>

            {/* Confirm Entry Action Button */}
            <button
              onClick={handleConfirmEntry}
              disabled={Boolean(duplicateActiveSession) || !previewAlloc}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                duplicateActiveSession || !previewAlloc
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Confirm Allocation & Open Barrier</span>
            </button>

          </div>

        </div>

      </div>

      {/* Ticket Modal popup on success */}
      {completedSession && (
        <ParkingTicketModal
          session={completedSession}
          zone={getZoneById(completedSession.zone_id)}
          onClose={() => setCompletedSession(null)}
        />
      )}

    </div>
  );
};
