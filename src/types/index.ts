export type VehicleCategory = 'CAR' | 'BUS' | 'BIKE' | 'VIP';

export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'TRAFFIC_POLICE';

export interface ParkingZone {
  zone_id: string;
  zone_name: string;
  vehicle_category: VehicleCategory;
  capacity: number;
  operational_status: 'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED';
  location_name: string;
  walking_distance_meters: number;
  walking_time_mins: number;
  congestion_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  gate_id: string;
}

export interface ParkingSlot {
  slot_id: string;
  zone_id: string;
  slot_type: VehicleCategory;
  row: string;
  number: number;
  occupancy_status: SlotStatus;
  is_reserved: boolean;
  is_accessible: boolean;
  current_vehicle_id?: string;
  current_plate?: string;
  occupied_at?: string;
  last_updated: string;
}

export interface Vehicle {
  vehicle_id: string;
  registration_number: string;
  vehicle_category: VehicleCategory;
  authorized_status: 'REGULAR' | 'VIP' | 'EMERGENCY' | 'COMMERCIAL';
  registration_source: 'ANPR_CAMERA' | 'MANUAL_ENTRY' | 'PILGRIM_PASS';
  owner_name?: string;
  phone_number?: string;
}

export interface ParkingSession {
  session_id: string;
  token_number: string;
  vehicle_id: string;
  registration_number: string;
  vehicle_category: VehicleCategory;
  slot_id: string;
  zone_id: string;
  entry_time: string;
  exit_time?: string;
  session_status: SessionStatus;
  allocation_method: 'AUTOMATIC_INTELLIGENT' | 'MANUAL_OPERATOR';
  entry_gate_id: string;
  exit_gate_id?: string;
  fee_amount: number;
  is_vip: boolean;
  allocation_reason: string;
}

export interface ANPREvent {
  event_id: string;
  camera_id: string;
  gate_id: string;
  captured_timestamp: string;
  extracted_registration: string;
  confidence_score: number;
  verification_status: 'VERIFIED' | 'MANUAL_CORRECTED' | 'FLAGGED_NEEDS_REVIEW';
  image_url: string;
  plate_crop_url?: string;
  vehicle_category: VehicleCategory;
  is_repeat_entry: boolean;
  operator_notes?: string;
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  affected_record: string;
  timestamp: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface AllocationRecommendation {
  recommended_zone: ParkingZone;
  recommended_slot: ParkingSlot;
  score: number;
  reason: string;
  alternative_zones?: ParkingZone[];
  walking_distance: number;
  congestion_status: string;
}

export interface SystemSettings {
  anpr_confidence_threshold: number; // e.g., 85%
  retention_days: number; // e.g., 30 days
  auto_barrier_gate: boolean;
  sound_alerts: boolean;
  led_vms_language: 'ENGLISH' | 'TELUGU' | 'BILINGUAL';
  simulation_interval_ms: number;
  emergency_mode: boolean;
}
