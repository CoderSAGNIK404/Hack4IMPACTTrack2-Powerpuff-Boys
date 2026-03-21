import { useState, useEffect } from 'react';
import { AlertTriangle, X, Phone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'suraksha_emergency_contacts';
const HELPLINE = '+911234567890';

const EmergencyModal = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      try { setContacts(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
      catch { setContacts([]); }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Pulsing red overlay */}
      <div className="fixed inset-0 z-190 bg-red-950/90 backdrop-blur-2xl animate-[custom-pulse_1.5s_infinite] pointer-events-none"></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
        <div className="bg-black/80 backdrop-blur-3xl rounded-[3rem] w-full max-w-md overflow-hidden animate-[scale-in-modal_0.4s_ease-out_forwards] shadow-[0_0_100px_rgba(239,68,68,0.3)] border border-red-500/20 relative">
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all z-10">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-red-500/10 p-8 flex flex-col items-center border-b border-red-500/10">
            <div className="bg-red-500/20 p-5 rounded-full text-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.4)] mb-4">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter">SOS ACTIVATED</h2>
            <p className="text-red-300/50 text-[10px] font-black uppercase tracking-widest mt-2">Emergency protocol engaged</p>
          </div>

          {/* Status */}
          <div className="p-6 space-y-4">
            {/* Helpline call status */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
              <Phone size={18} className="text-red-400" />
              <div>
                <p className="text-xs font-black text-red-400 uppercase tracking-widest">Calling Helpline</p>
                <p className="text-[10px] text-white/30 mt-0.5">{HELPLINE}</p>
              </div>
            </div>

            {/* SMS status */}
            {contacts.length > 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                <Shield size={18} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">SMS Alert Sent</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{contacts.map(c => c.name).join(' & ')}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <Shield size={18} className="text-white/20" />
                <div>
                  <p className="text-xs font-bold text-white/30">No SOS contacts configured</p>
                  <button
                    onClick={() => { onClose(); navigate('/sos-contacts'); }}
                    className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 mt-0.5"
                  >
                    Go to SOS Board →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-red-500/10">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyModal;
