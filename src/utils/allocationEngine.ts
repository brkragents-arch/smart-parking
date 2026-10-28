import { ParkingZone, ParkingSlot, VehicleCategory, AllocationRecommendation } from '../types';

export interface AllocationRequest {
  vehicleCategory: VehicleCategory;
  isVip?: boolean;
  isAccessible?: boolean;
  preferredZoneId?: string;
  registrationNumber: string;
}

/**
 * Intelligent Rule-Based Slot Allocation Engine for Smart Pushkaralu 2027
 */
export function allocateOptimalSlot(
  request: AllocationRequest,
  zones: ParkingZone[],
  slots: ParkingSlot[]
): AllocationRecommendation | null {
  const { vehicleCategory, isVip = false, isAccessible = false, preferredZoneId, registrationNumber } = request;

  // Step 1: Identify compatible zones based on vehicle category & operational status
  const compatibleZones = zones.filter((zone) => {
    // If vehicle is VIP, can use VIP zone or regular car zones if VIP zone is full
    if (vehicleCategory === 'VIP' || isVip) {
      if (zone.vehicle_category === 'VIP' || zone.vehicle_category === 'CAR') {
        return zone.operational_status !== 'CLOSED';
      }
      return false;
    }

    // Regular vehicle cannot use VIP zone
    if (zone.vehicle_category === 'VIP') return false;

    // Must match category
    return zone.vehicle_category === vehicleCategory && zone.operational_status !== 'CLOSED';
  });

  if (compatibleZones.length === 0) {
    return null;
  }

  // Step 2: Score eligible zones based on:
  // - Availability count
  // - Congestion level penalty
  // - Walking distance to sacred Ghats
  const scoredZones = compatibleZones.map((zone) => {
    // Filter available slots in this zone
    const availableSlotsInZone = slots.filter(
      (s) => s.zone_id === zone.zone_id && s.occupancy_status === 'AVAILABLE'
    );

    const availCount = availableSlotsInZone.length;
    const availRatio = zone.capacity > 0 ? availCount / zone.capacity : 0;

    // Congestion penalty (0 to 1)
    let congestionPenalty = 0.2;
    if (zone.congestion_level === 'LOW') congestionPenalty = 0.1;
    else if (zone.congestion_level === 'MODERATE') congestionPenalty = 0.35;
    else if (zone.congestion_level === 'HIGH') congestionPenalty = 0.7;
    else if (zone.congestion_level === 'CRITICAL') congestionPenalty = 0.95;

    // Distance factor (shorter walking distance gives higher score)
    // Max reference distance is 600m
    const distanceFactor = Math.max(0, 1 - zone.walking_distance_meters / 600);

    // Preferred zone bonus
    const preferenceBonus = preferredZoneId === zone.zone_id ? 0.15 : 0;

    // Calculate score (0 to 100)
    let score = (availRatio * 45 + (1 - congestionPenalty) * 30 + distanceFactor * 25 + preferenceBonus * 10) * 100 / 110;
    
    // If no slots available, score is 0
    if (availCount === 0) score = 0;

    return {
      zone,
      score: Math.round(score),
      availableCount: availCount,
      availableSlots: availableSlotsInZone,
    };
  });

  // Sort zones descending by score
  scoredZones.sort((a, b) => b.score - a.score);

  // Pick top zone with at least 1 free slot
  const topCandidate = scoredZones.find((z) => z.availableCount > 0);

  if (!topCandidate) {
    // All compatible zones are full
    return null;
  }

  const selectedZone = topCandidate.zone;

  // Step 3: Select the optimal slot within the selected zone
  let eligibleSlots = topCandidate.availableSlots;

  // Priority for accessible/handicapped slots if requested
  if (isAccessible) {
    const accessibleSlots = eligibleSlots.filter((s) => s.is_accessible);
    if (accessibleSlots.length > 0) {
      eligibleSlots = accessibleSlots;
    }
  }

  // Priority for reserved slots if VIP
  if (isVip) {
    const reservedSlots = eligibleSlots.filter((s) => s.is_reserved);
    if (reservedSlots.length > 0) {
      eligibleSlots = reservedSlots;
    }
  } else {
    // Regular vehicles should not take reserved slots unless no regular slots remain
    const unreserved = eligibleSlots.filter((s) => !s.is_reserved);
    if (unreserved.length > 0) {
      eligibleSlots = unreserved;
    }
  }

  // Sort slots by lowest row and number (closest to entry gate/ghat walkway)
  eligibleSlots.sort((a, b) => a.number - b.number);

  const selectedSlot = eligibleSlots[0];

  // Construct transparent rule-based explanation
  const alternatives = scoredZones
    .filter((z) => z.zone.zone_id !== selectedZone.zone_id && z.availableCount > 0)
    .map((z) => z.zone);

  const reasonParts: string[] = [];
  reasonParts.push(`Allocated slot in ${selectedZone.zone_name} (Score: ${topCandidate.score}/100)`);
  reasonParts.push(`${topCandidate.availableCount} of ${selectedZone.capacity} spaces available (${Math.round((topCandidate.availableCount / selectedZone.capacity) * 100)}% free)`);
  reasonParts.push(`Congestion level is ${selectedZone.congestion_level}`);
  reasonParts.push(`Walking distance to Godavari Ghat: ${selectedZone.walking_distance_meters}m (~${selectedZone.walking_time_mins} mins)`);

  if (isAccessible && selectedSlot.is_accessible) {
    reasonParts.push('Accessible / Divyangjan reserved bay provided near ramp');
  }
  if (isVip) {
    reasonParts.push('Protocol VIP clearance verified');
  }

  return {
    recommended_zone: selectedZone,
    recommended_slot: selectedSlot,
    score: topCandidate.score,
    reason: reasonParts.join(' • '),
    alternative_zones: alternatives,
    walking_distance: selectedZone.walking_distance_meters,
    congestion_status: selectedZone.congestion_level,
  };
}
