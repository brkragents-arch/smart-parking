import { generateInitialSlots, INITIAL_ZONES } from '../data/initialData';
import { allocateOptimalSlot } from '../utils/allocationEngine';
import { normalizeRegistrationNumber, validateIndianPlate } from '../utils/anprEngine';

console.log('--- RUNNING FUNCTIONAL ACCEPTANCE TESTS ---');

// Test 1: Initial totals
const { slots, vehicles, sessions } = generateInitialSlots();

const cars = slots.filter((s) => s.slot_type === 'CAR');
const carOcc = cars.filter((s) => s.occupancy_status === 'OCCUPIED').length;
const carAvail = cars.filter((s) => s.occupancy_status === 'AVAILABLE').length;

console.log(`Cars: Total=${cars.length}, Occupied=${carOcc}, Available=${carAvail}`);
if (cars.length !== 200 || carOcc !== 120 || carAvail !== 80) {
  throw new Error(`Car demo data mismatch! Total=${cars.length}, Occupied=${carOcc}, Available=${carAvail}`);
}

const buses = slots.filter((s) => s.slot_type === 'BUS');
const busOcc = buses.filter((s) => s.occupancy_status === 'OCCUPIED').length;
const busAvail = buses.filter((s) => s.occupancy_status === 'AVAILABLE').length;
console.log(`Buses: Total=${buses.length}, Occupied=${busOcc}, Available=${busAvail}`);
if (buses.length !== 20 || busOcc !== 12 || busAvail !== 8) {
  throw new Error('Bus demo data mismatch!');
}

const bikes = slots.filter((s) => s.slot_type === 'BIKE');
const bikeOcc = bikes.filter((s) => s.occupancy_status === 'OCCUPIED').length;
const bikeAvail = bikes.filter((s) => s.occupancy_status === 'AVAILABLE').length;
console.log(`Bikes: Total=${bikes.length}, Occupied=${bikeOcc}, Available=${bikeAvail}`);
if (bikes.length !== 100 || bikeOcc !== 45 || bikeAvail !== 55) {
  throw new Error('Bike demo data mismatch!');
}

const vip = slots.filter((s) => s.slot_type === 'VIP');
const vipOcc = vip.filter((s) => s.occupancy_status === 'OCCUPIED').length;
const vipAvail = vip.filter((s) => s.occupancy_status === 'AVAILABLE').length;
console.log(`VIP: Total=${vip.length}, Occupied=${vipOcc}, Available=${vipAvail}`);
if (vip.length !== 10 || vipOcc !== 5 || vipAvail !== 5) {
  throw new Error('VIP demo data mismatch!');
}

// Test 2: Allocation Engine
const rec = allocateOptimalSlot(
  {
    vehicleCategory: 'CAR',
    registrationNumber: 'AP 39 XX 1234',
  },
  INITIAL_ZONES,
  slots
);
console.log(`Allocation Test for AP 39 XX 1234: Recommended ${rec?.recommended_slot.slot_id} in ${rec?.recommended_zone.zone_name}`);
if (!rec || !rec.recommended_slot) {
  throw new Error('Allocation engine failed to find an available slot!');
}

// Test 3: Plate Normalization & Validation
const norm = normalizeRegistrationNumber('ap39xx1234');
console.log(`Normalized "ap39xx1234" -> "${norm}"`);
if (norm !== 'AP 39 XX 1234') {
  throw new Error('Normalization failed!');
}

const valid = validateIndianPlate(norm);
console.log(`Plate validation for ${norm}: ${valid.isValid} (${valid.format})`);
if (!valid.isValid) {
  throw new Error('Indian plate validation failed on demonstration reference AP 39 XX 1234!');
}

console.log('✓ ALL FUNCTIONAL ACCEPTANCE BENCHMARK TESTS PASSED SUCCESSFULLY!');
