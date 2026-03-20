import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle, ArrowLeft, Calendar } from 'lucide-react';
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
    // If no state, redirect to form
    if (!location.state) {
      navigate('/form');
      return;
    }

    const { age, sleep, activity } = location.state;
    const ageNum = parseInt(age, 10);
    const sleepNum = parseFloat(sleep);

    let riskLevel = 'Low';
    let suggestions = [];

    if (ageNum > 50 && sleepNum < 6) {
      riskLevel = 'High';
      suggestions = [
        'Consult a healthcare provider immediately regarding your sleep schedule.',
        'Prioritize 7-8 hours of restful sleep daily to support heart and cognitive health.',
        'Consider a comprehensive health check-up.'
      ];
    } else if (activity === 'Low') {
      riskLevel = 'Medium';
      suggestions = [
        'Incorporate at least 30 minutes of light exercise (like walking) into your daily routine.',
        'Take frequent breaks if you have a desk job to avoid prolonged sitting.',
        'Consider joining a fitness class or finding an active hobby.'
      ];
    } else {
      riskLevel = 'Low';
      suggestions = [
        'Maintain your current healthy lifestyle and activity levels.',
        'Ensure you continue getting adequate sleep and balanced nutrition.',
        'Schedule regular annual check-ups to monitor your health baseline.'
      ];
    }

    setResult({ riskLevel, suggestions });
  }, [location.state, navigate]);

  const scrollToBooking = () => {
    setShowBooking(true);
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!result) return null;

  const { riskLevel, suggestions } = result;

  const config = {
    High: {
      color: 'text-red-500',
      accent: 'emerald',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      docType: 'Cardiologist'
    },
    Medium: {
      color: 'text-amber-500',
      accent: 'emerald',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Info className="w-12 h-12 text-amber-500" />,
      docType: 'General Physician'
    },
    Low: {
      color: 'text-emerald-500',
      accent: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      docType: 'Wellness'
    }
  };

  const activeConfig = config[riskLevel];

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 space-y-12 max-w-6xl mx-auto">
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Main Result Card */}
        <FormCard title="Assessment Report">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className={`p-6 rounded-full ${activeConfig.bg} ${activeConfig.border} border-2 shadow-inner`}>
              {activeConfig.icon}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium text-gray-500">Risk Severity</h3>
              <p className={`text-5xl font-black ${activeConfig.color} tracking-tight`}>
                {riskLevel}
              </p>
            </div>

            <div className="w-full mt-8 p-6 bg-gray-50/80 rounded-[2rem] border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Preventive Actions
              </h4>
              <ul className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-4 text-sm leading-relaxed text-gray-700">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <Link 
                to="/form"
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Forms
              </Link>
              <button 
                onClick={scrollToBooking}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
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
        <div ref={bookingRef} className="w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 animate-[slide-up-fade_1s_ease-out]">
          <DoctorBooking 
            recommendedType={activeConfig.docType} 
            isHighRisk={riskLevel === 'High'} 
          />
        </div>
      )}

      {/* Decorative Spacer */}
      <div className="h-12"></div>
    </div>
  );
};

// Add missing import inside the same file for robustness if needed, 
// but it's cleaner to fix the imports at top which we did.
import { ShieldCheck } from 'lucide-react';

export default ResultPage;
