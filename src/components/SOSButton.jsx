import { useState } from 'react';
import { Siren, Ambulance } from 'lucide-react';
import EmergencyModal from './EmergencyModal';
import { createPortal } from 'react-dom';

const HELPLINE = '+911234567890';
const STORAGE_KEY = 'suraksha_emergency_contacts';

const SOSButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSOSClick = () => {
    if (isAnimating) return;

    // Vibrate device
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Start ambulance animation
    setIsAnimating(true);

    // After animation, trigger calls and SMS
    setTimeout(() => {
      setIsAnimating(false);

      // 1. Call helpline immediately
      window.open(`tel:${HELPLINE}`, '_self');

      // 2. Send SOS SMS to saved contacts via sms: URI
      try {
        const contacts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const userName = localStorage.getItem('suraksha_user_name') || 'Patient';
        
        if (contacts.length > 0) {
          const phones = contacts.map(c => c.phone).join(',');
          const message = encodeURIComponent(
            `🚨 SURAKSHA SOS ALERT 🚨\n${userName} has triggered an emergency SOS via SurakshaAI.\nPlease contact them immediately!\nThis is an automated emergency alert.`
          );
          // Open SMS with pre-filled message to all contacts
          setTimeout(() => {
            window.open(`sms:${phones}?body=${message}`, '_self');
          }, 2000);
        }
      } catch (err) {
        console.error('SOS SMS error:', err);
      }

      // Show the SOS active modal
      setIsModalOpen(true);
    }, 2000);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const portalContent = (
    <>
      {/* Ambulance Animation Layer */}
      {isAnimating && (
        <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden flex items-center bg-red-600/90 backdrop-blur-md animate-pulse transition-all duration-300">
          <div className="animate-ambulance text-white drop-shadow-2xl flex items-center gap-4">
            <Ambulance className="w-24 h-24 md:w-32 md:h-32" />
            <div className="w-12 h-12 rounded-full bg-white animate-[custom-pulse_0.2s_infinite] blur-xl absolute top-0 right-10"></div>
            <div className="w-12 h-12 rounded-full bg-blue-300 animate-[custom-pulse_0.25s_infinite] blur-xl absolute top-0 left-10"></div>
          </div>
        </div>
      )}
      <EmergencyModal 
        isOpen={isModalOpen} 
        onClose={handleClose}
      />
    </>
  );

  return (
    <>
      <button
        onClick={handleSOSClick}
        className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-full px-5 py-2 font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-700 transition-all hover:scale-105 active:scale-95 animate-[custom-pulse_1.5s_infinite]"
        aria-label="Emergency SOS"
        title="Press for emergency — calls helpline & sends SMS to contacts"
      >
        <Siren className="w-6 h-6 animate-pulse" />
        <span>SOS</span>
      </button>
      
      {typeof document !== 'undefined' ? createPortal(portalContent, document.body) : portalContent}
    </>
  );
};

export default SOSButton;
