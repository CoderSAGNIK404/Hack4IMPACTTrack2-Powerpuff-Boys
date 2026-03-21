import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HealthFormPage from './pages/HealthFormPage';
import MrsSuraksha from './components/MrsSuraksha';
import Sidebar from './components/Sidebar';

// New Clinical Modules
import AIPredictor from './pages/AIPredictor';
import MedTimeline from './pages/MedTimeline';
import DocBookings from './pages/DocBookings';
import ResultPage from './pages/ResultPage';
import SOSContacts from './pages/SOSContacts';
import ProfilePage from './pages/ProfilePage';
import PharmacyLocator from './pages/PharmacyLocator';

function AppContent() {
  const location = useLocation();
  const [showSuraksha, setShowSuraksha] = useState(false);
  const isLandingOrLogin = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className={`min-h-screen flex text-white relative overflow-hidden ${isLandingOrLogin ? 'bg-black' : 'bg-[#05070a]'}`}>
      {/* Decorative global background */}
      {!isLandingOrLogin && (
        <div className="fixed inset-0 pointer-events-none -z-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        </div>
      )}

      {/* Sidebar - Persistent navigation */}
      {!isLandingOrLogin && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {!isLandingOrLogin && <Navbar onOpenSuraksha={() => setShowSuraksha(true)} />}

        <main className={`flex-1 w-full overflow-y-auto custom-scrollbar ${isLandingOrLogin ? '' : 'px-8 pb-12'}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/predict" element={<AIPredictor />} />
            <Route path="/timeline" element={<MedTimeline />} />
            <Route path="/bookings" element={<DocBookings />} />
            <Route path="/sos-contacts" element={<SOSContacts />} />
            <Route path="/pharmacies" element={<PharmacyLocator />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/form" element={<HealthFormPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </main>
      </div>

      <MrsSuraksha isOpen={showSuraksha} onClose={() => setShowSuraksha(false)} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
