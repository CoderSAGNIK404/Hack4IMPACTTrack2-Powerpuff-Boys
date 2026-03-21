import React, { useState, useEffect } from 'react';
import { Activity, Shield, Heart, Zap, ArrowRight, MapPin, User, Bell, Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import DNAModel from '../components/DNAModel';
import StatCard from '../components/StatCard';
import HealthRing from '../components/HealthRing';
import GlassModal from '../components/GlassModal';
import DoctorBooking from '../components/DoctorBooking';

const HomePage = () => {
  const [isLive, setIsLive] = useState(false);
  const [pulse, setPulse] = useState(72);
  const [userName, setUserName] = useState("");
  const [activeModal, setActiveModal] = useState(null); // 'clinics', 'profile', 'history', 'settings'
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem('suraksha_user_name');
    if (savedName) {
      setUserName(savedName);
    } else {
      setUserName("Explorer"); // Default if not found
    }

    // Load latest assessment
    try {
      const savedAssesment = localStorage.getItem('suraksha_latest_assessment');
      if (savedAssesment) setAssessment(JSON.parse(savedAssesment));
    } catch(e) {}
  }, []);

  // Simulate live heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => 70 + Math.floor(Math.random() * 8));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Simple simulation of "Live Dashboard" after landing
  useEffect(() => {
    const timer = setTimeout(() => setIsLive(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-black/40">
      
      {!isLive ? (
        /* Original Cinematic Hero during "Initial Loading/Landing" phase */
        <section className="w-full max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10 transition-opacity duration-1000">
          <div className="space-y-8 animate-[slide-up-fade_1s_ease-out_forwards]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
              <Shield className="w-4 h-4" /> Your Health, Secured
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white leading-tight tracking-tighter">
              Suraksha<span className="text-emerald-500">AI</span>
            </h1>
            <p className="text-xl text-emerald-50/60 max-w-xl leading-relaxed font-medium">
              Initializing <span className="text-emerald-400">Gemini Pro AI</span> node... 
              Establishing secure clinical uplink for real-time assessment.
            </p>
          </div>
          <div className="w-full h-[500px] relative animate-[dna-fade-in_2s_ease-out_forwards] flex items-center justify-center">
            <DNAModel />
          </div>
        </section>
      ) : (
        /* Live Dashboard View */
        <section className="w-full max-w-7xl mx-auto px-8 py-12 space-y-10 relative z-10 animate-[fade-in-modal_1s_ease-out_forwards]">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                Welcome back, <span className="text-emerald-500">{userName}</span>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
              </h2>
              <p className="text-emerald-50/40 font-medium">Your global health node is synchronized and active.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                  < Bell className="w-5 h-5" />
               </button>
               <Link to="/form" className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                  New Diagnostic
                  <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Left Column: Stats & Status */}
             <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <StatCard icon={<Heart className="w-6 h-6" />} label="Heart Rate" value={pulse} unit="BPM" trend="Live" color="rose" />
                   <StatCard icon={<Activity className="w-6 h-6" />} label="Blood Pressure" value="120/80" unit="mmHg" trend="Stable" color="emerald" />
                   <StatCard 
                     icon={<Zap className="w-6 h-6" />} 
                     label="Risk Score" 
                     value={assessment?.riskLevel || "Low"} 
                     unit="Risk" 
                     trend="Calculated" 
                     color={assessment?.riskLevel === 'High' ? 'red' : assessment?.riskLevel === 'Medium' ? 'yellow' : 'blue'} 
                   />
                </div>
                
                <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                      <Shield className="w-32 h-32 text-emerald-500" />
                   </div>
                   <div className="relative z-10 space-y-6">
                      <div className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500/60">AI Daily Summary</div>
                      <h3 className="text-3xl font-black text-white max-w-lg leading-tight">
                         {assessment ? (
                           assessment.riskLevel === 'High' ? <>Your biological markers indicate <span className="text-red-400">critical risks</span> today.</> :
                           assessment.riskLevel === 'Medium' ? <>Your biological markers indicate <span className="text-yellow-400">elevated risks</span> today.</> :
                           <>Your biological markers indicate <span className="text-emerald-400">optimal performance</span> today.</>
                         ) : (
                           <>Your biological markers indicate <span className="text-emerald-400">optimal performance</span> today.</>
                         )}
                      </h3>
                      <p className="text-emerald-50/40 max-w-md leading-relaxed">
                         {assessment ? assessment.suggestions[0] : "The clinical node detected no anomalies in your last sync. Continue your current routine and stay hydrated."}
                      </p>
                      <Link to="/result" className="text-emerald-400 font-black text-sm uppercase tracking-widest hover:text-emerald-300 transition-colors inline-flex items-center gap-2">
                         Full medical report <ArrowRight className="w-4 h-4" />
                      </Link>
                   </div>
                </div>
             </div>

             {/* Right Column: DNA & Score */}
             <div className="lg:col-span-4 space-y-8">
                <HealthRing percentage={92} status="Peak Performance" />
                
                <div className="h-[300px] rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center p-8">
                   <div className="absolute inset-0 opacity-40">
                      <DNAModel />
                   </div>
                   <div className="relative z-10 text-center space-y-2">
                       <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Biometric Sync</div>
                       <div className="text-2xl font-black text-white tracking-widest leading-none">ACTIVE</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
             {[
                { icon: <MapPin />, label: "Find Clinics", action: () => setActiveModal('clinics') },
                { icon: <User />, label: "Health Profile", action: () => setActiveModal('profile') },
                { icon: <Search />, label: "Bio History", action: () => setActiveModal('history') },
                { icon: <Settings />, label: "Node Settings", action: () => setActiveModal('settings') }
             ].map((action, i) => (
                <button key={i} onClick={action.action} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10 group">
                   <div className="p-3 bg-white/5 rounded-xl group-hover:text-emerald-400 transition-colors">{action.icon}</div>
                   <span className="font-extrabold text-white text-sm">{action.label}</span>
                </button>
             ))}
          </div>
        </section>
      )}

      {/* Quick Action Modals */}
      <GlassModal 
        isOpen={activeModal === 'clinics'} 
        onClose={() => setActiveModal(null)} 
        title="Find Clinics & Specialists"
      >
        <DoctorBooking recommendedType="Any" isHighRisk={false} />
      </GlassModal>

      <GlassModal 
        isOpen={activeModal === 'profile'} 
        onClose={() => setActiveModal(null)} 
        title="Patient Health Profile"
      >
        <div className="space-y-8 text-white">
          <div className="flex items-center gap-6 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem]">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-3xl font-black">{userName || 'Active Patient'}</h4>
              <p className="text-emerald-50/40 font-medium">Global ID: SRK-7740-X</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
              <div className="text-xs font-black text-emerald-500/60 uppercase tracking-widest mb-2">Biological Status</div>
              <div className="text-lg font-bold">Synchronized & Optimal</div>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
              <div className="text-xs font-black text-emerald-500/60 uppercase tracking-widest mb-2">Last Assessment</div>
              <div className="text-lg font-bold">Today, 09:24 AM</div>
            </div>
          </div>
        </div>
      </GlassModal>

      <GlassModal 
        isOpen={activeModal === 'history'} 
        onClose={() => setActiveModal(null)} 
        title="Biometric Scan History"
      >
        <div className="space-y-4">
          {[
            { date: "March 21, 2026", type: "Full Clinical Scan", result: "Optimal", color: "text-emerald-400" },
            { date: "March 18, 2026", type: "Cardiac Stress Test", result: "Normal", color: "text-blue-400" },
            { date: "March 12, 2026", type: "Neuro-Sync Check", result: "Stable", color: "text-purple-400" },
            { date: "March 05, 2026", type: "Initial Onboarding", result: "Sync OK", color: "text-emerald-400" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="space-y-1">
                <div className="text-sm font-black text-white">{item.type}</div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{item.date}</div>
              </div>
              <div className={`text-xs font-black uppercase tracking-widest ${item.color} group-hover:scale-110 transition-transform`}>{item.result}</div>
            </div>
          ))}
        </div>
      </GlassModal>

      <GlassModal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
        title="Clinical Node Settings"
      >
        <div className="space-y-8">
           <div className="space-y-4">
              <label className="text-xs font-black text-emerald-500/60 uppercase tracking-widest block ml-2">Display Name</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => {
                  const newName = e.target.value;
                  setUserName(newName);
                  localStorage.setItem('suraksha_user_name', newName);
                }}
                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all" 
              />
           </div>
           <div className="pt-6 border-t border-white/5">
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-black hover:bg-red-500/20 transition-all uppercase tracking-widest"
              >
                Reset Biological Node
              </button>
           </div>
        </div>
      </GlassModal>

      {/* Stats Section moved to bottom/hidden on dashboard */}
      {!isLive && (
        <section className="w-full bg-emerald-950/20 py-20 px-8 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-12 text-center">
            {[
              { val: "94.2%", label: "AI Accuracy" },
              { val: "50k+", label: "Lives Analyzed" },
              { val: "2.5s", label: "Diagnostic Speed" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-5xl font-black text-white tracking-tighter">{stat.val}</div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
