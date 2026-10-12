import React from 'react';
import { Home, ChevronRight, Sun, Moon, Database } from 'lucide-react';

const pageTitles = {
  dashboard: 'Overview / Dashboard',
  upload: 'Datasets / Upload & Preprocessing',
  career: 'Analysis / Career Batting (Track A)',
  phasewise: 'Analysis / Phase-wise T20 (Track B)',
  comparison: 'Models / Algorithm Comparison',
  visualizations: 'Projections / 2D & 3D Manifolds',
  profile: 'Insights / Player Archetype Profiles'
};

export default function Header({ activeTab, datasetInfo }) {
  const currentPath = pageTitles[activeTab] || 'Overview / Dashboard';
  const parts = currentPath.split(' / ');

  return (
    <header className="h-16 px-8 border-b border-[#151f38]/70 flex items-center justify-between bg-[#070b18]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs">
        <Home className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-slate-400 font-medium">{parts[0]}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-medium">{parts[1]}</span>
      </div>

      {/* Right controls: ML Status indicator + Theme icon */}
      <div className="flex items-center space-x-4">
        {/* ML Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0d1630] border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono tracking-wider text-[11px] uppercase font-bold">ML ENGINE ONLINE</span>
        </div>

        {/* Dataset Track info */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-400 font-mono bg-[#0d1630] px-3 py-1.5 rounded-full border border-[#1e293b]">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Track A: {datasetInfo?.career_dataset ? `${datasetInfo.career_dataset.row_count} rows` : 'Ready'}</span>
        </div>

        {/* Action Icon */}
        <button 
          aria-label="Toggle theme or settings"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151f38] transition-colors"
        >
          <Sun className="w-4 h-4 text-slate-400 hover:text-amber-300 transition-colors" />
        </button>
      </div>
    </header>
  );
}
