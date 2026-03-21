import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldAlert, Activity, Heart, TrendingUp, Calendar, Zap } from 'lucide-react';

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState({
    name: 'Explorer',
    email: 'Not linked',
    joined: new Date().toLocaleDateString()
  });

  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem('suraksha_user_name');
    const savedEmail = localStorage.getItem('suraksha_user_email');
    
    setUserProfile({
      name: savedName || 'Explorer',
      email: savedEmail || 'Not linked',
      joined: new Date().toLocaleDateString() // Or fetch from DB if available
    });

    try {
      const savedAssesment = localStorage.getItem('suraksha_latest_assessment');
      if (savedAssesment) {
        setAssessment(JSON.parse(savedAssesment));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="space-y-10 animate-[slide-up-fade_0.8s_ease-out]">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Neural <span className="text-emerald-500">Profile</span></h2>
        <p className="text-emerald-50/40 font-medium">Biological identity and node configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Identity Card */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <User className="w-48 h-48 text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
             <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center relative">
                <User className="w-16 h-16 text-emerald-400" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#05070a]"></div>
             </div>
             <div>
                <h3 className="text-2xl font-black text-white">{userProfile.name}</h3>
                <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mt-1">Primary Node</p>
             </div>
          </div>
          
          <div className="relative z-10 space-y-4 pt-6 border-t border-white/10">
             <div className="flex items-center gap-4 text-white/60">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span className="font-medium truncate">{userProfile.email}</span>
             </div>
             <div className="flex items-center gap-4 text-white/60">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Active Sync</span>
             </div>
          </div>
        </div>

        {/* Biometric Assessment Identity */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                 <Activity className="text-emerald-500" /> Latest Biological Signature
              </h3>
              
              {assessment ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Calculated Risk Level</p>
                       <div className="flex items-end gap-3">
                          <span className={`text-4xl font-black ${assessment.riskLevel === 'High' ? 'text-red-500' : assessment.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                             {assessment.riskLevel}
                          </span>
                       </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Current BMI Matrix</p>
                       <div className="flex items-end gap-3">
                          <span className="text-4xl font-black text-white">{assessment.bmi}</span>
                       </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 mt-2">
                       <h4 className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> AI Directive Protocol
                       </h4>
                       <ul className="space-y-3">
                          {assessment.suggestions.map((suggestion, idx) => (
                             <li key={idx} className="flex gap-3 text-white/80 font-medium">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                {suggestion}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5">
                    <ShieldAlert className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/40 font-bold max-w-sm">No biometric signature detected. Run a new diagnostic to populate your health profile.</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
