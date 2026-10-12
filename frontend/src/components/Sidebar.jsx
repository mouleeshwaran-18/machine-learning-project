import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Trophy, 
  Zap, 
  GitCompare, 
  PieChart, 
  UserSearch, 
  Activity,
  Layers
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'upload', label: 'Dataset Upload', icon: Upload },
  { id: 'career', label: 'Career Analysis', icon: Trophy },
  { id: 'phasewise', label: 'Phase-wise Analysis', icon: Zap },
  { id: 'comparison', label: 'Algorithm Comparison', icon: GitCompare },
  { id: 'visualizations', label: 'Visualizations', icon: PieChart },
  { id: 'profile', label: 'Player Profiles', icon: UserSearch }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-[#080d1d] border-r border-[#1e293b]/70 flex flex-col justify-between shrink-0 select-none min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center space-x-3 border-b border-[#151f38]/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b1023] rounded-[10px] flex items-center justify-center">
              {/* Cricket Batsman stylized vector icon */}
              <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="15.5" cy="4.5" r="2.5" />
                <path d="M7 21l3-7 5 3 4-8" />
                <path d="M4 14l5-2" />
                <path d="M19 8l2.5 3.5" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-white tracking-tight">CricCluster<span className="text-indigo-400">.AI</span></span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Cricket Analytics • ML Insights</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'sidebar-item-active shadow-md shadow-indigo-900/30 font-semibold'
                    : 'sidebar-item-inactive'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Artwork & Tagline */}
      <div className="p-5 relative overflow-hidden border-t border-[#151f38]/50">
        <div className="flex items-end justify-between">
          {/* Batsman silhouette illustration */}
          <div className="opacity-70 text-indigo-400/80">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="36" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M22 56L30 36L42 42L48 24" strokeLinecap="round" />
              <path d="M14 40L28 34" strokeLinecap="round" />
              <path d="M52 20L58 10" strokeLinecap="round" strokeWidth="3" />
              <path d="M18 58C28 50 44 48 56 46" strokeDasharray="3 3" opacity="0.4" />
            </svg>
          </div>
          <div className="text-right text-[11px] font-medium leading-tight text-slate-400">
            <span className="block text-indigo-300 italic font-semibold">Better Data</span>
            <span className="block text-slate-400 italic">Bigger Insights</span>
            <span className="block text-slate-300 italic font-medium">Smarter Cricket</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
