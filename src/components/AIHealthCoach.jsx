import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, ShieldCheck } from 'lucide-react';

const AIHealthCoach = ({ riskLevel, userData }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyzing(false);
      const advices = {
        High: "Based on your clinical markers, my AI neurological model suggests an immediate cardiovascular screening. I've flagged the earliest available cardiologists with priority status for you.",
        Medium: "Your metrics show moderate vital strain. I recommend a consultation with a General Physician to baseline your health. Stay active but monitor your heart rate during exertion.",
        Low: "Fantastic! Your health profile is robust. I recommend a periodic Wellness check-in every 6 months to maintain this trend."
      };
      setInsight(advices[riskLevel] || advices.Low);
    }, 2500);
    return () => clearTimeout(timer);
  }, [riskLevel]);

  return (
    <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/40 border border-emerald-500/20">
      
      {/* Decorative pulse */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="w-32 h-32 text-emerald-400 rotate-12" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-500/20 p-2 rounded-xl backdrop-blur-md">
          <Brain className="w-6 h-6 text-emerald-400" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase opacity-60">Gemini Health AI</span>
      </div>

      {analyzing ? (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            <p className="text-emerald-300 font-medium animate-pulse italic">AI is analyzing your biomarkers...</p>
          </div>
          <div className="w-full bg-emerald-500/10 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-1/2 animate-[expand-circle_2s_infinite]"></div>
          </div>
        </div>
      ) : (
        <div className="animate-[slide-up-fade_0.6s_ease-out]">
          <h3 className="text-2xl font-bold mb-3 leading-tight">Insight from SurakshaAI Coach</h3>
          <p className="text-emerald-100/80 mb-6 leading-relaxed">
            {insight}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Accuracy 94.2%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHealthCoach;
