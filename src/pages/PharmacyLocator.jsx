import React, { useState } from 'react';
import { MapPin, Search, Navigation, Store, Plus } from 'lucide-react';

const PharmacyLocator = () => {
  const [address, setAddress] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    // Construct Google Maps search URL for pharmacies near the provided address
    const query = encodeURIComponent(`Medicine stores and pharmacies near ${address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/${query}`;
    
    // Open in a new tab
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If we wanted to reverse geocode we could, but the simplest way to open maps near them:
          const { latitude, longitude } = position.coords;
          const googleMapsUrl = `https://www.google.com/maps/search/pharmacies/@${latitude},${longitude},14z`;
          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
        },
        (error) => {
          alert("Unable to retrieve your location. Please enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-10 animate-[slide-up-fade_0.8s_ease-out]">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Pharmacy <span className="text-emerald-500">Locator</span></h2>
        <p className="text-emerald-50/40 font-medium">Find critical medical supplies and 24/7 medicine stores near your location.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Search Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <Store className="w-48 h-48 text-emerald-500" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
               <Search className="text-emerald-500" /> Global Search
            </h3>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-50/40 ml-1 uppercase tracking-widest">Enter Your Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    type="text" 
                    required 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="e.g. Times Square, NY or 123 Main St" 
                    className="w-full pl-14 pr-5 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none font-bold" 
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Find Nearby Stores
                <Navigation size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* GPS Quick Card */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 opacity-10">
              <Navigation className="w-64 h-64 text-emerald-500" />
           </div>
           <div className="relative z-10 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                 <MapPin className="w-10 h-10 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white">Auto-Detect Routing</h3>
                 <p className="text-emerald-50/60 font-medium max-w-sm mx-auto">
                    Use your device's built-in GPS to instantly scan a 5-mile radius for verified pharmaceutical locations.
                 </p>
              </div>

              <button 
                onClick={getUserLocation}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all inline-flex items-center justify-center gap-3"
              >
                Use GPS Node <Navigation className="w-4 h-4 text-emerald-400" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PharmacyLocator;
