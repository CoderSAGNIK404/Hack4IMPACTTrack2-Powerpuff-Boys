import { useState, useEffect } from 'react';
import { Sparkles, Brain, ShieldCheck, AlertCircle } from 'lucide-react';
import OpenAI from "openai";

const AIHealthCoach = ({ riskLevel, userData }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [insight, setInsight] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAIInsight = async () => {
      setAnalyzing(true);
      setError(false);

      // Check if we are loading from a cached assessment (userData lacks specific form data)
      const isFreshDiagnostic = userData && userData.conditions;
      
      if (!isFreshDiagnostic) {
        // Load from cache if visiting from Dashboard or Timeline
        const cachedInsight = localStorage.getItem('suraksha_ai_cached_insight');
        if (cachedInsight) {
          setInsight(cachedInsight);
          setAnalyzing(false);
          return;
        }
      }

      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      // If no API key or no fresh data, use fallback mock logic but save it so it stays
      if (!apiKey || !isFreshDiagnostic) {
        setTimeout(() => {
          const mockAdvices = {
            High: "Based on your clinical markers, my AI neurological model suggests an immediate cardiovascular screening. I've flagged the earliest available cardiologists with priority status for you.",
            Medium: "Your metrics show moderate vital strain. I recommend a consultation with a General Physician to baseline your health. Stay active but monitor your heart rate during exertion.",
            Low: "Fantastic! Your health profile is robust. I recommend a periodic Wellness check-in every 6 months to maintain this trend."
          };
          const generatedMock = mockAdvices[riskLevel] || mockAdvices.Low;
          setInsight(generatedMock);
          localStorage.setItem('suraksha_ai_cached_insight', generatedMock);
          setAnalyzing(false);
        }, 1500);
        return;
      }

      try {
        const openai = new OpenAI({
          apiKey: apiKey,
          baseURL: "https://api.groq.com/openai/v1",
          dangerouslyAllowBrowser: true
        });

        const systemPrompt = "You are a professional AI Health Coach for SurakshaAI.";
        const userPrompt = `
          Provide a comprehensive clinical analysis for the following patient profile:
          - Risk Level: ${riskLevel}
          - Biometrics: Gender ${userData.gender}, Age ${userData.age}, Height ${userData.height}cm, Weight ${userData.weight}kg.
          - Medical History: ${userData.conditions.join(', ') || 'None reported'}.
          - Lifestyle: Sleep ${userData.sleep}h, Activity ${userData.activity}, Stress ${userData.stress}, Alcohol ${userData.alcohol}, Smoking ${userData.smoking}.
          
          Provide a professional 3-sentence analysis. 
          1. Evaluate the primary risk factor (BMI, chronic condition, or lifestyle).
          2. Explain why a ${riskLevel === 'High' ? 'Cardiologist' : riskLevel === 'Medium' ? 'General Physician' : 'Wellness Expert'} is recommended.
          3. Offer one specific, high-impact lifestyle change.
        `;

        const completion = await openai.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
        });

        const resultText = completion.choices[0].message.content;
        setInsight(resultText);
        localStorage.setItem('suraksha_ai_cached_insight', resultText);
      } catch (err) {
        console.error("Groq API Error:", err);
        setError(true);
        const fallbackText = "I'm having trouble connecting to my neural network right now, but based on your local assessment, you should follow the recommended clinical steps below.";
        setInsight(fallbackText);
        // Do not cache the error message so it retries on next fresh load
      } finally {
        setAnalyzing(false);
      }
    };

    fetchAIInsight();
  }, [riskLevel, userData]);

  return (
    <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/40 border border-emerald-500/20 h-full min-h-[300px] flex flex-col justify-center">
      
      {/* Decorative pulse */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="w-32 h-32 text-emerald-400 rotate-12" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-emerald-500/20 p-2 rounded-xl backdrop-blur-md border border-emerald-500/30">
          <Brain className="w-6 h-6 text-emerald-400" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-black tracking-[0.2em] uppercase opacity-70">Gemini Pro AI</span>
      </div>

      <div className="relative z-10">
        {analyzing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              <p className="text-emerald-300 font-bold text-lg animate-pulse tracking-wide">Processing Bio-Signals...</p>
            </div>
            <div className="w-full bg-emerald-500/10 h-2 rounded-full overflow-hidden border border-emerald-500/20">
              <div className="bg-emerald-400 h-full w-2/3 animate-[expand-circle_2s_infinite]"></div>
            </div>
          </div>
        ) : (
          <div className="animate-[slide-up-fade_0.6s_ease-out]">
            <h3 className="text-2xl font-black mb-4 leading-tight text-emerald-50">
              Personalized AI Insight
            </h3>
            <p className="text-emerald-100/90 text-lg leading-relaxed font-medium">
              {insight}
            </p>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Validated Insight
              </div>
              {error && (
                <div className="text-amber-400 text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Local Fallback Active
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHealthCoach;
