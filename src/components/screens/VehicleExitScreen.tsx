import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  LogOut,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  Bus,
  Bike,
  Crown,
  Receipt,
  MapPin,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { normalizeRegistrationNumber } from '../../utils/anprEngine';

export const VehicleExitScreen: React.FC = () => {
  const { sessions, slots, handleVehicleExit, getZoneById } = useParking();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGate, setSelectedGate] = useState<string>('GATE-EXIT-01');
  const [exitResult, setExitResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Active parked sessions available for quick checkout
  const activeSessions = sessions.filter((s) => s.session_status === 'ACTIVE');

  // Currently inspected session
  const matchedSession = searchQuery.trim()
    ? activeSessions.find(
        (s) =>
          s.registration_number === normalizeRegistrationNumber(searchQuery) ||
          s.registration_number.replace(/\s+/g, '') === searchQuery.replace(/\s+/g, '').toUpperCase() ||
          s.token_number.toUpperCase() === searchQuery.trim().toUpperCase() ||
          s.slot_id.toUpperCase() === searchQuery.trim().toUpperCase()
      )
    : null;

  const handleSelectQuickCheckout = (plate: string) => {
    setSearchQuery(plate);
    setExitResult(null);
    setErrorMessage('');
  };

  const handleProcessExit = async (plateOrToken: string) => {
    setIsProcessing(true);
    setErrorMessage('');
    setExitResult(null);

    const res = await handleVehicleExit({
      registrationNumberOrToken: plateOrToken,
      exitGateId: selectedGate,
    });

    setIsProcessing(false);
    if (res.success) {
      setExitResult(res);
      setSearchQuery('');
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
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">
              Module E • Egress Gate Management
            </span>
            <span className="text-xs text-slate-400">Pushkaralu Outbound Checkpoint</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <LogOut className="w-5 h-5 text-amber-400" />
            <span>Vehicle Exit Verification & Slot Release</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recognizes exiting vehicle via ANPR camera or barcode token, calculates parked dwell time, releases the slot back to the available pool, and logs audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Exit Gate:</span>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            <option value="GATE-EXIT-01">Exit Gate 1 - North Bund Road Out</option>
            <option value="GATE-EXIT-02">Exit Gate 2 - Central Arch Bridge Out</option>
            <option value="GATE-EXIT-03">Exit Gate 3 - South Bus Depot Out</option>
          </select>
        </div>
      </div>

      {/* Main Exit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Search & Verification Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Lookup Exiting Vehicle (Plate or Token)</span>
            <span className="text-xs font-mono text-cyan-400">
              {activeSessions.length} Vehicles Parked Inside
            </span>
          </h3>

          {/* Search Box */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.toUpperCase());
                  setExitResult(null);
                  setErrorMessage('');
                }}
                placeholder="Scan QR token or type Plate (e.g. AP 39 XX 1234)..."
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-3 text-base font-mono font-bold text-white placeholder-slate-500 uppercase focus:outline-none shadow-inner"
                autoFocus
              />
            </div>
          </div>

          {/* Matched Session Inspection Card */}
          {matchedSession ? (
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Active Parking Record Verified
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Token: {matchedSession.token_number}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Vehicle Registration:</div>
                  <div className="text-2xl font-black font-mono tracking-widest text-white mt-0.5">
                    {matchedSession.registration_number}
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">
                    Slot: <strong className="font-mono text-white text-sm">{matchedSession.slot_id}</strong> ({getZoneById(matchedSession.zone_id)?.zone_name || matchedSession.zone_id})
                  </div>
                </div>

                <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-right">
                  <div className="text-[10px] text-slate-400">Entry Timestamp:</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {new Date(matchedSession.entry_time).toLocaleTimeString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Fee: ₹0 (Free Pilgrimage Pass)
                  </div>
                </div>
              </div>

              {/* Confirm Release Button */}
              <button
                onClick={() => handleProcessExit(matchedSession.registration_number)}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>Authorize Exit & Release Slot {matchedSession.slot_id}</span>
              </button>
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              No active session matching "{searchQuery}". Please verify registration plate.
            </div>
          ) : null}

          {/* Quick Click Parked Vehicles (from demo baseline) */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Quick Select Currently Parked Vehicles</span>
              <span className="text-[10px] text-slate-500 font-mono">Click to Checkout</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {activeSessions.slice(0, 10).map((sess) => (
                <button
                  key={sess.session_id}
                  onClick={() => handleSelectQuickCheckout(sess.registration_number)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition">
                      {sess.vehicle_category === 'CAR' ? <Car className="w-4 h-4" /> :
                       sess.vehicle_category === 'BUS' ? <Bus className="w-4 h-4" /> :
                       sess.vehicle_category === 'BIKE' ? <Bike className="w-4 h-4" /> :
                       <Crown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white">
                        {sess.registration_number}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Slot {sess.slot_id}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-cyan-400 font-mono">
                    {new Date(sess.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): Exit Completion Receipt & Gate Status */}
        <div className="lg:col-span-5 space-y-4">
          
          {exitResult ? (
            <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Slot Released Successfully
                  </h3>
                  <div className="text-xs text-emerald-400 font-mono font-medium">
                    Exit Authorization Granted
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Released Slot ID:</span>
                  <span className="font-bold font-mono text-white text-sm">{exitResult.releasedSlotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Dwell Duration:</span>
                  <span className="font-bold text-cyan-300">
                    {Math.floor((exitResult.durationMins || 60) / 60)}h {(exitResult.durationMins || 60) % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Update:</span>
                  <span className="font-bold text-emerald-400">Available (+1 Space Added)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gate Exit Barrier:</span>
                  <span className="font-bold text-emerald-400">Raised / Clearance Sent</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 leading-relaxed">
                {exitResult.message}
              </div>

              <button
                onClick={() => setExitResult(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Process Another Exit
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Exit Protocol Rules</span>
              </h3>
              
              <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
                <li>Exiting vehicles must have their plate number matched against an active parking session.</li>
                <li>Upon exit verification, the associated slot immediately flips back to <strong>AVAILABLE</strong> in the live database.</li>
                <li>Variable message signboards (VMS) dynamically decrement occupied counts across Godavari bridge approaches.</li>
                <li>Audit logs record operator ID, gate ID, exit timestamp, and parked duration.</li>
              </ul>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Tip: Search by license plate (e.g. <strong className="text-slate-200">AP 39 XX 1234</strong>) or slot number (e.g. <strong className="text-slate-200">A-001</strong>).
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
