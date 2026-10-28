import { VehicleCategory } from '../types';

export interface ANPRDetectionResult {
  raw_text: string;
  normalized_plate: string;
  confidence: number;
  is_valid_format: boolean;
  format_type: string;
  bounding_box: { x: number; y: number; width: number; height: number };
  cropped_plate_url: string;
  detected_category: VehicleCategory;
  processing_time_ms: number;
}

export interface SampleVehicle {
  plate: string;
  category: VehicleCategory;
  state: string;
  type: string;
  notes: string;
  image_url?: string;
}

export const SAMPLE_VEHICLES: SampleVehicle[] = [
  {
    plate: 'AP 39 XX 1234',
    category: 'CAR',
    state: 'Andhra Pradesh (Godavari)',
    type: 'Private SUV (White Creta)',
    notes: 'Reference car shown on Pushkaralu 2027 entry barrier slide',
  },
  {
    plate: 'AP 39 Z 7025',
    category: 'BUS',
    state: 'Andhra Pradesh',
    type: 'APSRTC Pushkaralu Special Express',
    notes: 'Pilgrim mass transit shuttle from Godavari Railway Station',
  },
  {
    plate: 'TS 09 EA 8821',
    category: 'CAR',
    state: 'Telangana (Hyderabad)',
    type: 'Private Sedan (Honda City)',
    notes: 'Interstate pilgrim arrival via NH-16',
  },
  {
    plate: 'AP 05 BK 4410',
    category: 'BIKE',
    state: 'Andhra Pradesh (Kakinada)',
    type: 'Motorcycle (Hero Splendor)',
    notes: 'Local pilgrim commuter for holy dip',
  },
  {
    plate: 'AP 39 VIP 0008',
    category: 'VIP',
    state: 'Andhra Pradesh',
    type: 'District Protocol Pilot Car',
    notes: 'Authorized VVIP Escort with Ghat clearance pass',
  },
  {
    plate: 'KA 03 MN 6620',
    category: 'CAR',
    state: 'Karnataka (Bengaluru)',
    type: 'Private MUV (Innova Crysta)',
    notes: 'Family pilgrimage group',
  },
  {
    plate: 'MH 12 BB 3390',
    category: 'CAR',
    state: 'Maharashtra (Pune)',
    type: 'Private Hatchback (Swift)',
    notes: 'Godavari Pushkaralu pilgrim',
  },
];

/**
 * Normalizes vehicle number plate strings:
 * Removes excessive whitespace, replaces weird symbols, converts to uppercase.
 */
export function normalizeRegistrationNumber(input: string): string {
  if (!input) return '';
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Format as "XX 00 XX 0000" if standard 10-char format
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 10)}`;
  }
  // If 9 chars like "AP 5 XX 1234"
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 9)}`;
  }
  return input.toUpperCase().trim().replace(/\s+/g, ' ');
}

/**
 * Validates against flexible Indian Motor Vehicles Registration rules:
 * - Standard: 2 letters (State) + 1-2 digits (RTO) + 0-3 letters (Series) + 4 digits (Unique)
 * - Bharat (BH) Series: 2 digits (Year) + BH + 4 digits + 1-2 letters
 * - VIP / Dignitary: AP 39 VIP 0001
 */
export function validateIndianPlate(plate: string): { isValid: boolean; format: string } {
  const norm = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Standard Indian pattern: e.g. AP39XX1234, DL01A1234
  const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  if (standardRegex.test(norm)) {
    return { isValid: true, format: 'Standard Indian RTO Registration' };
  }

  // Bharat Series pattern: e.g. 22BH1234AA
  const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
  if (bhRegex.test(norm)) {
    return { isValid: true, format: 'Bharat Series (BH)' };
  }

  // VIP / Protocol pattern: e.g. AP39VIP0001
  const vipRegex = /^[A-Z]{2}[0-9]{1,2}VIP[0-9]{1,4}$/;
  if (vipRegex.test(norm)) {
    return { isValid: true, format: 'Pushkaralu Special VIP Protocol' };
  }

  // Fallback for commercial / temporary trade plates
  if (norm.length >= 6 && norm.length <= 11) {
    return { isValid: true, format: 'Non-Standard / Temporary State Plate' };
  }

  return { isValid: false, format: 'Invalid Vehicle Number Format' };
}

/**
 * Generates an SVG data URL representing a realistic vehicle image with a number plate
 * to simulate ANPR cameras in control rooms.
 */
export function generateVehiclePlateImage(
  plate: string,
  category: VehicleCategory = 'CAR',
  vehicleColor: string = '#f8fafc'
): string {
  const width = 640;
  const height = 360;

  let vehicleIconSvg = '';
  if (category === 'CAR' || category === 'VIP') {
    vehicleIconSvg = `
      <rect x="180" y="110" width="280" height="150" rx="20" fill="${vehicleColor}" stroke="#334155" stroke-width="4"/>
      <polygon points="220,110 250,55 390,55 420,110" fill="#0284c7" opacity="0.85"/>
      <rect x="260" y="65" width="120" height="40" rx="4" fill="#38bdf8" opacity="0.6"/>
      <!-- Headlights / Taillights -->
      <rect x="190" y="140" width="30" height="20" rx="4" fill="#ef4444"/>
      <rect x="420" y="140" width="30" height="20" rx="4" fill="#ef4444"/>
      <!-- Wheels -->
      <circle cx="230" cy="260" r="30" fill="#1e293b"/>
      <circle cx="230" cy="260" r="16" fill="#94a3b8"/>
      <circle cx="410" cy="260" r="30" fill="#1e293b"/>
      <circle cx="410" cy="260" r="16" fill="#94a3b8"/>
    `;
  } else if (category === 'BUS') {
    vehicleIconSvg = `
      <rect x="140" y="40" width="360" height="220" rx="12" fill="#0284c7" stroke="#0369a1" stroke-width="5"/>
      <rect x="160" y="60" width="320" height="70" rx="6" fill="#e0f2fe"/>
      <line x1="240" y1="60" x2="240" y2="130" stroke="#0284c7" stroke-width="3"/>
      <line x1="320" y1="60" x2="320" y2="130" stroke="#0284c7" stroke-width="3"/>
      <line x1="400" y1="60" x2="400" y2="130" stroke="#0284c7" stroke-width="3"/>
      <circle cx="200" cy="260" r="32" fill="#1e293b"/>
      <circle cx="440" cy="260" r="32" fill="#1e293b"/>
      <text x="320" y="175" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">APSRTC PUSHKARALU SPECIAL</text>
    `;
  } else {
    // BIKE
    vehicleIconSvg = `
      <circle cx="240" cy="220" r="35" fill="none" stroke="#1e293b" stroke-width="12"/>
      <circle cx="400" cy="220" r="35" fill="none" stroke="#1e293b" stroke-width="12"/>
      <path d="M 240 220 L 310 220 L 350 160 L 290 160 Z" fill="#059669"/>
      <line x1="350" y1="160" x2="390" y2="130" stroke="#0f172a" stroke-width="6"/>
      <line x1="380" y1="130" x2="410" y2="130" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        </pattern>
      </defs>
      
      <!-- Background / Road scene -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect width="${width}" height="${height}" fill="url(#grid)" />
      
      <!-- Roadway lane -->
      <rect x="100" y="270" width="440" height="90" fill="#334155" />
      <line x1="120" y1="315" x2="520" y2="315" stroke="#facc15" stroke-dasharray="16 12" stroke-width="4" />

      <!-- Vehicle Body -->
      ${vehicleIconSvg}

      <!-- Number Plate (High Contrast Indian White/Yellow HSRP Plate) -->
      <g id="number_plate">
        <!-- Plate Outer Shadow / Bounding -->
        <rect x="250" y="195" width="140" height="34" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <!-- Blue IND Strip -->
        <rect x="250" y="195" width="16" height="34" rx="2" fill="#0284c7" />
        <circle cx="258" cy="204" r="3" fill="#ffffff" />
        <text x="258" y="222" font-family="sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">IND</text>
        <!-- Registration Text -->
        <text x="325" y="219" font-family="'Courier New', monospace, sans-serif" font-size="15" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">${plate}</text>
      </g>

      <!-- Smart Pushkaralu 2027 ANPR Overlay Bounding Box (Green Target) -->
      <rect x="244" y="189" width="152" height="46" rx="4" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="8 4"/>
      <!-- Target Corner brackets -->
      <path d="M 240 197 L 240 185 L 252 185" fill="none" stroke="#22c55e" stroke-width="4"/>
      <path d="M 400 197 L 400 185 L 388 185" fill="none" stroke="#22c55e" stroke-width="4"/>
      <path d="M 240 227 L 240 239 L 252 239" fill="none" stroke="#22c55e" stroke-width="4"/>
      <path d="M 400 227 L 400 239 L 388 239" fill="none" stroke="#22c55e" stroke-width="4"/>

      <!-- ANPR AI Confidence Label Badge -->
      <rect x="244" y="165" width="152" height="20" rx="3" fill="#22c55e"/>
      <text x="320" y="179" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">ANPR OCR: 98.4% CONF</text>

      <!-- Gate Camera OSD Header -->
      <text x="20" y="30" font-family="monospace" font-size="12" fill="#22c55e">● REC [CAM-01-ENTRY] RAJAHMUNDRY GHAT GATE</text>
      <text x="500" y="30" font-family="monospace" font-size="12" fill="#94a3b8">FPS: 30 | 1080P</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Simulates client-side computer vision license plate detection & OCR extraction.
 */
export async function processANPRFrame(
  imageSource: string | HTMLImageElement,
  overridePlate?: string
): Promise<ANPRDetectionResult> {
  const startTime = performance.now();

  // If plate is specified (e.g. from sample), use it or detect
  const plateText = overridePlate || 'AP 39 XX 1234';
  const normalized = normalizeRegistrationNumber(plateText);
  const validation = validateIndianPlate(normalized);

  // Confidence simulation between 91.5% and 99.4%
  const confidence = Math.round((92 + Math.random() * 7.5) * 10) / 10;

  // Determine category
  let category: VehicleCategory = 'CAR';
  if (normalized.includes('BUS') || normalized.includes(' Z ')) {
    category = 'BUS';
  } else if (normalized.includes('BK') || normalized.includes('BH') || normalized.startsWith('AP 05')) {
    category = 'BIKE';
  } else if (normalized.includes('VIP')) {
    category = 'VIP';
  }

  // Generate cropped plate graphic data URL
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = 280;
  cropCanvas.height = 70;
  const ctx = cropCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 280, 70);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(2, 2, 276, 66);
    
    // IND blue strip
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(2, 2, 34, 66);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IND', 19, 44);

    // Number plate text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText(normalized, 160, 48);
  }

  const cropped_plate_url = cropCanvas.toDataURL('image/png');
  const elapsed = Math.round(performance.now() - startTime + 80);

  return {
    raw_text: plateText,
    normalized_plate: normalized,
    confidence,
    is_valid_format: validation.isValid,
    format_type: validation.format,
    bounding_box: { x: 244, y: 189, width: 152, height: 46 },
    cropped_plate_url,
    detected_category: category,
    processing_time_ms: elapsed,
  };
}
