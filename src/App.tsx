import React, { useState } from 'react';
import { ParkingProvider } from './context/ParkingContext';
import { Header } from './components/layout/Header';
import { Sidebar, ScreenId } from './components/layout/Sidebar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { LiveParkingMapScreen } from './components/screens/LiveParkingMapScreen';
import { ANPRMonitoringScreen } from './components/screens/ANPRMonitoringScreen';
import { VehicleEntryScreen } from './components/screens/VehicleEntryScreen';
import { VehicleExitScreen } from './components/screens/VehicleExitScreen';
import { SlotAllocationScreen } from './components/screens/SlotAllocationScreen';
import { VehicleRecordsScreen } from './components/screens/VehicleRecordsScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { SignboardPreviewScreen } from './components/screens/SignboardPreviewScreen';
import { AdminSettingsScreen } from './components/screens/AdminSettingsScreen';
import { ReferenceConceptModal } from './components/common/ReferenceConceptModal';
import { VehicleCategory } from './types';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // States passed from ANPR screen to Entry screen
  const [stagedPlate, setStagedPlate] = useState<string>('AP 39 XX 1234');
  const [stagedCategory, setStagedCategory] = useState<VehicleCategory>('CAR');

  const handleNavigateFromANPR = (plate: string, category: VehicleCategory) => {
    setStagedPlate(plate);
    setStagedCategory(category);
    setCurrentScreen('entry');
  };

  const handleSelectScreen = (screen: ScreenId) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header onOpenConceptModal={() => setIsConceptModalOpen(true)} />

      {/* Mobile Screen Selector Bar (visible on small devices) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {currentScreen}
          </span>
        </div>
      </div>

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-full overflow-hidden relative">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            currentScreen={currentScreen}
            onSelectScreen={handleSelectScreen}
          />
        </div>

        {/* Mobile Slide-over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 bg-slate-900 h-full shadow-2xl">
              <Sidebar
                currentScreen={currentScreen}
                onSelectScreen={handleSelectScreen}
              />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4.25rem)]">
          <div className="max-w-7xl mx-auto pb-12">
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                onNavigate={setCurrentScreen}
                onOpenConceptModal={() => setIsConceptModalOpen(true)}
              />
            )}
            {currentScreen === 'map' && <LiveParkingMapScreen />}
            {currentScreen === 'anpr' && (
              <ANPRMonitoringScreen
                onNavigateToEntryWithPlate={handleNavigateFromANPR}
              />
            )}
            {currentScreen === 'entry' && (
              <VehicleEntryScreen
                initialPlate={stagedPlate}
                initialCategory={stagedCategory}
              />
            )}
            {currentScreen === 'exit' && <VehicleExitScreen />}
            {currentScreen === 'allocation' && <SlotAllocationScreen />}
            {currentScreen === 'records' && <VehicleRecordsScreen />}
            {currentScreen === 'analytics' && <AnalyticsScreen />}
            {currentScreen === 'signboard' && <SignboardPreviewScreen />}
            {currentScreen === 'settings' && <AdminSettingsScreen />}
          </div>
        </main>

      </div>

      {/* Slide Architecture Reference Modal */}
      {isConceptModalOpen && (
        <ReferenceConceptModal onClose={() => setIsConceptModalOpen(false)} />
      )}

    </div>
  );
};

export function App() {
  return (
    <ParkingProvider>
      <AppContent />
    </ParkingProvider>
  );
}

export default App;
