import React from 'react';
import { X, Layers, CheckCircle2, ExternalLink } from 'lucide-react';

interface ReferenceConceptModalProps {
  onClose: () => void;
}

export const ReferenceConceptModal: React.FC<ReferenceConceptModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                Original Concept Architecture & Visual Reference
              </div>
              <h3 className="text-lg font-black text-white">
                5. Smart Parking Slot Allocation Using ANPR | Smart Pushkaralu 2027
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Reference Poster / Slide Image */}
        <div className="rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl bg-black">
          <img
            src="/pushkaralu_concept_reference.jpg"
            alt="Smart Parking Slot Allocation Using ANPR - Pushkaralu 2027 Slide"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Slide-to-Application Feature Mapping Matrix */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>How This Web Application Translates The Slide Into An Interactive System:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300">1. Parking Dashboard (Live) Widget</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Reproduced on the Main Dashboard screen with exact initial values (Car: 120/200, Bus: 12/20, VIP: 5/10, Available: 137, 63% Occupancy). Dynamically recalculates as vehicles enter and exit.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-300">2. ANPR Entry Barrier & Plate AP 39 XX 1234</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Featured as the prime demonstration vehicle in the ANPR Monitoring screen with computer vision bounding box overlay, cropped plate texture, and OCR validation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">3. Roadside LED Signboard (VMS Preview)</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Recreated on the LED Signboard screen matching the exact matrix layout, directional arrows, and green/amber/red indicators for Main, Ghat, Bus, and VIP parking.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-bold text-indigo-300">4. Intelligent Slot Allocation Engine</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Implements the 6-step pipeline from the slide: ANPR identification → Vacancy Telemetry → AI Scoring & Allocation → Driver Guidance → Slot Release.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition"
          >
            Close & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
