import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Trophy, 
  Zap, 
  GitCompare, 
  PieChart, 
  UserSearch, 
  Activity
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Dataset Upload', icon: Upload },
  { id: 'career', label: 'Career Analysis', icon: Trophy },
  { id: 'phasewise', label: 'Phase-Wise Analysis', icon: Zap },
  { id: 'comparison', label: 'Algorithm Compare', icon: GitCompare },
  { id: 'visualizations', label: 'Visualizations', icon: PieChart },
  { id: 'profile', label: 'Player Profile', icon: UserSearch }
];

export default function Navbar({ activeTab, setActiveTab, datasetInfo }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">CricCluster<span className="text-purple-400">.AI</span></span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">Unsupervised ML Batting Analytics</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Dataset Status Badges */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${datasetInfo?.career_dataset ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-slate-300 font-mono">Track A: {datasetInfo?.career_dataset ? 'Loaded' : 'Pending'}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${datasetInfo?.track_b_available ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              <span className="text-slate-300 font-mono">Track B: {datasetInfo?.track_b_available ? 'Loaded' : 'No Data'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center whitespace-nowrap space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive ? 'bg-purple-600 text-white' : 'text-slate-400 bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
