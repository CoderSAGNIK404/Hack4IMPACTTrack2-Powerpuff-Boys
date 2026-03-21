import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, Mail, Lock, User } from 'lucide-react';

const LoginPage = () => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsExpanding(true);
    
    // Sync with MongoDB Global Node
    try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        await fetch(`${apiUrl}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name || 'Explorer', email: email })
        });
    } catch (err) {
        console.error("Clinical Node Sync Error:", err);
    }

    localStorage.setItem('suraksha_user_name', name || 'Explorer');
    localStorage.setItem('suraksha_user_email', email);

    // Transition to Clinical Hub
    setTimeout(() => {
      navigate('/home');
    }, 1400); 
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#070a0d]">
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)] animate-[fade-in-modal_1s_ease-out]"></div>
      
      <div className={`relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-1000 animate-[fade-in-modal_0.8s_ease-out] ${isExpanding ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 shadow-inner">
            <Activity className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-white transition-all">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 mt-2 text-center text-sm">
            {isSignUp ? 'Join SurakshaAI for proactive health monitoring' : 'Secure access to your health portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="animate-[fade-in-modal_0.4s_ease-out]">
              <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-600 text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-600 text-white"
                  placeholder="you@example.com"
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-600 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs mt-2 px-1">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
            {!isSignUp && (
               <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors">Forgot Password?</a>
            )}
          </div>

          <div className="pt-4 flex justify-center relative">
            <button 
              type="submit"
              className="group relative flex items-center justify-center w-16 h-16 bg-emerald-500 text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-110 active:scale-95 transition-all outline-none"
              title={isSignUp ? "Sign Up" : "Sign In"}
            >
              <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>

      {/* Expanding Transition Layer */}
      {isExpanding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-[fade-in-modal_0.3s_ease-out]">
          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-[expand-circle_1.5s_ease-in-out_forwards] flex items-center justify-center shadow-2xl"></div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
