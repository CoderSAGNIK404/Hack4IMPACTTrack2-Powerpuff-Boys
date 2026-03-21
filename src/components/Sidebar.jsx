import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  ScrollText, 
  CalendarClock, 
  Settings, 
  LogOut,
  Activity,
  ShieldAlert,
  User,
  Store
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", path: "/home" },
    { icon: <BrainCircuit />, label: "Predict AI", path: "/predict" },
    { icon: <ScrollText />, label: "Med Timeline", path: "/timeline" },
    { icon: <CalendarClock />, label: "Doc Bookings", path: "/bookings" },
    { icon: <ShieldAlert />, label: "SOS Board", path: "/sos-contacts" },
    { icon: <Store />, label: "Nearby Meds", path: "/pharmacies" },
    { icon: <User />, label: "Health Profile", path: "/profile" }
  ];

  if (location.pathname === '/' || location.pathname === '/login') return null;

  return (
    <aside className="w-72 h-screen sticky top-0 bg-[#070a0d] border-r border-white/5 flex flex-col p-6 z-[60]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <Activity className="text-emerald-400 w-8 h-8 animate-pulse" strokeWidth={2.5} />
        <span className="text-2xl font-black tracking-tighter text-white">
          Suraksha<span className="text-emerald-400">AI</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`}>
                {React.cloneElement(item.icon, { size: 20 })}
              </div>
              <span className="text-sm font-black tracking-wide uppercase">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Status / Logout */}
      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Logout Node</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
