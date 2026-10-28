import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import {
  Tv,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Sun,
  Moon,
  Car,
  Languages,
  ShieldCheck,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

export const SignboardPreviewScreen: React.FC = () => {
  const { summary, zones } = useParking();

  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<'EN' | 'TE' | 'BOTH'>('BOTH');
  const [selectedGantry, setSelectedGantry] = useState<string>('GANTRY-01');

  // Compute live available counts
  const carAvail = summary.categoryStats.CAR?.available || 80;
  const busAvail = summary.categoryStats.BUS?.available || 8;
  const bikeAvail = summary.categoryStats.BIKE?.available || 55;
  const vipAvail = summary.categoryStats.VIP?.available || 5;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">
              Module F • Driver Guidance System
            </span>
            <span className="text-xs text-slate-400">LED Variable Message Signs (VMS)</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Tv className="w-5 h-5 text-amber-400" />
            <span>Roadside Dynamic Parking Signboard Preview</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulates the high-luminance full-matrix LED VMS gantries deployed across Rajahmundry highway entries and Godavari bridge approaches.
          </p>
        </div>

        {/* Controls: Day/Night Mode, Language, Location */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNightMode((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            <span>{isNightMode ? 'Day Mode' : 'Night Mode'}</span>
          </button>

          <button
            onClick={() => {
              if (language === 'EN') setLanguage('TE');
              else if (language === 'TE') setLanguage('BOTH');
              else setLanguage('EN');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold transition"
          >
            <Languages className="w-4 h-4" />
            <span>Language: {language === 'BOTH' ? 'Bilingual (EN + TE)' : language === 'EN' ? 'English' : 'Telugu (తెలుగు)'}</span>
          </button>

          <select
            value={selectedGantry}
            onChange={(e) => setSelectedGantry(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            <option value="GANTRY-01">VMS Gantry 1 - NH-16 Godavari Arch Bridge North</option>
            <option value="GANTRY-02">VMS Gantry 2 - Kotilingala Ghat Bund Junction</option>
            <option value="GANTRY-03">VMS Gantry 3 - Havelock Bridge Flyover Entry</option>
          </select>
        </div>
      </div>

      {/* Main Gantry Viewport Container */}
      <div className={`rounded-3xl p-6 sm:p-10 border transition-all duration-300 ${
        isNightMode
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-black border-slate-800 shadow-2xl'
          : 'bg-gradient-to-b from-sky-200 via-sky-100 to-slate-200 border-sky-300 shadow-xl'
      }`}>
        
        {/* Overhead Gantry Steel Truss graphic */}
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
              isNightMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-700 border border-slate-300'
            }`}>
              HIGHWAY OVERHEAD GANTRY: {selectedGantry} • RAJAHMUNDRY
            </span>
          </div>

          {/* Realistic High-Fidelity Slide 11 Signboard Recreation */}
          <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 border-4 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden font-mono">
            {/* LED Dot Matrix Texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px] opacity-40 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              
              {/* Signboard Top Header Row */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                    P
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase">
                      PARKING AVAILABILITY
                    </h3>
                    {(language === 'TE' || language === 'BOTH') && (
                      <div className="text-sm font-bold text-amber-400 font-sans tracking-wide">
                        స్మార్ట్ పుష్కరాలు 2027 | పార్కింగ్ లభ్యత
                      </div>
                    )}
                  </div>
                </div>

                {/* Right directional arrow as printed on slide 11 */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-lg">
                    <Car className="w-7 h-7" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    <ArrowRight className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Main LED Matrix Counters (Matching Slide 11 Colors) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Main Parking (Cars Zone A) */}
                <div className="bg-black/80 border-2 border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-300">
                      Main Parking (Cars)
                    </div>
                    {(language === 'TE' || language === 'BOTH') && (
                      <div className="text-xs text-slate-400 font-sans">
                        ప్రధాన కార్ పార్కింగ్ (కోటిలింగాల)
                      </div>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono led-glow-green">
                    {carAvail}
                  </div>
                </div>

                {/* Ghat Parking (Pushkar Ghat) */}
                <div className="bg-black/80 border-2 border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-300">
                      Ghat Parking (Pushkar Ghat)
                    </div>
                    {(language === 'TE' || language === 'BOTH') && (
                      <div className="text-xs text-slate-400 font-sans">
                        పుష్కర ఘాట్ పార్కింగ్
                      </div>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono led-glow-amber">
                    {Math.round(carAvail * 0.4)}
                  </div>
                </div>

                {/* Bus Parking */}
                <div className="bg-black/80 border-2 border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-300">
                      Bus Parking (APSRTC / Shuttles)
                    </div>
                    {(language === 'TE' || language === 'BOTH') && (
                      <div className="text-xs text-slate-400 font-sans">
                        ఆర్టీసీ / టూర్ బస్సుల పార్కింగ్
                      </div>
                    )}
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black font-mono ${
                    busAvail <= 2 ? 'text-rose-500 led-glow-red' : 'text-amber-400 led-glow-amber'
                  }`}>
                    {busAvail}
                  </div>
                </div>

                {/* VIP Parking */}
                <div className="bg-black/80 border-2 border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-300">
                      VIP & Protocol Parking
                    </div>
                    {(language === 'TE' || language === 'BOTH') && (
                      <div className="text-xs text-slate-400 font-sans">
                        ప్రోటోకాల్ వి.ఐ.పి. పార్కింగ్
                      </div>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono led-glow-green">
                    {vipAvail}
                  </div>
                </div>

              </div>

              {/* Dynamic Scrolling Highway Guidance Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-bold text-amber-300 uppercase">
                    ACTIVE TRAFFIC ADVISORY:
                  </span>
                </div>
                <div className="font-mono text-cyan-300 truncate max-w-xl">
                  {summary.congestionStatus === 'HIGH' || summary.congestionStatus === 'CRITICAL'
                    ? 'Zone A High Congestion → Divert via Havelock Flyover to Satellite Terminal Zone C'
                    : 'Smooth Traffic Flow to Godavari Ghats • Follow Green Lane for Smart ANPR Entry'}
                </div>
              </div>

            </div>
          </div>

          {/* Support Gantry Pillars Representation */}
          <div className="flex justify-between px-8 text-[11px] text-slate-500 font-mono">
            <span>[▲ Gantry Left Pylon - NH-16 Approach]</span>
            <span>[▲ Gantry Right Pylon - Riverfront Bund]</span>
          </div>

        </div>

      </div>

      {/* Operational Rules Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>VMS Signboard Intelligence & Fail-Safe Architecture</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Variable Message Signs subscribe directly to the central PostgreSQL / WebSocket telemetry state. 
          When any individual zone breaches 95% capacity, the sign automatically transitions that zone to <strong>FULL (ఎరుపు రంగు)</strong> and flashes a dynamic arrow redirecting drivers to the nearest under-utilized peripheral parking zone before congestion spills onto highway ramps.
        </p>
      </div>

    </div>
  );
};
