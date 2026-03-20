import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormCard from '../components/FormCard';

const HealthFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    sleep: '',
    activity: 'Medium',
    smoking: 'No'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.age || !formData.sleep) return;
    
    // Navigate to result and pass form data state
    navigate('/result', { state: formData });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center px-4 py-8">
      <FormCard 
        title="Health Risk Assessment" 
        description="Fill out a few quick details so SurakshaAI can calculate your personalized health risk profile."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              min="1"
              max="120"
              required
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50"
              placeholder="Enter your age"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sleep" className="block text-sm font-semibold text-gray-700">
              Average Sleep (Hours/Night)
            </label>
            <input
              type="number"
              id="sleep"
              name="sleep"
              min="0"
              max="24"
              step="0.5"
              required
              value={formData.sleep}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50"
              placeholder="e.g. 7"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="activity" className="block text-sm font-semibold text-gray-700">
              Activity Level
            </label>
            <div className="relative">
              <select
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50/50 appearance-none"
              >
                <option value="Low">Low (Sedentary)</option>
                <option value="Medium">Medium (Moderate Exercise)</option>
                <option value="High">High (Active/Athlete)</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="smoking" className="block text-sm font-semibold text-gray-700">
              Do you smoke?
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formData.smoking === 'No' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}>
                <input type="radio" name="smoking" value="No" checked={formData.smoking === 'No'} onChange={handleChange} className="hidden" />
                <span className="font-medium">No</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${formData.smoking === 'Yes' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}>
                <input type="radio" name="smoking" value="Yes" checked={formData.smoking === 'Yes'} onChange={handleChange} className="hidden" />
                <span className="font-medium">Yes</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            Check Risk
          </button>
        </form>
      </FormCard>
    </div>
  );
};

export default HealthFormPage;
