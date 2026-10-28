import React from 'react';
import { ParkingSession, ParkingZone } from '../../types';
import { Printer, CheckCircle, X, MapPin, Clock, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParkingTicketModalProps {
  session: ParkingSession;
  zone?: ParkingZone;
  onClose: () => void;
}

export const ParkingTicketModal: React.FC<ParkingTicketModalProps> = ({ session, zone, onClose }) => {
  // Fire celebratory confetti on entry confirmation
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Thermal Slip Wrapper */}
        <div id="printable-ticket" className="bg-white text-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 space-y-4 font-mono text-center">
          
          {/* Header */}
          <div className="border-b-2 border-dashed border-slate-300 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              GOVERNMENT OF ANDHRA PRADESH
            </div>
            <div className="text-sm font-black text-slate-900 tracking-tight mt-0.5">
              SMART PUSHKARALU 2027
            </div>
            <div className="text-[11px] font-bold text-cyan-800">
              RAJAHMUNDRY GODAVARI GHATS
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">
              ANPR SMART PARKING TOKEN
            </div>
          </div>

          {/* Big Slot Badge */}
          <div className="py-2 bg-slate-100 rounded-xl border border-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              Allocated Parking Space
            </div>
            <div className="text-3xl font-black text-slate-950 tracking-wider">
              {session.slot_id}
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
              {zone?.zone_name || session.zone_id}
            </div>
          </div>

          {/* Ticket Metadata Table */}
          <div className="space-y-1.5 text-xs text-left border-y-2 border-dashed border-slate-300 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle Plate:</span>
              <span className="font-bold text-slate-900">{session.registration_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle Type:</span>
              <span className="font-bold text-slate-900">{session.vehicle_category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Token ID:</span>
              <span className="font-bold text-slate-900">{session.token_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entry Gate:</span>
              <span className="font-bold text-slate-900">{session.entry_gate_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entry Timestamp:</span>
              <span className="font-bold text-slate-900">{new Date(session.entry_time).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pilgrim Fee:</span>
              <span className="font-bold text-emerald-700">FREE PASS (Pushkaralu)</span>
            </div>
          </div>

          {/* QR Code / Barcode Simulation */}
          <div className="flex flex-col items-center justify-center pt-1 space-y-1">
            <div className="w-24 h-24 bg-slate-950 p-2 rounded-xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-white" />
            </div>
            <span className="text-[9px] text-slate-500">Scan at Exit Barrier Scanner</span>
          </div>

          {/* Navigation Note */}
          <div className="text-[9px] text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
            Walking distance to holy dip: {zone?.walking_distance_meters || 200}m (~{zone?.walking_time_mins || 3} mins).
            Follow roadside LED arrows to {session.slot_id}.
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Thermal Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Done / Next Vehicle</span>
          </button>
        </div>

      </div>
    </div>
  );
};
