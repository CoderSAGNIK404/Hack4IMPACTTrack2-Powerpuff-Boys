import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import SOSButton from './SOSButton';

const Navbar = () => {
  return (
    <nav className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-40 animate-[slide-up-fade_1s_ease-out_forwards] opacity-0">
      <Link to="/home" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity whitespace-nowrap">
        <Activity className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight">SurakshaAI</span>
      </Link>
      
      {/* SOS Button Centered */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <SOSButton />
      </div>
    </nav>
  );
};

export default Navbar;
