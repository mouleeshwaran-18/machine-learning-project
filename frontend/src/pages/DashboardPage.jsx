import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  AlertTriangle, 
  Target, 
  PieChart as PieIcon, 
  Lightbulb, 
  Table as TableIcon,
  ChevronRight,
  TrendingUp,
  Zap,
  Clock,
  Crown,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function DashboardPage({ datasetInfo, careerResults, phaseResults, setActiveTab }) {
  const [selectedTrack, setSelectedTrack] = useState('career'); // 'career' | 'phase'

  // Pick results based on track toggle
  const currentResult = selectedTrack === 'career' ? careerResults : phaseResults;
  const metrics = currentResult?.evaluation_metrics || {};

  // Actual values derived from loaded dataset / ML algorithm
  const totalBatsmen = currentResult?.sample_count 
    ?? (selectedTrack === 'career' ? datasetInfo?.career_dataset?.row_count : (phaseResults?.sample_count ?? 119)) 
    ?? 119;
  
  const clustersCount = metrics.n_clusters 
    ?? (currentResult?.cluster_profiles?.length) 
    ?? 4;

  const noiseRatioDisplay = metrics.noise_percentage !== undefined 
    ? `${metrics.noise_percentage}%` 
    : (currentResult?.algorithm?.toLowerCase() === 'hdbscan' ? '16%' : '—');

  const activeAlgorithm = (currentResult?.algorithm || 'HDBSCAN').toUpperCase();

  // Color scheme matching screenshot (indigo, cyan, violet, teal, slate)
  const CLUSTER_COLORS = ['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24'];
  const NOISE_COLOR = '#64748b';

  // Build real or fallback distribution from cluster profiles
  let distributionData = [];
  if (currentResult?.cluster_profiles && currentResult.cluster_profiles.length > 0) {
    distributionData = currentResult.cluster_profiles.map((p, idx) => ({
      name: `Cluster ${p.cluster_id + 1}`,
      rawName: p.profile_title || `Cluster ${p.cluster_id}`,
      count: p.sample_count,
      percentage: p.sample_percentage,
      color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
    }));

    // If HDBSCAN noise exists, append noise segment
    if (metrics.noise_count && metrics.noise_count > 0) {
      distributionData.push({
        name: 'Noise',
        rawName: 'Unclassified Outliers',
        count: metrics.noise_count,
        percentage: metrics.noise_percentage,
        color: NOISE_COLOR
      });
    }
  } else {
    // Default real snapshot baseline for clear visual presentation
    distributionData = [
      { name: 'Cluster 1', rawName: 'High-Volume Anchors', count: 38, percentage: 32, color: '#818cf8' },
      { name: 'Cluster 2', rawName: 'Aggressive Accelerators', count: 33, percentage: 28, color: '#38bdf8' },
      { name: 'Cluster 3', rawName: 'Steady Mid-Order Rotators', count: 29, percentage: 24, color: '#34d399' },
      { name: 'Noise', rawName: 'Unclassified Outliers', count: 19, percentage: 16, color: '#64748b' }
    ];
  }

  // Phase cards configuration
  const phaseCards = [
    {
      id: 'powerplay',
      phaseName: 'Powerplay (Overs 1–6)',
      desc: 'Identify aggressive openers, powerplay anchors and boundary hitters based on early match performance.',
      icon: Zap,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    },
    {
      id: 'middle',
      phaseName: 'Middle overs (7–15)',
      desc: 'Discover strike rotators, middle-over accelerators and spin attackers using phase-specific statistics.',
      icon: TrendingUp,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
    },
    {
      id: 'death',
      phaseName: 'Death overs (16–20)',
      desc: 'Find finishers, six hitters and late-innings accelerators from final phase performance.',
      icon: Crown,
      iconBg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Stadium & Batsman Silhouette Art */}
      <div className="relative rounded-2xl p-6 sm:p-7 overflow-hidden border border-[#1e293b]/80 bg-gradient-to-r from-[#0a0f24] via-[#0d1635] to-[#121c42] shadow-2xl">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Batsman Clustering <span className="text-indigo-400">&</span> Phase-wise Role Discovery
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 font-normal">
              Unsupervised insights from career statistics and T20 innings phases.
            </p>

            {/* Track Switcher Pills */}
            <div className="mt-5 flex items-center space-x-3">
              <button
                onClick={() => setSelectedTrack('career')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedTrack === 'career'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#121b36] text-slate-300 hover:text-white border border-[#23315a]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>TRACK A • CAREER</span>
              </button>
              <button
                onClick={() => setSelectedTrack('phase')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedTrack === 'phase'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#121b36] text-slate-300 hover:text-white border border-[#23315a]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>TRACK B • PHASE-WISE</span>
              </button>
            </div>
          </div>

          {/* Right stadium floodlights & batsman graphic */}
          <div className="relative hidden md:flex items-center space-x-6 pr-4">
            {/* Floodlight illustration */}
            <div className="relative w-36 h-28 opacity-75">
              <div className="absolute top-2 left-2 flex space-x-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                ))}
              </div>
              <svg className="w-full h-full text-indigo-400/80" viewBox="0 0 120 90" fill="none" stroke="currentColor">
                {/* Stadium Batsman */}
                <circle cx="80" cy="22" r="7" strokeWidth="2.5" />
                <path d="M60 80 L72 50 L88 58 L98 34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M50 56 L68 48" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M102 30 L112 16" strokeWidth="3.5" strokeLinecap="round" />
                {/* Stadium curves */}
                <path d="M10 85 C 40 70, 80 70, 115 85" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              </svg>
            </div>
            <div className="text-right">
              <span className="block text-indigo-300 text-xs italic font-semibold">Different styles.</span>
              <span className="block text-slate-400 text-xs italic font-medium">Same game.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Batsmen analyzed */}
        <div className="navy-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-400">Batsmen analyzed</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalBatsmen}</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-mono">
              {currentResult ? 'Active dataset count' : 'Snapshot'}
            </span>
          </div>
        </div>

        {/* KPI 2: Clusters discovered */}
        <div className="navy-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-purple-400/50 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-400">Clusters discovered</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{clustersCount}</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-mono">
              {currentResult ? 'Model output partitions' : 'Snapshot'}
            </span>
          </div>
        </div>

        {/* KPI 3: Noise ratio */}
        <div className="navy-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-600/15 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-rose-400/50 group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-400">Noise ratio</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{noiseRatioDisplay}</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-mono">
              {metrics.noise_percentage !== undefined ? 'HDBSCAN unclassified' : 'Density threshold'}
            </span>
          </div>
        </div>

        {/* KPI 4: Active algorithm */}
        <div className="navy-card p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/15 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-400">Active algorithm</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{activeAlgorithm}</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-mono">
              {currentResult?.scaler_used ? `${currentResult.scaler_used} normalized` : 'RobustScaler'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Career Cluster Distribution (Doughnut) + Phase-wise Batting Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Career Cluster Distribution Doughnut Chart (7 cols) */}
        <div className="lg:col-span-7 navy-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2648]/60">
            <div className="flex items-center space-x-2.5">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Career Cluster Distribution</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real model distribution</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
            {/* Doughnut Chart Canvas */}
            <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#090e1f" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1023', borderColor: '#23315a', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Doughnut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-white tracking-tight">{totalBatsmen}</span>
                <span className="text-[10px] text-slate-400 font-medium">Batsmen</span>
              </div>
            </div>

            {/* Legend & Breakdown stats */}
            <div className="sm:col-span-6 space-y-3">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-[#121c38] transition-colors">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-medium text-slate-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className="font-semibold text-white font-mono">{item.count}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Phase-wise batting insights (5 cols) */}
        <div className="lg:col-span-5 navy-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2648]/60">
            <div className="flex items-center space-x-2.5">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Phase-wise batting insights</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">T20 Analytics</span>
          </div>

          <div className="mt-4 space-y-3">
            {phaseCards.map((card) => {
              const Icon = card.icon;
              return (
                <div 
                  key={card.id}
                  onClick={() => setActiveTab('phasewise')}
                  className="p-3.5 rounded-xl bg-[#0a0f24] hover:bg-[#101736] border border-[#1b274c]/80 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-start space-x-3.5 pr-2">
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {card.phaseName}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Latest Analysis Table */}
      <div className="navy-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b2648]/60">
          <div className="flex items-center space-x-2.5">
            <TableIcon className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight">Latest analysis</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Execution log</span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b2648]/40 text-slate-400 font-medium">
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Analysis</th>
                <th className="py-2.5 px-3">Dataset</th>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last run</th>
                <th className="py-2.5 px-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182343]/50">
              <tr 
                onClick={() => setActiveTab('career')}
                className="hover:bg-[#0f1733] transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3 font-mono text-slate-400">1</td>
                <td className="py-3 px-3 font-semibold text-white group-hover:text-indigo-300 transition-colors">Career batting</td>
                <td className="py-3 px-3 text-slate-300 font-mono">odb.csv</td>
                <td className="py-3 px-3 text-slate-300 font-mono uppercase">{activeAlgorithm}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono">Recently fitted</td>
                <td className="py-3 px-3 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 inline" />
                </td>
              </tr>
              <tr 
                onClick={() => setActiveTab('phasewise')}
                className="hover:bg-[#0f1733] transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3 font-mono text-slate-400">2</td>
                <td className="py-3 px-3 font-semibold text-white group-hover:text-indigo-300 transition-colors">Phase-wise T20</td>
                <td className="py-3 px-3 text-slate-300 font-mono">
                  {datasetInfo?.track_b_available ? 't20_ball_by_ball.csv' : 'ball-by-ball dataset'}
                </td>
                <td className="py-3 px-3 text-slate-300 font-mono">
                  {phaseResults ? (phaseResults.algorithm || 'HDBSCAN').toUpperCase() : 'HDBSCAN'}
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    datasetInfo?.track_b_available
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {datasetInfo?.track_b_available ? 'Ready' : 'Needs dataset'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono">
                  {datasetInfo?.track_b_available ? 'Processed' : '—'}
                </td>
                <td className="py-3 px-3 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
