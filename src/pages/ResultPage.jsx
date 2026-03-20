import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle, ArrowLeft, Calendar, ShieldCheck, Activity } from 'lucide-react';
import FormCard from '../components/FormCard';
import AIHealthCoach from '../components/AIHealthCoach';
import DoctorBooking from '../components/DoctorBooking';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const bookingRef = useRef(null);

  useEffect(() => {
    if (!location.state) {
      navigate('/form');
      return;
    }

    const { age, height, weight, sleep, activity, smoking, conditions, alcohol, stress } = location.state;
    
    // 1. Calculate BMI
    const hMeters = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (hMeters * hMeters);
    
    // 2. Sophisticated Risk Logic
    let riskScore = 0;
    const ageNum = parseInt(age);
    const sleepNum = parseFloat(sleep);

    // Age factor
    if (ageNum > 60) riskScore += 30;
    else if (ageNum > 45) riskScore += 15;

    // BMI factor
    if (bmi > 30) riskScore += 25;
    else if (bmi > 25) riskScore += 10;

    // Lifestyle factors
    if (smoking === 'Yes') riskScore += 25;
    if (alcohol === 'Regular') riskScore += 15;
    if (stress === 'High') riskScore += 15;
    if (sleepNum < 6) riskScore += 20;
    if (activity === 'Low') riskScore += 20;

    // Medical History factor
    const subConditions = conditions.filter(c => c !== 'None');
    riskScore += subConditions.length * 20;

    // Final Level Calculation
    let riskLevel = 'Low';
    let suggestions = [];

    if (riskScore >= 70 || subConditions.includes('Heart Disease')) {
      riskLevel = 'High';
      suggestions = [
        'Immediate physical examination recommended.',
        'Strict sodium and saturated fat restriction required.',
        'Establish a regular monitoring schedule for blood pressure and glucose.'
      ];
    } else if (riskScore >= 40) {
      riskLevel = 'Medium';
      suggestions = [
        'Moderate cardiovascular exercise for 150 minutes per week.',
        'Optimize sleep hygiene and introduce stress management (Yoga/Meditation).',
        'Balanced diet with increased fiber and hydration.'
      ];
    } else {
      riskLevel = 'Low';
      suggestions = [
        'Continue your healthy lifestyle and balanced nutrition.',
        'Annual baseline check-ups are sufficient.',
        'Focus on preventive wellness and mental health.'
      ];
    }

    // Add BMI-specific suggestion
    if (bmi > 25) suggestions.push(`Your BMI of ${bmi.toFixed(1)} indicates weight management may be beneficial.`);

    setResult({ riskLevel, suggestions, bmi: bmi.toFixed(1) });
  }, [location.state, navigate]);

  const scrollToBooking = () => {
    setShowBooking(true);
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!result) return null;

  const { riskLevel, suggestions, bmi } = result;

  const config = {
    High: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      docType: 'Cardiologist'
    },
    Medium: {
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Info className="w-12 h-12 text-amber-500" />,
      docType: 'General Physician'
    },
    Low: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      docType: 'Wellness'
    }
  };

  const activeConfig = config[riskLevel];

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 space-y-12 max-w-6xl mx-auto bg-white">
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Main Result Card */}
        <FormCard title="Diagnostic Report">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className={`p-8 rounded-full ${activeConfig.bg} ${activeConfig.border} border-2 shadow-inner animate-[spin-fade_1s_ease-out]`}>
              {activeConfig.icon}
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Biological Risk Score</h3>
              <p className={`text-6xl font-black ${activeConfig.color} tracking-tighter`}>
                {riskLevel}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                <Activity className="w-3 h-3" />
                BMI: <span className="text-gray-900">{bmi}</span>
              </div>
            </div>

            <div className="w-full mt-8 p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100/50">
              <h4 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                AI Recommendations
              </h4>
              <ul className="space-y-5">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-4 text-sm leading-relaxed text-gray-600 font-medium pb-4 border-b border-gray-200/40 last:border-0 last:pb-0">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
              <Link 
                to="/form"
                className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-5 rounded-2xl transition-all border border-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                Re-assess
              </Link>
              <button 
                onClick={scrollToBooking}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </button>
            </div>
          </div>
        </FormCard>

        {/* AI Insight Section */}
        <AIHealthCoach riskLevel={riskLevel} userData={location.state} />

      </div>

      {/* Doctor Booking Section */}
      {showBooking && (
        <div ref={bookingRef} className="w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.08)] border border-gray-100/50 animate-[slide-up-fade_1s_ease-out]">
          <DoctorBooking 
            recommendedType={activeConfig.docType} 
            isHighRisk={riskLevel === 'High'} 
          />
        </div>
      )}

      <div className="h-12"></div>
    </div>
  );
};

export default ResultPage;
