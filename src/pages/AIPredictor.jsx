import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, TrendingUp, Heart, Activity } from 'lucide-react';

const AIPredictor = () => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const startPrediction = () => {
    setIsPredicting(true);
    // Simulate complex AI forecasting using real stored assessment data
    setTimeout(() => {
      let baseRisk = 12;
      let summaryText = "Based on your biometric node synchronization, your 10-year risk for chronic cardiovascular issues remains at a baseline of 12%. Recommendation: Increase Omega-3 intake and maintain 120ms HRV sync.";
      
      try {
        const saved = localStorage.getItem('suraksha_latest_assessment');
        if (saved) {
           const data = JSON.parse(saved);
           if (data.riskLevel === 'High') {
             baseRisk = 85;
             summaryText = `CRITICAL ALERT: Your BMI of ${data.bmi} and recent biometrics indicate an 85% probability of severe cardiovascular or metabolic events within 5 years. ${data.suggestions[0] || 'Seek immediate medical counsel.'}`;
           } else if (data.riskLevel === 'Medium') {
             baseRisk = 45;
             summaryText = `ELEVATED RISK: Your recent biometrics indicate a 45% probability of metabolic or cardiac issues within 10 years. ${data.suggestions[0] || 'Optimize your lifestyle.'}`;
           } else {
             baseRisk = 8;
             summaryText = `OPTIMAL TRAJECTORY: Your recent biometrics indicate a very low 8% risk of chronic issues in the next 10 years. ${data.suggestions[0] || 'Maintain current habits.'}`;
           }
        }
      } catch(e) {}

      setPrediction({
        cardiac: baseRisk,
        respiratory: Math.max(2, baseRisk - 15),
        neurological: Math.max(5, baseRisk - 20),
        metabolic: Math.min(99, baseRisk + 12),
        overall: baseRisk,
        summary: summaryText
      });
      setIsPredicting(false);
    }, 2000); // slightly faster loading
  };

  return (
    <div className="space-y-10 animate-[slide-up-fade_0.8s_ease-out]">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Predict<span className="text-emerald-500">AI</span></h2>
        <p className="text-emerald-50/40 font-medium">Deep Neural Forecasting & Future Disease Vector Analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Card */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white">Biometric Scan</h3>
          <p className="text-sm text-white/40 leading-relaxed font-medium">Our neural engine analyzes your current biological signatures to forecast potential health deviations over the next 5-15 years.</p>
          
          <button 
            onClick={startPrediction}
            disabled={isPredicting}
            className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isPredicting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Analyzing Vectors...
              </>
            ) : (
              <>
                Start Forecasting
                <TrendingUp size={18} />
              </>
            )}
          </button>
        </div>

        {/* Results / Empty State */}
        <div className="lg:col-span-2 relative min-h-[400px]">
          {!prediction && !isPredicting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center opacity-40">
                <ShieldAlert size={48} className="text-white/20 mb-4" />
                <p className="text-white/40 font-black uppercase tracking-widest text-xs">Awaiting Biometric Data Stream</p>
            </div>
          ) : (
            <div className={`space-y-6 p-1 bg-transparent transition-opacity duration-1000 ${isPredicting ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Cardiac Risk', val: prediction?.cardiac, icon: <Heart className="text-red-400" /> },
                    { label: 'Neuro Decay', val: prediction?.neurological, icon: <Activity className="text-purple-400" /> },
                    { label: 'Metabolic', val: prediction?.metabolic, icon: <TrendingUp className="text-blue-400" /> },
                    { label: 'Overall Unit', val: prediction?.overall, icon: <ShieldAlert className="text-emerald-400" /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                       <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                          <p className="text-2xl font-black text-white">{stat.val}%</p>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8">
                  <h4 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Neural Clinical Summary</h4>
                  <p className="text-white/80 leading-relaxed font-medium italic">
                    {prediction?.summary}
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPredictor;

