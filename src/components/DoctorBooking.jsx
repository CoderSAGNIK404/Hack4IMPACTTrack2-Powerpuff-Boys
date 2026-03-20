import { useState } from 'react';
import { doctors } from '../data/doctors';
import { Calendar, Clock, Star, CheckCircle2, AlertCircle, ChevronRight, MapPin, ExternalLink } from 'lucide-react';

const DoctorBooking = ({ recommendedType, isHighRisk }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booked, setBooked] = useState(false);

  const filteredDoctors = doctors.filter(doc => 
    recommendedType === 'Any' || doc.specialty === recommendedType || (recommendedType === 'Wellness' && doc.specialty === 'Wellness Expert')
  );

  const handleBook = () => {
    if (selectedDoctor && selectedSlot) {
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-[slide-up-fade_0.6s_ease-out]">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          Your session with <span className="font-semibold text-emerald-700">{selectedDoctor.name}</span> is scheduled for <span className="font-semibold text-emerald-700">{selectedSlot}</span> today.
        </p>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 w-full max-w-xs text-sm text-emerald-800">
          <p>Please arrive 10 minutes before your slot.</p>
        </div>
        <button 
          onClick={() => setBooked(false)}
          className="mt-8 text-emerald-600 font-medium hover:underline text-sm"
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[slide-up-fade_0.8s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book an Appointment</h2>
          <p className="text-gray-600 text-sm mt-1">
            {isHighRisk 
              ? "Emergency priority: Select a specialist immediately." 
              : `Recommended: ${recommendedType} for your check-up.`}
          </p>
        </div>
        {isHighRisk && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            Priority Booking Available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className={`group relative overflow-hidden bg-white rounded-3xl border-2 transition-all p-5 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer ${
              selectedDoctor?.id === doc.id 
                ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                : isHighRisk && doc.specialty === 'Cardiologist'
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-gray-100'
            }`}
          >
            <div className="flex gap-4">
              <div className="relative">
                <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-2xl bg-gray-100" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-0.5 px-1 bg-yellow-400 rounded-full text-[10px] font-bold text-white">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {doc.rating}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{doc.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">{doc.specialty}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-gray-500 transition-colors hover:text-emerald-600">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-medium truncate">{doc.hospital}</span>
                </div>
              </div>
              <a 
                href={`https://www.google.com/maps/search/${encodeURIComponent(doc.name + ' ' + doc.hospital)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-100"
                title="View on Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Available Slots Today
              </p>
              <div className="flex flex-wrap gap-2">
                {doc.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoctor(doc);
                      setSelectedSlot(slot);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      selectedDoctor?.id === doc.id && selectedSlot === slot
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {selectedDoctor?.id === doc.id && selectedSlot && (
              <button
                onClick={handleBook}
                className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 animate-[slide-up-fade_0.3s_ease-out]"
              >
                Book with {doc.name.split(' ')[1]}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {isHighRisk && doc.specialty === 'Cardiologist' && !selectedDoctor && (
              <div className="absolute top-3 right-3 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                Highly Recommended
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorBooking;
