import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import FormCard from '../components/FormCard';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

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

  if (!result) return null;

  const { riskLevel, suggestions } = result;

  const config = {
    High: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertTriangle className="w-12 h-12 text-red-600" />
    },
    Medium: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Info className="w-12 h-12 text-amber-600" />
    },
    Low: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="w-12 h-12 text-green-600" />
    }
  };

  const activeConfig = config[riskLevel];

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center px-4 py-8">
      <FormCard title="Your Assessment Result">
        <div className="flex flex-col items-center justify-center space-y-6">
          
          <div className={`p-6 rounded-full ${activeConfig.bg} ${activeConfig.border} border-2`}>
            {activeConfig.icon}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-gray-600">Calculated Risk Level:</h3>
            <p className={`text-4xl font-extrabold ${activeConfig.color}`}>
              {riskLevel} Risk
            </p>
          </div>

          <div className="w-full mt-8">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Preventive Suggestions</h4>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${activeConfig.bg.replace('50', '500')}`}></div>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link 
            to="/form"
            className="w-full mt-6 bg-white border-2 border-primary text-primary hover:bg-blue-50 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Check Again
          </Link>
        </div>
      </FormCard>
    </div>
  );
};

export default ResultPage;
