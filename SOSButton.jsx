import { useState } from 'react';
import { Siren, Ambulance } from 'lucide-react';
import EmergencyModal from './EmergencyModal';
import { createPortal } from 'react-dom';

const SOSButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSOSClick = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    // Vibrate device if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Start ambulance animation
    setIsAnimating(true);

    // Wait for the animation to complete (2 seconds) before showing the modal/call
    setTimeout(() => {
      setIsAnimating(false);
      setIsModalOpen(true);
    }, 2000);
  };

  const portalContent = (
    <>
      {/* Ambulance Animation Layer */}
      {isAnimating && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center bg-red-600/90 backdrop-blur-md animate-pulse transition-all duration-300">
          <div className="animate-ambulance text-white drop-shadow-2xl flex items-center gap-4">
            <Ambulance className="w-24 h-24 md:w-32 md:h-32" />
            {/* Flashing siren effect */}
            <div className="w-12 h-12 rounded-full bg-white animate-[pulse_0.2s_infinite] blur-xl absolute top-0 right-10"></div>
            <div className="w-12 h-12 rounded-full bg-blue-300 animate-[pulse_0.25s_infinite_delay-100ms] blur-xl absolute top-0 left-10"></div>
          </div>
        </div>
      )}
      <EmergencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );

  return (
    <>
      <button
        onClick={handleSOSClick}
        className="flex items-center justify-center gap-2 bg-danger text-white rounded-full px-5 py-2 font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-600 transition-all hover:scale-105 active:scale-95 animate-[pulse_1.5s_ease-in-out_infinite]"
        aria-label="Emergency SOS"
      >
        <Siren className="w-6 h-6 animate-pulse" />
        <span>SOS</span>
      </button>
      
      {/* Render the modal and animation at the root of the body to escape Navbar z-index/filter constraints */}
      {typeof document !== 'undefined' ? createPortal(portalContent, document.body) : portalContent}
    </>
  );
};

export default SOSButton;
