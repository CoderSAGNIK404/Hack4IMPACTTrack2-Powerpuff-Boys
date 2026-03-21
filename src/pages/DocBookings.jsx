import React, { useState, useEffect } from 'react';
import { Search, CalendarClock, ChevronRight, CheckCircle2, Clock, MapPin, Star, X } from 'lucide-react';
import { doctors } from '../data/doctors';

const DocBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Load bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('suraksha_doc_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      // Default mock data if first time
      const initialBookings = [
        { id: 1, doctor: "Dr. Arvind Sharma", specialty: "Cardiologist", date: "Today, 14:30", status: "Confirmed", image: doctors[0].image },
        { id: 2, doctor: "Dr. Meera Reddy", specialty: "Wellness Expert", date: "Tomorrow, 11:00", status: "Pending", image: doctors[1].image }
      ];
      setBookings(initialBookings);
      localStorage.setItem('suraksha_doc_bookings', JSON.stringify(initialBookings));
    }
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = () => {
    if (!selectedDoc || !selectedSlot) return;

    const newBooking = {
      id: Date.now(),
      doctor: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: selectedSlot,
      status: "Confirmed",
      image: selectedDoc.image
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('suraksha_doc_bookings', JSON.stringify(updatedBookings));
    
    // Reset modal
    setSelectedDoc(null);
    setSelectedSlot('');
  };

  const cancelBooking = (id) => {
    const updatedBookings = bookings.filter(b => b.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem('suraksha_doc_bookings', JSON.stringify(updatedBookings));
  };

  return (
    <div className="space-y-10 animate-[slide-up-fade_0.8s_ease-out] relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Doc<span className="text-emerald-500">Bookings</span></h2>
            <p className="text-emerald-50/40 font-medium">Specialist Search, Real-time Tracking & Appointment Status</p>
        </div>
        
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
           <input 
             type="text" 
             placeholder="Search Specialist or Specialty..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Trackers */}
        <div className="lg:col-span-1 space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-4 ml-2">Active Trackers</h3>
           {bookings.length === 0 && (
             <div className="p-8 text-center bg-white/5 border border-white/10 rounded-[2rem]">
               <CalendarClock className="w-10 h-10 text-white/20 mx-auto mb-3" />
               <p className="text-white/40 font-bold text-sm">No active bookings found.</p>
             </div>
           )}
           {bookings.map((booking) => (
             <div key={booking.id} className="relative p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 hover:border-white/20 transition-all overflow-hidden group">
                <button 
                  onClick={() => cancelBooking(booking.id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Cancel Appointment"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-4">
                   <img src={booking.image} className="w-12 h-12 rounded-xl object-cover bg-white/10" alt={booking.doctor} />
                   <div>
                      <h4 className="font-black text-white text-sm">{booking.doctor}</h4>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{booking.specialty}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                   <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                     booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                   }`}>
                      {booking.status}
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
                      <Clock size={12} className="text-emerald-500" />
                      <span>{booking.date}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Global Directory Search Results */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between ml-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Clinical Directory</h3>
              <span className="text-[10px] font-black text-white/10 tracking-widest">{filteredDoctors.length} Specialists Found</span>
           </div>
           
           <div className="space-y-4">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="group p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/10 transition-all cursor-pointer">
                   <div className="relative shrink-0">
                      <img src={doc.image} className="w-20 h-20 rounded-[2rem] object-cover bg-white/10" alt={doc.name} />
                      <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1.5 border border-white/10">
                        <div className="flex items-center gap-1 px-1.5 bg-yellow-400 rounded-full text-[9px] font-black text-black">
                           <Star size={10} fill="currentColor" />
                           {doc.rating}
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h4 className="text-xl font-black text-white truncate tracking-tight">{doc.name}</h4>
                         <div className="px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-[0.15em]">Live Available</div>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mb-3">{doc.specialty}</p>
                      
                      <div className="flex items-center gap-6 text-[11px] font-bold text-white/30 uppercase tracking-wide">
                         <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/search/${encodeURIComponent(doc.hospital)}`, '_blank', 'noopener,noreferrer');
                            }}
                            title="Open in Google Maps"
                         >
                            <MapPin size={12} />
                            <span>{doc.hospital}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <CalendarClock size={12} />
                            <span>{doc.slots[0]} Nearest</span>
                         </div>
                      </div>
                   </div>
                   
                   <button className="p-4 bg-emerald-500 text-black rounded-2xl group-hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <span className="text-xs font-black uppercase tracking-widest">Book</span>
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Booking Modal Overlay */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#0a0f14] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => { setSelectedDoc(null); setSelectedSlot(''); }}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={selectedDoc.image} className="w-16 h-16 rounded-[1.5rem] object-cover bg-white/10" alt={selectedDoc.name} />
                <div>
                  <h3 className="text-xl font-black text-white">{selectedDoc.name}</h3>
                  <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{selectedDoc.specialty}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Node Slot</label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedDoc.slots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedSlot === slot 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleBook}
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                  selectedSlot 
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-[1.02]' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocBookings;

