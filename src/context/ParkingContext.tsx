import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ParkingZone,
  ParkingSlot,
  Vehicle,
  ParkingSession,
  ANPREvent,
  AuditLog,
  SystemSettings,
  UserRole,
  VehicleCategory,
  AllocationRecommendation,
} from '../types';
import {
  INITIAL_ZONES,
  generateInitialSlots,
  INITIAL_ANPR_EVENTS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SETTINGS,
} from '../data/initialData';
import { allocateOptimalSlot } from '../utils/allocationEngine';
import { normalizeRegistrationNumber, SAMPLE_VEHICLES } from '../utils/anprEngine';

export interface CategoryStats {
  category: VehicleCategory;
  name: string;
  totalCapacity: number;
  occupied: number;
  available: number;
  occupancyPercentage: number;
  entryCount: number;
  exitCount: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED';
}

export interface DashboardSummary {
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  overallOccupancyPercentage: number;
  totalEntriesToday: number;
  totalExitsToday: number;
  congestionStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
  categoryStats: Record<VehicleCategory, CategoryStats>;
}

interface ParkingContextType {
  zones: ParkingZone[];
  slots: ParkingSlot[];
  sessions: ParkingSession[];
  vehicles: Vehicle[];
  anprEvents: ANPREvent[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  userRole: UserRole;
  isSimulationActive: boolean;
  summary: DashboardSummary;
  setUserRole: (role: UserRole) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  toggleSimulation: () => void;
  resetToDemoData: () => void;
  handleVehicleEntry: (params: {
    registrationNumber: string;
    vehicleCategory: VehicleCategory;
    isVip?: boolean;
    isAccessible?: boolean;
    gateId?: string;
    overrideSlotId?: string;
  }) => Promise<{ success: boolean; session?: ParkingSession; message: string; allocation?: AllocationRecommendation }>;
  handleVehicleExit: (params: {
    registrationNumberOrToken: string;
    exitGateId?: string;
  }) => Promise<{ success: boolean; message: string; releasedSlotId?: string; durationMins?: number }>;
  manualAllocateSlot: (slotId: string, plate: string, category: VehicleCategory) => boolean;
  manualReleaseSlot: (slotId: string) => boolean;
  toggleSlotMaintenance: (slotId: string) => void;
  updateZoneStatus: (zoneId: string, status: ParkingZone['operational_status']) => void;
  correctANPREvent: (eventId: string, correctedPlate: string, notes?: string) => void;
  getSlotById: (slotId: string) => ParkingSlot | undefined;
  getZoneById: (zoneId: string) => ParkingZone | undefined;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_pushkaralu_parking_v1';

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with default data
  const [zones, setZones] = useState<ParkingZone[]>(() => INITIAL_ZONES);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [anprEvents, setAnprEvents] = useState<ANPREvent[]>(INITIAL_ANPR_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Bootstrap seed slots
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.slots && parsed.sessions && parsed.zones) {
          setZones(parsed.zones);
          setSlots(parsed.slots);
          setVehicles(parsed.vehicles || []);
          setSessions(parsed.sessions);
          setAnprEvents(parsed.anprEvents || INITIAL_ANPR_EVENTS);
          setAuditLogs(parsed.auditLogs || INITIAL_AUDIT_LOGS);
          setSettings(parsed.settings || DEFAULT_SETTINGS);
          return;
        }
      } catch (err) {
        console.error('Failed to parse cached parking data, falling back to seed:', err);
      }
    }

    const { slots: initialSlots, vehicles: initialVehicles, sessions: initialSessions } = generateInitialSlots();
    setSlots(initialSlots);
    setVehicles(initialVehicles);
    setSessions(initialSessions);
  }, []);

  // Save to local storage on key updates
  useEffect(() => {
    if (slots.length > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          zones,
          slots,
          vehicles,
          sessions,
          anprEvents,
          auditLogs,
          settings,
        })
      );
    }
  }, [zones, slots, vehicles, sessions, anprEvents, auditLogs, settings]);

  // Log an audit trail entry
  const logAudit = useCallback(
    (action: string, record: string, result: 'SUCCESS' | 'WARNING' | 'FAILED', details: string) => {
      const newLog: AuditLog = {
        log_id: `AUD-${Date.now().toString().slice(-6)}`,
        user_id: userRole === 'ADMIN' ? 'USR-ADMIN' : (userRole === 'OPERATOR' ? 'USR-OP01' : 'USR-POLICE'),
        user_name: userRole === 'ADMIN' ? 'Superintendent (Admin)' : (userRole === 'OPERATOR' ? 'K. Prasad (Control Room)' : 'Traffic Inspector'),
        user_role: userRole,
        action,
        affected_record: record,
        timestamp: new Date().toISOString(),
        result,
        details,
      };
      setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    [userRole]
  );

  // Dynamic Dashboard summary calculations derived strictly from slot states
  const summary: DashboardSummary = useMemo(() => {
    const categories: VehicleCategory[] = ['CAR', 'BUS', 'BIKE', 'VIP'];
    const catMap: Record<VehicleCategory, CategoryStats> = {} as any;

    let totalCap = 0;
    let totalOcc = 0;
    let totalAvail = 0;

    categories.forEach((cat) => {
      const matchingSlots = slots.filter((s) => s.slot_type === cat);
      const cap = matchingSlots.length;
      const occ = matchingSlots.filter((s) => s.occupancy_status === 'OCCUPIED').length;
      const avail = matchingSlots.filter((s) => s.occupancy_status === 'AVAILABLE').length;
      const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;

      // Status logic
      let status: 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED' = 'AVAILABLE';
      if (pct >= 95) status = 'FULL';
      else if (pct >= 75) status = 'LIMITED';

      const entryCount = sessions.filter((s) => s.vehicle_category === cat).length;
      const exitCount = sessions.filter((s) => s.vehicle_category === cat && s.session_status === 'COMPLETED').length;

      totalCap += cap;
      totalOcc += occ;
      totalAvail += avail;

      catMap[cat] = {
        category: cat,
        name: cat === 'CAR' ? 'Car Parking' : cat === 'BUS' ? 'Bus Parking' : cat === 'BIKE' ? 'Bike Parking' : 'VIP Parking',
        totalCapacity: cap,
        occupied: occ,
        available: avail,
        occupancyPercentage: pct,
        entryCount,
        exitCount,
        status,
      };
    });

    const overallPct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;
    let congestion: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (overallPct >= 88) congestion = 'CRITICAL';
    else if (overallPct >= 70) congestion = 'HIGH';
    else if (overallPct >= 45) congestion = 'MODERATE';

    const entriesToday = sessions.length;
    const exitsToday = sessions.filter((s) => s.session_status === 'COMPLETED').length;

    return {
      totalCapacity: totalCap || 330,
      totalOccupied: totalOcc,
      totalAvailable: totalAvail,
      overallOccupancyPercentage: overallPct,
      totalEntriesToday: entriesToday,
      totalExitsToday: exitsToday,
      congestionStatus: congestion,
      lastUpdated,
      categoryStats: catMap,
    };
  }, [slots, sessions, lastUpdated]);

  // Handle vehicle entry workflow
  const handleVehicleEntry = useCallback(
    async ({
      registrationNumber,
      vehicleCategory,
      isVip = false,
      isAccessible = false,
      gateId = 'GATE-01-NORTH',
      overrideSlotId,
    }: {
      registrationNumber: string;
      vehicleCategory: VehicleCategory;
      isVip?: boolean;
      isAccessible?: boolean;
      gateId?: string;
      overrideSlotId?: string;
    }) => {
      const normPlate = normalizeRegistrationNumber(registrationNumber);
      if (!normPlate) {
        return { success: false, message: 'Invalid or empty registration number.' };
      }

      // Check for repeat / duplicate active session
      const existingActive = sessions.find(
        (s) => s.registration_number === normPlate && s.session_status === 'ACTIVE'
      );
      if (existingActive) {
        logAudit(
          'DUPLICATE_ENTRY_REJECTED',
          normPlate,
          'WARNING',
          `Vehicle ${normPlate} already has active parking session ${existingActive.token_number} in slot ${existingActive.slot_id}`
        );
        return {
          success: false,
          message: `Repeat Entry Alert: Vehicle ${normPlate} is already parked in Slot ${existingActive.slot_id} (Token: ${existingActive.token_number}).`,
        };
      }

      // Find or allocate slot
      let targetSlot: ParkingSlot | undefined;
      let targetZone: ParkingZone | undefined;
      let allocRec: AllocationRecommendation | null = null;

      if (overrideSlotId) {
        targetSlot = slots.find((s) => s.slot_id === overrideSlotId && s.occupancy_status === 'AVAILABLE');
        if (!targetSlot) {
          return { success: false, message: `Slot ${overrideSlotId} is not available.` };
        }
        targetZone = zones.find((z) => z.zone_id === targetSlot!.zone_id);
      } else {
        allocRec = allocateOptimalSlot(
          {
            vehicleCategory,
            isVip,
            isAccessible,
            registrationNumber: normPlate,
          },
          zones,
          slots
        );

        if (!allocRec) {
          logAudit(
            'ALLOCATION_FAILED_FULL',
            normPlate,
            'FAILED',
            `No available parking spaces for category ${vehicleCategory}. All compatible zones are full.`
          );
          return {
            success: false,
            message: `Parking Full: All ${vehicleCategory} parking lots are currently at 100% capacity. Divert vehicle to peripheral satellite parking.`,
          };
        }

        targetSlot = allocRec.recommended_slot;
        targetZone = allocRec.recommended_zone;
      }

      if (!targetSlot || !targetZone) {
        return { success: false, message: 'Could not determine slot allocation.' };
      }

      const now = new Date().toISOString();
      const vehicleId = `VEH-${Date.now().toString().slice(-6)}`;
      const tokenNumber = `TKN-${targetSlot.slot_id}-${Date.now().toString().slice(-4)}`;

      // Update slot state (Atomic / Concurrency safe)
      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.slot_id === targetSlot!.slot_id
            ? {
                ...s,
                occupancy_status: 'OCCUPIED',
                current_vehicle_id: vehicleId,
                current_plate: normPlate,
                occupied_at: now,
                last_updated: now,
              }
            : s
        )
      );

      // Create new vehicle record
      const newVehicle: Vehicle = {
        vehicle_id: vehicleId,
        registration_number: normPlate,
        vehicle_category: vehicleCategory,
        authorized_status: isVip ? 'VIP' : 'REGULAR',
        registration_source: 'ANPR_CAMERA',
      };
      setVehicles((prev) => [newVehicle, ...prev]);

      // Create parking session
      const newSession: ParkingSession = {
        session_id: `SESS-${Date.now().toString().slice(-7)}`,
        token_number: tokenNumber,
        vehicle_id: vehicleId,
        registration_number: normPlate,
        vehicle_category: vehicleCategory,
        slot_id: targetSlot.slot_id,
        zone_id: targetZone.zone_id,
        entry_time: now,
        session_status: 'ACTIVE',
        allocation_method: overrideSlotId ? 'MANUAL_OPERATOR' : 'AUTOMATIC_INTELLIGENT',
        entry_gate_id: gateId,
        fee_amount: 0,
        is_vip: isVip,
        allocation_reason: allocRec ? allocRec.reason : `Manual override assignment by ${userRole}`,
      };
      setSessions((prev) => [newSession, ...prev]);

      // Create ANPR capture event
      const newAnprEvent: ANPREvent = {
        event_id: `EVT-${Date.now().toString().slice(-6)}`,
        camera_id: `CAM-${gateId}`,
        gate_id: gateId,
        captured_timestamp: now,
        extracted_registration: normPlate,
        confidence_score: 97.8,
        verification_status: 'VERIFIED',
        image_url: '/pushkaralu_concept_reference.jpg',
        vehicle_category: vehicleCategory,
        is_repeat_entry: false,
        operator_notes: `Allocated Slot ${targetSlot.slot_id} in ${targetZone.zone_name}`,
      };
      setAnprEvents((prev) => [newAnprEvent, ...prev.slice(0, 49)]);

      setLastUpdated(now);

      logAudit(
        'VEHICLE_ENTRY',
        normPlate,
        'SUCCESS',
        `Assigned ${targetSlot.slot_id} (${targetZone.zone_name}) to ${normPlate}. Token: ${tokenNumber}`
      );

      return {
        success: true,
        session: newSession,
        allocation: allocRec || undefined,
        message: `Vehicle ${normPlate} allocated to Slot ${targetSlot.slot_id} (${targetZone.zone_name}).`,
      };
    },
    [sessions, slots, zones, logAudit, userRole]
  );

  // Handle vehicle exit workflow
  const handleVehicleExit = useCallback(
    async ({
      registrationNumberOrToken,
      exitGateId = 'GATE-EXIT-01',
    }: {
      registrationNumberOrToken: string;
      exitGateId?: string;
    }) => {
      const query = registrationNumberOrToken.trim().toUpperCase();
      const normPlate = normalizeRegistrationNumber(query);

      // Search active session by plate or token
      const activeSession = sessions.find(
        (s) =>
          s.session_status === 'ACTIVE' &&
          (s.registration_number === normPlate ||
            s.registration_number.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
            s.token_number === query ||
            s.slot_id === query)
      );

      if (!activeSession) {
        return {
          success: false,
          message: `No active parking session found for "${registrationNumberOrToken}". Please verify plate number or token.`,
        };
      }

      const now = new Date().toISOString();
      const entryTime = new Date(activeSession.entry_time).getTime();
      const exitTime = new Date(now).getTime();
      const durationMins = Math.max(1, Math.round((exitTime - entryTime) / 60000));

      // Release slot atomically
      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.slot_id === activeSession.slot_id
            ? {
                ...s,
                occupancy_status: 'AVAILABLE',
                current_vehicle_id: undefined,
                current_plate: undefined,
                occupied_at: undefined,
                last_updated: now,
              }
            : s
        )
      );

      // Update session to completed
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.session_id === activeSession.session_id
            ? {
                ...s,
                session_status: 'COMPLETED',
                exit_time: now,
                exit_gate_id: exitGateId,
              }
            : s
        )
      );

      setLastUpdated(now);

      logAudit(
        'VEHICLE_EXIT',
        activeSession.registration_number,
        'SUCCESS',
        `Released slot ${activeSession.slot_id} after ${durationMins} minutes. Token: ${activeSession.token_number}`
      );

      return {
        success: true,
        message: `Slot ${activeSession.slot_id} released successfully for vehicle ${activeSession.registration_number}. Duration: ${Math.floor(durationMins / 60)}h ${durationMins % 60}m.`,
        releasedSlotId: activeSession.slot_id,
        durationMins,
      };
    },
    [sessions, logAudit]
  );

  // Manual slot allocation by operator
  const manualAllocateSlot = useCallback(
    (slotId: string, plate: string, category: VehicleCategory) => {
      const slot = slots.find((s) => s.slot_id === slotId);
      if (!slot || slot.occupancy_status !== 'AVAILABLE') return false;

      const norm = normalizeRegistrationNumber(plate) || `AP 39 MAN ${slotId.slice(-3)}`;
      const now = new Date().toISOString();

      setSlots((prev) =>
        prev.map((s) =>
          s.slot_id === slotId
            ? {
                ...s,
                occupancy_status: 'OCCUPIED',
                current_plate: norm,
                occupied_at: now,
                last_updated: now,
              }
            : s
        )
      );

      const newSession: ParkingSession = {
        session_id: `SESS-${Date.now().toString().slice(-7)}`,
        token_number: `TKN-${slotId}-${Date.now().toString().slice(-4)}`,
        vehicle_id: `VEH-${Date.now().toString().slice(-6)}`,
        registration_number: norm,
        vehicle_category: category,
        slot_id: slotId,
        zone_id: slot.zone_id,
        entry_time: now,
        session_status: 'ACTIVE',
        allocation_method: 'MANUAL_OPERATOR',
        entry_gate_id: 'GATE-MANUAL',
        fee_amount: 0,
        is_vip: category === 'VIP',
        allocation_reason: `Manual allocation by ${userRole} from Live Parking Map`,
      };
      setSessions((prev) => [newSession, ...prev]);

      logAudit('MANUAL_ALLOCATION', slotId, 'SUCCESS', `Operator manually allocated ${slotId} to ${norm}`);
      setLastUpdated(now);
      return true;
    },
    [slots, userRole, logAudit]
  );

  // Manual slot release
  const manualReleaseSlot = useCallback(
    (slotId: string) => {
      const slot = slots.find((s) => s.slot_id === slotId);
      if (!slot || slot.occupancy_status === 'AVAILABLE') return false;

      const now = new Date().toISOString();
      setSlots((prev) =>
        prev.map((s) =>
          s.slot_id === slotId
            ? {
                ...s,
                occupancy_status: 'AVAILABLE',
                current_vehicle_id: undefined,
                current_plate: undefined,
                occupied_at: undefined,
                last_updated: now,
              }
            : s
        )
      );

      // Complete session if active
      setSessions((prev) =>
        prev.map((s) =>
          s.slot_id === slotId && s.session_status === 'ACTIVE'
            ? { ...s, session_status: 'COMPLETED', exit_time: now }
            : s
        )
      );

      logAudit('MANUAL_RELEASE', slotId, 'SUCCESS', `Slot ${slotId} manually released by ${userRole}`);
      setLastUpdated(now);
      return true;
    },
    [slots, userRole, logAudit]
  );

  // Toggle slot maintenance
  const toggleSlotMaintenance = useCallback(
    (slotId: string) => {
      setSlots((prev) =>
        prev.map((s) => {
          if (s.slot_id === slotId) {
            const nextStatus = s.occupancy_status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
            logAudit('MAINTENANCE_TOGGLE', slotId, 'SUCCESS', `Slot status toggled to ${nextStatus}`);
            return {
              ...s,
              occupancy_status: nextStatus,
              last_updated: new Date().toISOString(),
            };
          }
          return s;
        })
      );
      setLastUpdated(new Date().toISOString());
    },
    [logAudit]
  );

  // Update zone status
  const updateZoneStatus = useCallback(
    (zoneId: string, status: ParkingZone['operational_status']) => {
      setZones((prev) =>
        prev.map((z) => (z.zone_id === zoneId ? { ...z, operational_status: status } : z))
      );
      logAudit('ZONE_STATUS_CHANGE', zoneId, 'SUCCESS', `Zone ${zoneId} operational status set to ${status}`);
      setLastUpdated(new Date().toISOString());
    },
    [logAudit]
  );

  // Correct ANPR Event
  const correctANPREvent = useCallback(
    (eventId: string, correctedPlate: string, notes?: string) => {
      const norm = normalizeRegistrationNumber(correctedPlate);
      setAnprEvents((prev) =>
        prev.map((evt) =>
          evt.event_id === eventId
            ? {
                ...evt,
                extracted_registration: norm,
                verification_status: 'MANUAL_CORRECTED',
                operator_notes: notes || `Corrected by ${userRole} from ${evt.extracted_registration}`,
              }
            : evt
        )
      );
      logAudit('ANPR_OCR_CORRECTION', eventId, 'SUCCESS', `Corrected plate to ${norm}. Notes: ${notes || 'none'}`);
    },
    [userRole, logAudit]
  );

  // Reset to initial demo dataset
  const resetToDemoData = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const { slots: s, vehicles: v, sessions: sess } = generateInitialSlots();
    setZones(INITIAL_ZONES);
    setSlots(s);
    setVehicles(v);
    setSessions(sess);
    setAnprEvents(INITIAL_ANPR_EVENTS);
    setAuditLogs([
      {
        log_id: `AUD-${Date.now().toString().slice(-6)}`,
        user_id: 'USR-RESET',
        user_name: 'System Admin',
        user_role: 'ADMIN',
        action: 'RESET_BENCHMARK',
        affected_record: 'ALL',
        timestamp: new Date().toISOString(),
        result: 'SUCCESS',
        details: 'System restored to initial demo benchmark (200 Cars: 120 occupied / 80 free, 20 Buses: 12/8, 100 Bikes: 45/55, 10 VIP: 5/5).',
      },
    ]);
    setSettings(DEFAULT_SETTINGS);
    setLastUpdated(new Date().toISOString());
  }, []);

  // Toggle live simulation
  const toggleSimulation = useCallback(() => {
    setIsSimulationActive((prev) => !prev);
  }, []);

  // Background simulation runner
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      // 60% chance of arrival, 40% chance of departure
      const isArrival = Math.random() < 0.6;

      if (isArrival) {
        // Pick a random sample vehicle or generate random
        const sample = SAMPLE_VEHICLES[Math.floor(Math.random() * SAMPLE_VEHICLES.length)];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const simPlate = sample.plate.replace(/\d{4}$/, String(randomNum));

        handleVehicleEntry({
          registrationNumber: simPlate,
          vehicleCategory: sample.category,
          isVip: sample.category === 'VIP',
          gateId: sample.category === 'BUS' ? 'GATE-03-BUS-SOUTH' : 'GATE-01-NORTH',
        });
      } else {
        // Exit random active vehicle
        const activeSessions = sessions.filter((s) => s.session_status === 'ACTIVE');
        if (activeSessions.length > 50) {
          const randomSession = activeSessions[Math.floor(Math.random() * activeSessions.length)];
          handleVehicleExit({
            registrationNumberOrToken: randomSession.token_number,
          });
        }
      }
    }, settings.simulation_interval_ms || 4000);

    return () => clearInterval(interval);
  }, [isSimulationActive, sessions, settings.simulation_interval_ms, handleVehicleEntry, handleVehicleExit]);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const getSlotById = useCallback((slotId: string) => slots.find((s) => s.slot_id === slotId), [slots]);
  const getZoneById = useCallback((zoneId: string) => zones.find((z) => z.zone_id === zoneId), [zones]);

  return (
    <ParkingContext.Provider
      value={{
        zones,
        slots,
        sessions,
        vehicles,
        anprEvents,
        auditLogs,
        settings,
        userRole,
        isSimulationActive,
        summary,
        setUserRole,
        updateSettings,
        toggleSimulation,
        resetToDemoData,
        handleVehicleEntry,
        handleVehicleExit,
        manualAllocateSlot,
        manualReleaseSlot,
        toggleSlotMaintenance,
        updateZoneStatus,
        correctANPREvent,
        getSlotById,
        getZoneById,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
