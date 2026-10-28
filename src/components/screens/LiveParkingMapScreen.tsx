import React, { useState, useMemo } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  ParkingSlot,
  VehicleCategory,
  SlotStatus,
} from '../../types';
import {
  Search,
  Filter,
  Car,
  Bus,
  Bike,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  AlertOctagon,
  X,
  LogIn,
  LogOut,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const LiveParkingMapScreen: React.FC = () => {
  const {
    slots,
    zones,
    userRole,
    manualAllocateSlot,
    manualReleaseSlot,
    toggleSlotMaintenance,
    handleVehicleEntry,
    handleVehicleExit,
  } = useParking();

  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<SlotStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected slot for inspection modal/drawer
  const [inspectedSlot, setInspectedSlot] = useState<ParkingSlot | null>(null);

  // Manual entry modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPlate, setManualPlate] = useState('');
  const [manualError, setManualError] = useState('');

  // Filter slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Zone filter
      if (selectedZoneId !== 'ALL' && slot.zone_id !== selectedZoneId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && slot.slot_type !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && slot.occupancy_status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toUpperCase();
        const matchesSlotId = slot.slot_id.toUpperCase().includes(query);
        const matchesPlate = slot.current_plate ? slot.current_plate.toUpperCase().includes(query) : false;
        return matchesSlotId || matchesPlate;
      }
      return true;
    });
  }, [slots, selectedZoneId, selectedCategory, statusFilter, searchQuery]);

  // Group slots by Zone for organized display
  const zonesToDisplay = useMemo(() => {
    if (selectedZoneId === 'ALL') return zones;
    return zones.filter((z) => z.zone_id === selectedZoneId);
  }, [zones, selectedZoneId]);

  const handleSelectSlot = (slot: ParkingSlot) => {
    setInspectedSlot(slot);
    setManualError('');
  };

  const handleConfirmManualAllocate = () => {
    if (!inspectedSlot) return;
    if (!manualPlate.trim()) {
      setManualError('Please enter a valid registration number');
      return;
    }
    const success = manualAllocateSlot(inspectedSlot.slot_id, manualPlate, inspectedSlot.slot_type);
    if (success) {
      setIsManualModalOpen(false);
      setManualPlate('');
      // Refresh inspected slot
      const updated = slots.find((s) => s.slot_id === inspectedSlot.slot_id);
      setInspectedSlot(updated || null);
    } else {
      setManualError('Failed to allocate slot (slot may no longer be available)');
    }
  };

  const handleConfirmRelease = () => {
    if (!inspectedSlot) return;
    manualReleaseSlot(inspectedSlot.slot_id);
    const updated = slots.find((s) => s.slot_id === inspectedSlot.slot_id);
    setInspectedSlot(updated || null);
  };

  const handleToggleMaintenance = () => {
    if (!inspectedSlot) return;
    toggleSlotMaintenance(inspectedSlot.slot_id);
    const updated = slots.find((s) => s.slot_id === inspectedSlot.slot_id);
    setInspectedSlot(updated || null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Interactive 2D Parking Slot Layout</span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time space occupancy status across Godavari riverfront ghats. Click any slot to view telemetry or manage allocation.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span>Reserved</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-600 shadow-sm" />
              <span>Maintenance</span>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Slot ID or Plate (e.g. AP 39 XX 1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Zones ({zones.length} Ghat Locations)</option>
            {zones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.zone_name} ({z.capacity} slots)
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="CAR">Cars Only</option>
            <option value="BUS">Buses Only</option>
            <option value="BIKE">Bikes Only</option>
            <option value="VIP">VIP Fleet Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Slot Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="OCCUPIED">Occupied Only</option>
            <option value="RESERVED">Reserved Only</option>
            <option value="MAINTENANCE">Maintenance Only</option>
          </select>

        </div>
      </div>

      {/* Main Grid: Zones and Slots Layout */}
      <div className="space-y-8">
        {zonesToDisplay.map((zone) => {
          const zoneSlots = filteredSlots.filter((s) => s.zone_id === zone.zone_id);
          if (zoneSlots.length === 0 && (selectedCategory !== 'ALL' || statusFilter !== 'ALL' || searchQuery)) {
            return null;
          }

          const totalZoneSlots = slots.filter((s) => s.zone_id === zone.zone_id);
          const occupiedInZone = totalZoneSlots.filter((s) => s.occupancy_status === 'OCCUPIED').length;
          const availableInZone = totalZoneSlots.filter((s) => s.occupancy_status === 'AVAILABLE').length;

          return (
            <div
              key={zone.zone_id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
            >
              {/* Zone Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-base text-white tracking-wide">
                      {zone.zone_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {zone.vehicle_category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      zone.operational_status === 'OPEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {zone.operational_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {zone.location_name} • Walking: {zone.walking_distance_meters}m (~{zone.walking_time_mins} mins) • Gate: {zone.gate_id}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400">
                    <strong>{availableInZone}</strong> Free
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-rose-400">
                    <strong>{occupiedInZone}</strong> Occupied
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-300">
                    <strong>{zone.capacity}</strong> Total
                  </span>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2.5">
                {zoneSlots.map((slot) => {
                  const isAvailable = slot.occupancy_status === 'AVAILABLE';
                  const isOccupied = slot.occupancy_status === 'OCCUPIED';
                  const isReserved = slot.occupancy_status === 'RESERVED';
                  const isMaintenance = slot.occupancy_status === 'MAINTENANCE';

                  const isSelected = inspectedSlot?.slot_id === slot.slot_id;

                  let bgStyle = 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500';
                  if (isAvailable) {
                    bgStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50';
                  } else if (isOccupied) {
                    bgStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-900/50';
                  } else if (isReserved) {
                    bgStyle = 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/50';
                  } else if (isMaintenance) {
                    bgStyle = 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-800';
                  }

                  return (
                    <button
                      key={slot.slot_id}
                      onClick={() => handleSelectSlot(slot)}
                      className={`relative p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer h-20 ${bgStyle} ${
                        isSelected ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30' : ''
                      }`}
                      title={`Slot: ${slot.slot_id} | Status: ${slot.occupancy_status} ${slot.current_plate ? `| Plate: ${slot.current_plate}` : ''}`}
                    >
                      {/* Top Slot Header */}
                      <div className="w-full flex items-center justify-between text-[10px] font-mono leading-none">
                        <span className="font-bold">{slot.slot_id}</span>
                        {slot.is_accessible && (
                          <span className="text-[9px] bg-cyan-600 text-white rounded px-1">♿</span>
                        )}
                      </div>

                      {/* Center Status Icon / Car Indicator */}
                      <div className="my-1">
                        {isOccupied ? (
                          <div className="flex flex-col items-center">
                            <Car className="w-5 h-5 text-rose-400" />
                            <span className="text-[8px] font-mono font-bold text-white truncate max-w-[58px] mt-0.5">
                              {slot.current_plate ? slot.current_plate.split(' ').slice(-2).join(' ') : 'CAR'}
                            </span>
                          </div>
                        ) : isAvailable ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-80" />
                        ) : isReserved ? (
                          <Crown className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Wrench className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      {/* Bottom Status Tag */}
                      <span className="text-[9px] uppercase font-bold tracking-tighter opacity-90">
                        {isOccupied ? 'Occupied' : isAvailable ? 'Open' : isReserved ? 'Rsrv' : 'Maint'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Telemetry Modal / Drawer */}
      {inspectedSlot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  inspectedSlot.occupancy_status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' :
                  inspectedSlot.occupancy_status === 'OCCUPIED' ? 'bg-rose-500/20 text-rose-400' :
                  inspectedSlot.occupancy_status === 'RESERVED' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Slot Telemetry: <span className="font-mono text-cyan-400">{inspectedSlot.slot_id}</span>
                  </h3>
                  <div className="text-xs text-slate-400">
                    Zone: {inspectedSlot.zone_id} • Type: {inspectedSlot.slot_type}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectedSlot(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slot Details Body */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Current Status:</span>
                <div className="font-bold text-sm mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-xs uppercase font-mono ${
                    inspectedSlot.occupancy_status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    inspectedSlot.occupancy_status === 'OCCUPIED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    inspectedSlot.occupancy_status === 'RESERVED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {inspectedSlot.occupancy_status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Special Designation:</span>
                <div className="font-bold text-slate-200 mt-0.5">
                  {inspectedSlot.is_accessible ? '♿ Accessible (Divyangjan)' : inspectedSlot.is_reserved ? '⭐ VIP Reserved' : 'Standard Pilgrim Slot'}
                </div>
              </div>

              {inspectedSlot.current_plate && (
                <div className="col-span-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
                  <span className="text-cyan-300 font-medium">Parked Vehicle Registration:</span>
                  <div className="text-lg font-mono font-black text-white tracking-widest mt-0.5">
                    {inspectedSlot.current_plate}
                  </div>
                  {inspectedSlot.occupied_at && (
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Entry Time: {new Date(inspectedSlot.occupied_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Operator Actions on Slot */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Operator Actions:</div>
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Manual Allocate (if available) */}
                {inspectedSlot.occupancy_status === 'AVAILABLE' && (
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Manually Allocate Vehicle</span>
                  </button>
                )}

                {/* Release Slot (if occupied) */}
                {inspectedSlot.occupancy_status === 'OCCUPIED' && (
                  <button
                    onClick={handleConfirmRelease}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Release Vehicle / Clear Slot</span>
                  </button>
                )}

                {/* Toggle Maintenance */}
                <button
                  onClick={handleToggleMaintenance}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                >
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>
                    {inspectedSlot.occupancy_status === 'MAINTENANCE' ? 'Mark Available' : 'Mark Maintenance'}
                  </span>
                </button>
              </div>
            </div>

            {/* Manual Plate Assignment Inline Form */}
            {isManualModalOpen && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-3">
                <div className="text-xs font-bold text-cyan-300">
                  Assign Vehicle to Slot {inspectedSlot.slot_id}
                </div>
                <input
                  type="text"
                  placeholder="Enter Plate (e.g. AP 39 XX 1234)"
                  value={manualPlate}
                  onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase"
                  autoFocus
                />
                {manualError && (
                  <div className="text-xs text-rose-400 font-medium">{manualError}</div>
                )}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmManualAllocate}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
