import { AlertTriangle, X } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Persistent pulsing red background overlay */}
      <div className="fixed inset-0 z-[190] bg-red-600/90 backdrop-blur-md animate-[pulse_1.5s_ease-in-out_infinite] pointer-events-none transition-all duration-300"></div>
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-[scale-in-modal_0.4s_ease-out_forwards] shadow-2xl relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100 relative">
            <div className="bg-red-100 p-4 rounded-full text-danger animate-pulse">
              <AlertTriangle className="w-12 h-12" />
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Alert Triggered</h2>
            <p className="text-gray-600 mb-6">
              Help is on the way. Please stay calm and remain at your current location.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-600/20"
            >
              Acknowledge
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default EmergencyModal;
