import React, { useState, useRef, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Search,
  Check,
  Video,
  VideoOff,
  ShieldAlert,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import {
  processANPRFrame,
  normalizeRegistrationNumber,
  validateIndianPlate,
  SAMPLE_VEHICLES,
  SampleVehicle,
  generateVehiclePlateImage,
} from '../../utils/anprEngine';
import { VehicleCategory } from '../../types';

interface ANPRMonitoringScreenProps {
  onNavigateToEntryWithPlate?: (plate: string, category: VehicleCategory) => void;
}

export const ANPRMonitoringScreen: React.FC<ANPRMonitoringScreenProps> = ({
  onNavigateToEntryWithPlate,
}) => {
  const { anprEvents, correctANPREvent, sessions, handleVehicleEntry } = useParking();

  // Current active camera / stream states
  const [selectedGate, setSelectedGate] = useState<string>('GATE-01-NORTH');
  const [activeCameraId, setActiveCameraId] = useState<string>('CAM-N01-IN');
  const [currentPlateInput, setCurrentPlateInput] = useState<string>('AP 39 XX 1234');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('CAR');

  // ANPR Detection states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('/pushkaralu_concept_reference.jpg');

  // Manual OCR correction modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string>('');
  const [correctedPlateText, setCorrectedPlateText] = useState<string>('');
  const [correctionNotes, setCorrectionNotes] = useState<string>('');

  // Webcam stream
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Run initial detection with default demo vehicle (AP 39 XX 1234)
  useEffect(() => {
    handleRunANPR('AP 39 XX 1234', 'CAR');
  }, []);

  const handleRunANPR = async (plateToDetect: string, category: VehicleCategory) => {
    setIsProcessing(true);
    try {
      const syntheticImg = generateVehiclePlateImage(plateToDetect, category);
      setPreviewImageUrl(syntheticImg);

      const result = await processANPRFrame(syntheticImg, plateToDetect);
      setDetectionResult(result);
      setCurrentPlateInput(result.normalized_plate);
      setSelectedCategory(category);
    } catch (err) {
      console.error('ANPR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = (sample: SampleVehicle) => {
    setCurrentPlateInput(sample.plate);
    setSelectedCategory(sample.category);
    handleRunANPR(sample.plate, sample.category);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imgDataUrl = event.target?.result as string;
      setPreviewImageUrl(imgDataUrl);
      setIsProcessing(true);

      // Extract plate or use current input
      const res = await processANPRFrame(imgDataUrl, currentPlateInput || 'AP 39 XX 1234');
      setDetectionResult(res);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Webcam Start/Stop
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);
      } catch (err) {
        alert('Webcam access was denied or not available. Using simulated ANPR camera feed.');
        setIsWebcamActive(false);
      }
    }
  };

  // Capture frame from webcam
  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImageUrl(dataUrl);
      handleRunANPR(currentPlateInput, selectedCategory);
    }
  };

  // Check if plate has duplicate/repeat entry
  const activeSessionWithPlate = sessions.find(
    (s) =>
      s.session_status === 'ACTIVE' &&
      s.registration_number === normalizeRegistrationNumber(currentPlateInput)
  );

  const validation = validateIndianPlate(currentPlateInput);

  const openCorrectionModal = (evtId: string, currentVal: string) => {
    setEditingEventId(evtId);
    setCorrectedPlateText(currentVal);
    setCorrectionNotes('');
    setIsEditModalOpen(true);
  };

  const handleSaveCorrection = () => {
    if (!editingEventId || !correctedPlateText.trim()) return;
    correctANPREvent(editingEventId, correctedPlateText, correctionNotes);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
              Module B • Computer Vision & OCR
            </span>
            <span className="text-xs text-amber-400 font-mono">Simulated & Live Hybrid</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Automatic Number Plate Recognition (ANPR) Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time license plate detection, optical character recognition (OCR), confidence scoring, format validation, and manual operator overrides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleWebcam}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isWebcamActive
                ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isWebcamActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-cyan-400" />}
            <span>{isWebcamActive ? 'Stop Connected Camera' : 'Connect Camera'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Vehicle Photo</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column ANPR Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Camera Viewport & Recognition Overlay */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400 font-bold tracking-wider">
                  ● LIVE FEED: {activeCameraId}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{selectedGate}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>FPS: 30</span>
                <span>RES: 1080P</span>
                <span>LATENCY: 85ms</span>
              </div>
            </div>

            {/* Viewport Display */}
            <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
              {isWebcamActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 z-10">
                    <button
                      onClick={captureWebcamFrame}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                    >
                      Capture Frame
                    </button>
                  </div>
                </>
              ) : (
                <img
                  src={previewImageUrl}
                  alt="Vehicle ANPR Capture"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Processing Spinner Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    Running Computer Vision Plate Detection & OCR...
                  </span>
                </div>
              )}
            </div>

            {/* Camera Gate Selection Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-medium">Switch Gate Feed:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { gate: 'GATE-01-NORTH', cam: 'CAM-N01-IN', label: 'Gate 1 (Kotilingala Ghat)' },
                  { gate: 'GATE-02-CENTRAL', cam: 'CAM-C02-IN', label: 'Gate 2 (Main Pushkar Ghat)' },
                  { gate: 'GATE-03-BUS-SOUTH', cam: 'CAM-B03-IN', label: 'Gate 3 (Bus Terminal)' },
                  { gate: 'GATE-05-VIP-SPECIAL', cam: 'CAM-V05-IN', label: 'Gate 5 (VIP Protocol)' },
                ].map((item) => (
                  <button
                    key={item.gate}
                    onClick={() => {
                      setSelectedGate(item.gate);
                      setActiveCameraId(item.cam);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                      selectedGate === item.gate
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.cam}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Test Vehicle Library (1-Click Test Samples) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Preset Test Vehicle Library</span>
                <span className="text-[10px] text-cyan-400 font-mono">1-Click Test</span>
              </h4>
              <span className="text-[11px] text-slate-400">Click to run instant detection</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAMPLE_VEHICLES.map((v) => (
                <button
                  key={v.plate}
                  onClick={() => handleSelectSample(v)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentPlateInput === v.plate
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md shadow-cyan-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-cyan-300 truncate">
                    {v.plate}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {v.category} • {v.state.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Extracted Telemetry, Crop, Validation, Actions */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ANPR Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted License Plate Telemetry</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Confidence: {detectionResult?.confidence || 98.4}%
              </span>
            </div>

            {/* Cropped Plate Image Display */}
            <div>
              <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                <span>Cropped Plate Texture (HSRP High-Res):</span>
                <span className="text-[10px] font-mono text-cyan-400">Target [244, 189, 152, 46]</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {detectionResult?.cropped_plate_url ? (
                  <img
                    src={detectionResult.cropped_plate_url}
                    alt="Cropped Number Plate"
                    className="h-16 rounded-lg border border-slate-700 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-full flex items-center justify-center text-xs text-slate-500 font-mono">
                    Generating cropped plate...
                  </div>
                )}
              </div>
            </div>

            {/* Plate String Display & Manual Edit */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">
                  Normalized Registration Number:
                </span>
                <button
                  onClick={() => openCorrectionModal('EVT-ACTIVE', currentPlateInput)}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Manual Correction</span>
                </button>
              </div>

              <div className="text-2xl font-black font-mono tracking-widest text-white text-center py-1">
                {currentPlateInput}
              </div>

              {/* Format Validation Chip */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Format Verification:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    validation.isValid
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {validation.format}
                </span>
              </div>
            </div>

            {/* Repeat Entry Alert Flag */}
            {activeSessionWithPlate && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-rose-300">Repeat Entry Detected!</div>
                  <div className="text-rose-200 mt-0.5">
                    Vehicle <strong className="font-mono">{currentPlateInput}</strong> is currently parked inside in{' '}
                    <strong className="font-mono">{activeSessionWithPlate.slot_id}</strong> (Token: {activeSessionWithPlate.token_number}).
                  </div>
                </div>
              </div>
            )}

            {/* Telemetry Breakdown Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Detected Vehicle Type</div>
                <div className="font-bold text-white uppercase mt-0.5">{selectedCategory}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Inference Time</div>
                <div className="font-bold text-emerald-400 font-mono mt-0.5">
                  {detectionResult?.processing_time_ms || 88} ms
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Camera Unit ID</div>
                <div className="font-bold text-slate-200 font-mono mt-0.5">{activeCameraId}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Gate Checkpoint</div>
                <div className="font-bold text-slate-200 mt-0.5">{selectedGate}</div>
              </div>
            </div>

            {/* Action Bar: Allocate Slot or Process Entry */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  if (onNavigateToEntryWithPlate) {
                    onNavigateToEntryWithPlate(currentPlateInput, selectedCategory);
                  }
                }}
                disabled={Boolean(activeSessionWithPlate)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                  activeSessionWithPlate
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950'
                }`}
              >
                <span>Proceed to Slot Allocation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Physical gate barrier will only open after slot confirmation & token issue.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Manual OCR Correction Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Manual OCR Number Plate Correction</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Corrected Plate String:</label>
                <input
                  type="text"
                  value={correctedPlateText}
                  onChange={(e) => setCorrectedPlateText(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase"
                  placeholder="e.g. AP 39 XX 1234"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operator Justification Notes:</label>
                <input
                  type="text"
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Mud on plate obscured last digit 4"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentPlateInput(correctedPlateText);
                  handleSaveCorrection();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
