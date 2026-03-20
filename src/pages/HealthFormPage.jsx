import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Heart, ShieldAlert, Scale, Ruler, Coffee, Zap } from 'lucide-react';
import FormCard from '../components/FormCard';

const HealthFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    sleep: '',
    activity: 'Medium',
    smoking: 'No',
    alcohol: 'None',
    stress: 'Moderate',
    conditions: []
  });

  const conditionsList = ['Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol', 'None'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCondition = (condition) => {
    setFormData(prev => {
      if (condition === 'None') return { ...prev, conditions: ['None'] };
      const newConditions = prev.conditions.filter(c => c !== 'None');
      if (newConditions.includes(condition)) {
        return { ...prev, conditions: newConditions.filter(c => c !== condition) };
      }
      return { ...prev, conditions: [...newConditions, condition] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.age || !formData.height || !formData.weight) return;
    navigate('/result', { state: formData });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-white">
      <FormCard 
        title="Comprehensive Health Assessment" 
        description="Provide detailed metrics for a clinical-grade AI risk analysis."
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Personal Biometrics */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Biometrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1">Age</label>
                <input type="number" name="age" required value={formData.age} onChange={handleChange} placeholder="e.g. 25" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Ruler className="w-3 h-3"/> Height (cm)</label>
                <input type="number" name="height" required value={formData.height} onChange={handleChange} placeholder="e.g. 175" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Scale className="w-3 h-3"/> Weight (kg)</label>
                <input type="number" name="weight" required value={formData.weight} onChange={handleChange} placeholder="e.g. 70" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Lifestyle Markers */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Lifestyle Habits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide">Daily Sleep (Hrs)</label>
                <input type="number" name="sleep" required value={formData.sleep} onChange={handleChange} placeholder="e.g. 7" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1">Activity Level</label>
                <select name="activity" value={formData.activity} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-emerald-500 appearance-none">
                  <option value="Low">Low (Sedentary)</option>
                  <option value="Medium">Medium (Moderate)</option>
                  <option value="High">High (Very Active)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Stress Level</label>
                <select name="stress" value={formData.stress} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-emerald-500 appearance-none">
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Coffee className="w-3 h-3"/> Alcohol</label>
                <select name="alcohol" value={formData.alcohol} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-emerald-500 appearance-none">
                  <option>None</option>
                  <option>Occasional</option>
                  <option>Regular</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 ml-1">Do you smoke?</label>
              <div className="flex gap-4">
                {['No', 'Yes'].map(opt => (
                  <button key={opt} type="button" onClick={() => setFormData(p => ({...p, smoking: opt}))} className={`flex-1 py-3 rounded-xl font-bold transition-all border ${formData.smoking === opt ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Medical History */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Medical History
            </h3>
            <div className="flex flex-wrap gap-3">
              {conditionsList.map(cond => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    formData.conditions.includes(cond)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 text-lg group"
          >
            Run AI Diagnostic
            <Activity className="w-5 h-5 group-hover:animate-pulse" />
          </button>
        </form>
      </FormCard>
    </div>
  );
};

export default HealthFormPage;
