import { ParkingZone, ParkingSlot, Vehicle, ParkingSession, ANPREvent, AuditLog, SystemSettings } from '../types';

export const INITIAL_ZONES: ParkingZone[] = [
  {
    zone_id: 'ZONE-A',
    zone_name: 'Kotilingala Ghat Parking (Zone A)',
    vehicle_category: 'CAR',
    capacity: 120,
    operational_status: 'OPEN',
    location_name: 'Kotilingala Ghat North Approach, Rajahmundry',
    walking_distance_meters: 250,
    walking_time_mins: 3,
    congestion_level: 'MODERATE',
    gate_id: 'GATE-01-NORTH',
  },
  {
    zone_id: 'ZONE-B',
    zone_name: 'Pushkar Ghat Main Parking (Zone B)',
    vehicle_category: 'CAR',
    capacity: 80,
    operational_status: 'OPEN',
    location_name: 'Main Pushkar Ghat South Approach, Rajahmundry',
    walking_distance_meters: 150,
    walking_time_mins: 2,
    congestion_level: 'HIGH',
    gate_id: 'GATE-02-CENTRAL',
  },
  {
    zone_id: 'ZONE-C',
    zone_name: 'Riverfront Bus Terminal (Zone C)',
    vehicle_category: 'BUS',
    capacity: 20,
    operational_status: 'OPEN',
    location_name: 'Havelock Bridge Terminus & Godavari Bund Road',
    walking_distance_meters: 450,
    walking_time_mins: 6,
    congestion_level: 'LOW',
    gate_id: 'GATE-03-BUS-SOUTH',
  },
  {
    zone_id: 'ZONE-D',
    zone_name: 'Saraswathi Ghat Two-Wheeler Lot (Zone D)',
    vehicle_category: 'BIKE',
    capacity: 100,
    operational_status: 'OPEN',
    location_name: 'Saraswathi Ghat Road, Godavari Bund',
    walking_distance_meters: 180,
    walking_time_mins: 2,
    congestion_level: 'LOW',
    gate_id: 'GATE-04-BIKE-EAST',
  },
  {
    zone_id: 'ZONE-V',
    zone_name: 'VIP & Dignitary Enclave (Zone V)',
    vehicle_category: 'VIP',
    capacity: 10,
    operational_status: 'OPEN',
    location_name: 'Pushkaralu Command Center & Temple VIP Gate',
    walking_distance_meters: 50,
    walking_time_mins: 1,
    congestion_level: 'LOW',
    gate_id: 'GATE-05-VIP-SPECIAL',
  },
];

// Helper to generate seed slots strictly matching demo data:
// Cars: 200 total (Zone A: 120 total, 72 occupied; Zone B: 80 total, 48 occupied -> Total 120 occupied, 80 available)
// Buses: Zone C: 20 total, 12 occupied, 8 available
// Bikes: Zone D: 100 total, 45 occupied, 55 available
// VIP: Zone V: 10 total, 5 occupied, 5 available
export function generateInitialSlots(): { slots: ParkingSlot[]; vehicles: Vehicle[]; sessions: ParkingSession[] } {
  const slots: ParkingSlot[] = [];
  const vehicles: Vehicle[] = [];
  const sessions: ParkingSession[] = [];

  const sampleStatePrefixes = ['AP 39', 'AP 05', 'AP 31', 'TS 09', 'TS 08', 'DL 01', 'MH 12', 'KA 03', 'TN 07'];
  const sampleLetters = ['XX', 'AB', 'EA', 'AK', 'ZZ', 'KM', 'RT', 'BQ'];

  let vehicleCounter = 100;
  let sessionCounter = 1000;

  const now = new Date();

  // Zone A: 120 slots (Cars), 72 occupied, 48 available
  for (let i = 1; i <= 120; i++) {
    const isOccupied = i <= 72;
    const slotId = `A-${String(i).padStart(3, '0')}`;
    const row = String.fromCharCode(65 + Math.floor((i - 1) / 20)); // Row A to F
    const plate = i === 1 
      ? 'AP 39 XX 1234' // Demonstration reference vehicle from user slide!
      : `${sampleStatePrefixes[i % sampleStatePrefixes.length]} ${sampleLetters[i % sampleLetters.length]} ${String(1000 + i).slice(-4)}`;

    const vehicleId = isOccupied ? `VEH-${vehicleCounter++}` : undefined;

    if (isOccupied && vehicleId) {
      vehicles.push({
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'CAR',
        authorized_status: 'REGULAR',
        registration_source: 'ANPR_CAMERA',
        owner_name: i === 1 ? 'Siva Rama Krishna (Pilgrim Pass #4829)' : undefined,
      });

      const entryDate = new Date(now.getTime() - (i * 7 + 15) * 60000);
      sessions.push({
        session_id: `SESS-${sessionCounter++}`,
        token_number: `TKN-A${String(i).padStart(3, '0')}`,
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'CAR',
        slot_id: slotId,
        zone_id: 'ZONE-A',
        entry_time: entryDate.toISOString(),
        session_status: 'ACTIVE',
        allocation_method: 'AUTOMATIC_INTELLIGENT',
        entry_gate_id: 'GATE-01-NORTH',
        fee_amount: 0, // Free Pushkaralu pilgrim pass
        is_vip: false,
        allocation_reason: 'Lowest congestion zone near Kotilingala Ghat (Score: 92/100)',
      });
    }

    slots.push({
      slot_id: slotId,
      zone_id: 'ZONE-A',
      slot_type: 'CAR',
      row,
      number: i,
      occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      is_reserved: false,
      is_accessible: i <= 5,
      current_vehicle_id: isOccupied ? vehicleId : undefined,
      current_plate: isOccupied ? plate : undefined,
      occupied_at: isOccupied ? new Date(now.getTime() - (i * 7 + 15) * 60000).toISOString() : undefined,
      last_updated: now.toISOString(),
    });
  }

  // Zone B: 80 slots (Cars), 48 occupied, 32 available
  for (let i = 1; i <= 80; i++) {
    const isOccupied = i <= 48;
    const slotId = `B-${String(i).padStart(3, '0')}`;
    const row = String.fromCharCode(65 + Math.floor((i - 1) / 20));
    const plate = `${sampleStatePrefixes[(i + 3) % sampleStatePrefixes.length]} ${sampleLetters[(i + 2) % sampleLetters.length]} ${String(3000 + i).slice(-4)}`;
    const vehicleId = isOccupied ? `VEH-${vehicleCounter++}` : undefined;

    if (isOccupied && vehicleId) {
      vehicles.push({
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'CAR',
        authorized_status: 'REGULAR',
        registration_source: 'ANPR_CAMERA',
      });

      const entryDate = new Date(now.getTime() - (i * 5 + 30) * 60000);
      sessions.push({
        session_id: `SESS-${sessionCounter++}`,
        token_number: `TKN-B${String(i).padStart(3, '0')}`,
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'CAR',
        slot_id: slotId,
        zone_id: 'ZONE-B',
        entry_time: entryDate.toISOString(),
        session_status: 'ACTIVE',
        allocation_method: 'AUTOMATIC_INTELLIGENT',
        entry_gate_id: 'GATE-02-CENTRAL',
        fee_amount: 0,
        is_vip: false,
        allocation_reason: 'Nearest available slot to Main Pushkar Ghat (Score: 88/100)',
      });
    }

    slots.push({
      slot_id: slotId,
      zone_id: 'ZONE-B',
      slot_type: 'CAR',
      row,
      number: i,
      occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      is_reserved: false,
      is_accessible: i <= 3,
      current_vehicle_id: isOccupied ? vehicleId : undefined,
      current_plate: isOccupied ? plate : undefined,
      occupied_at: isOccupied ? new Date(now.getTime() - (i * 5 + 30) * 60000).toISOString() : undefined,
      last_updated: now.toISOString(),
    });
  }

  // Zone C: 20 slots (Buses), 12 occupied, 8 available
  for (let i = 1; i <= 20; i++) {
    const isOccupied = i <= 12;
    const slotId = `BUS-${String(i).padStart(2, '0')}`;
    const row = 'BUS-BAY';
    const plate = `AP 39 Z ${String(7000 + i)}`; // APSRTC or Pilgrim Tour Bus
    const vehicleId = isOccupied ? `VEH-${vehicleCounter++}` : undefined;

    if (isOccupied && vehicleId) {
      vehicles.push({
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'BUS',
        authorized_status: 'COMMERCIAL',
        registration_source: 'ANPR_CAMERA',
        owner_name: `APSRTC Pushkaralu Special Shuttle #${i}`,
      });

      const entryDate = new Date(now.getTime() - (i * 20 + 40) * 60000);
      sessions.push({
        session_id: `SESS-${sessionCounter++}`,
        token_number: `TKN-BUS${String(i).padStart(2, '0')}`,
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'BUS',
        slot_id: slotId,
        zone_id: 'ZONE-C',
        entry_time: entryDate.toISOString(),
        session_status: 'ACTIVE',
        allocation_method: 'AUTOMATIC_INTELLIGENT',
        entry_gate_id: 'GATE-03-BUS-SOUTH',
        fee_amount: 0,
        is_vip: false,
        allocation_reason: 'Dedicated heavy vehicle bay with direct pedestrian skywalk to Godavari Ghats',
      });
    }

    slots.push({
      slot_id: slotId,
      zone_id: 'ZONE-C',
      slot_type: 'BUS',
      row,
      number: i,
      occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      is_reserved: false,
      is_accessible: false,
      current_vehicle_id: isOccupied ? vehicleId : undefined,
      current_plate: isOccupied ? plate : undefined,
      occupied_at: isOccupied ? new Date(now.getTime() - (i * 20 + 40) * 60000).toISOString() : undefined,
      last_updated: now.toISOString(),
    });
  }

  // Zone D: 100 slots (Bikes), 45 occupied, 55 available
  for (let i = 1; i <= 100; i++) {
    const isOccupied = i <= 45;
    const slotId = `BK-${String(i).padStart(3, '0')}`;
    const row = `ROW-${Math.ceil(i / 25)}`;
    const plate = `AP 05 BH ${String(5000 + i)}`;
    const vehicleId = isOccupied ? `VEH-${vehicleCounter++}` : undefined;

    if (isOccupied && vehicleId) {
      vehicles.push({
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'BIKE',
        authorized_status: 'REGULAR',
        registration_source: 'ANPR_CAMERA',
      });

      const entryDate = new Date(now.getTime() - (i * 4 + 10) * 60000);
      sessions.push({
        session_id: `SESS-${sessionCounter++}`,
        token_number: `TKN-BK${String(i).padStart(3, '0')}`,
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'BIKE',
        slot_id: slotId,
        zone_id: 'ZONE-D',
        entry_time: entryDate.toISOString(),
        session_status: 'ACTIVE',
        allocation_method: 'AUTOMATIC_INTELLIGENT',
        entry_gate_id: 'GATE-04-BIKE-EAST',
        fee_amount: 0,
        is_vip: false,
        allocation_reason: 'Two-wheeler bay closest to Saraswathi Ghat steps',
      });
    }

    slots.push({
      slot_id: slotId,
      zone_id: 'ZONE-D',
      slot_type: 'BIKE',
      row,
      number: i,
      occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      is_reserved: false,
      is_accessible: false,
      current_vehicle_id: isOccupied ? vehicleId : undefined,
      current_plate: isOccupied ? plate : undefined,
      occupied_at: isOccupied ? new Date(now.getTime() - (i * 4 + 10) * 60000).toISOString() : undefined,
      last_updated: now.toISOString(),
    });
  }

  // Zone V: 10 slots (VIP), 5 occupied, 5 available
  for (let i = 1; i <= 10; i++) {
    const isOccupied = i <= 5;
    const slotId = `VIP-${String(i).padStart(2, '0')}`;
    const row = 'VIP-ROW';
    const plate = `AP 39 VIP 000${i}`;
    const vehicleId = isOccupied ? `VEH-${vehicleCounter++}` : undefined;

    if (isOccupied && vehicleId) {
      vehicles.push({
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'VIP',
        authorized_status: 'VIP',
        registration_source: 'PILGRIM_PASS',
        owner_name: `Endowments Dept / Protocol Official Dignitary #${i}`,
      });

      const entryDate = new Date(now.getTime() - (i * 45 + 10) * 60000);
      sessions.push({
        session_id: `SESS-${sessionCounter++}`,
        token_number: `TKN-VIP0${i}`,
        vehicle_id: vehicleId,
        registration_number: plate,
        vehicle_category: 'VIP',
        slot_id: slotId,
        zone_id: 'ZONE-V',
        entry_time: entryDate.toISOString(),
        session_status: 'ACTIVE',
        allocation_method: 'MANUAL_OPERATOR',
        entry_gate_id: 'GATE-05-VIP-SPECIAL',
        fee_amount: 0,
        is_vip: true,
        allocation_reason: 'Statutory Protocol VIP Clearance (Kotilingala Ghat VIP Ghat)',
      });
    }

    slots.push({
      slot_id: slotId,
      zone_id: 'ZONE-V',
      slot_type: 'VIP',
      row,
      number: i,
      occupancy_status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
      is_reserved: true,
      is_accessible: true,
      current_vehicle_id: isOccupied ? vehicleId : undefined,
      current_plate: isOccupied ? plate : undefined,
      occupied_at: isOccupied ? new Date(now.getTime() - (i * 45 + 10) * 60000).toISOString() : undefined,
      last_updated: now.toISOString(),
    });
  }

  return { slots, vehicles, sessions };
}

export const INITIAL_ANPR_EVENTS: ANPREvent[] = [
  {
    event_id: 'EVT-ANPR-901',
    camera_id: 'CAM-N01-IN',
    gate_id: 'GATE-01-NORTH',
    captured_timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    extracted_registration: 'AP 39 XX 1234',
    confidence_score: 98.6,
    verification_status: 'VERIFIED',
    image_url: '/pushkaralu_concept_reference.jpg',
    vehicle_category: 'CAR',
    is_repeat_entry: false,
    operator_notes: 'Demonstration reference vehicle detected with clear high-resolution capture',
  },
  {
    event_id: 'EVT-ANPR-902',
    camera_id: 'CAM-C02-IN',
    gate_id: 'GATE-02-CENTRAL',
    captured_timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    extracted_registration: 'TS 09 EA 4455',
    confidence_score: 94.2,
    verification_status: 'VERIFIED',
    image_url: '/pushkaralu_concept_reference.jpg',
    vehicle_category: 'CAR',
    is_repeat_entry: false,
  },
  {
    event_id: 'EVT-ANPR-903',
    camera_id: 'CAM-B03-IN',
    gate_id: 'GATE-03-BUS-SOUTH',
    captured_timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    extracted_registration: 'AP 39 Z 7001',
    confidence_score: 99.1,
    verification_status: 'VERIFIED',
    image_url: '/pushkaralu_concept_reference.jpg',
    vehicle_category: 'BUS',
    is_repeat_entry: false,
    operator_notes: 'APSRTC Pilgrim Shuttle #1 Verified',
  },
  {
    event_id: 'EVT-ANPR-904',
    camera_id: 'CAM-N01-IN',
    gate_id: 'GATE-01-NORTH',
    captured_timestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    extracted_registration: 'MH 12 RT 8890',
    confidence_score: 74.5,
    verification_status: 'MANUAL_CORRECTED',
    image_url: '/pushkaralu_concept_reference.jpg',
    vehicle_category: 'CAR',
    is_repeat_entry: false,
    operator_notes: 'Slight mud on number plate. Operator verified character 8 vs B',
  },
  {
    event_id: 'EVT-ANPR-905',
    camera_id: 'CAM-V05-IN',
    gate_id: 'GATE-05-VIP-SPECIAL',
    captured_timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    extracted_registration: 'AP 39 VIP 0001',
    confidence_score: 99.8,
    verification_status: 'VERIFIED',
    image_url: '/pushkaralu_concept_reference.jpg',
    vehicle_category: 'VIP',
    is_repeat_entry: false,
    operator_notes: 'District Collector Escort Vehicle Protocol',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    log_id: 'AUD-501',
    user_id: 'USR-OP01',
    user_name: 'K. Prasad (Control Room)',
    user_role: 'OPERATOR',
    action: 'SYSTEM_BOOT',
    affected_record: 'SYSTEM',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    result: 'SUCCESS',
    details: 'Smart Pushkaralu ANPR parking system initialized in DEMO MODE with 330 benchmark slots.',
  },
  {
    log_id: 'AUD-502',
    user_id: 'USR-AI-ENGINE',
    user_name: 'Allocation Engine v2.4',
    user_role: 'ADMIN',
    action: 'AUTO_ALLOCATE',
    affected_record: 'A-001',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    result: 'SUCCESS',
    details: 'Allocated slot A-001 to vehicle AP 39 XX 1234. Score: 96/100.',
  },
  {
    log_id: 'AUD-503',
    user_id: 'USR-ADM01',
    user_name: 'Superintendent of Police (Traffic)',
    user_role: 'ADMIN',
    action: 'MAINTENANCE_TOGGLE',
    affected_record: 'A-119',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    result: 'SUCCESS',
    details: 'Set slot A-119 to MAINTENANCE for sensor recalibration.',
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  anpr_confidence_threshold: 85,
  retention_days: 30,
  auto_barrier_gate: false, // Per prompt: "Never open a physical barrier solely because a simulated ANPR event occurred"
  sound_alerts: true,
  led_vms_language: 'BILINGUAL',
  simulation_interval_ms: 4000,
  emergency_mode: false,
};
