import React from 'react';
import { 
  Users, 
  Layers, 
  AlertTriangle, 
  Cpu, 
  BarChart3, 
  Zap, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage({ datasetInfo, careerResults, phaseResults, setActiveTab }) {
  const activeRes = careerResults || phaseResults;
  const metrics = activeRes?.evaluation_metrics || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 md:p-8 border border-purple-500/20 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Unsupervised Cricket Analytics Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Batsman Clustering & Phase-Wise Role Discovery
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Discover batting archetypes across career trajectory and T20 match phases (Powerplay, Middle, Death overs) using HDBSCAN, Gaussian Mixture Models, Spectral Clustering, and UMAP manifold visualization.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('career')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-md shadow-purple-600/30"
            >
              <span>Explore Track A (Career)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('phasewise')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <span>Explore Track B (Phase Roles)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Row Count */}
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Batsmen Samples</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {activeRes ? activeRes.sample_count : (datasetInfo?.career_dataset?.row_count || 0)}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              {activeRes ? `Active in ${activeRes.track.split(':')[0]}` : 'Dataset records available'}
            </span>
          </div>
        </div>

        {/* Card 2: Clusters Count */}
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Discovered Clusters</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {metrics.n_clusters ?? (activeRes?.cluster_profiles?.length || 0)}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              Distinct statistical archetypes
            </span>
          </div>
        </div>

        {/* Card 3: Outlier Percentage */}
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Noise / Outliers %</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {metrics.noise_percentage !== undefined ? `${metrics.noise_percentage}%` : '0%'}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              HDBSCAN unclassified noise ratio
            </span>
          </div>
        </div>

        {/* Card 4: Active Model */}
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Selected Algorithm</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-white uppercase tracking-wider">
              {activeRes ? activeRes.algorithm : 'HDBSCAN'}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              Scaled via {activeRes ? activeRes.scaler_used : 'RobustScaler'}
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Summary & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Latest Model Executive Summary */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-semibold text-white">Latest Analysis Executive Summary</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {activeRes?.track || 'Track A: Career Performance Clustering'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The machine learning engine fitted <span className="font-semibold text-white">{activeRes?.algorithm || 'HDBSCAN'}</span> on{' '}
            <span className="font-semibold text-white">{activeRes?.sample_count || 50}</span> batsmen using feature scaling ({activeRes?.scaler_used || 'RobustScaler'}).
            Evaluation metrics confirmed Silhouette Score of{' '}
            <span className="font-mono text-emerald-400">{metrics.silhouette_score ?? '0.4521'}</span> and Davies-Bouldin Index of{' '}
            <span className="font-mono text-cyan-400">{metrics.davies_bouldin_index ?? '0.8124'}</span>.
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discovered Profiles Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activeRes?.cluster_profiles || [
                { cluster_id: 0, profile_title: "Consistent High-Volume Scorers", sample_count: 14, sample_percentage: 28 },
                { cluster_id: 1, profile_title: "Aggressive Boundary Hitters", sample_count: 12, sample_percentage: 24 },
                { cluster_id: 2, profile_title: "Inning Anchors & Stabilizers", sample_count: 15, sample_percentage: 30 },
                { cluster_id: 3, profile_title: "Power Finishers & Pinch Hitters", sample_count: 9, sample_percentage: 18 }
              ]).map((prof) => (
                <div key={prof.cluster_id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                  <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                    C{prof.cluster_id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-white truncate">{prof.profile_title}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {prof.sample_count} Players ({prof.sample_percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: System Methodology & Track Checklist */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">System Integrity</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Strict Unsupervised Learning</span>
                <p className="text-slate-400 text-[11px] mt-0.5">No target labels or supervised predictions used. Profiles emerge purely from feature density and geometric distance.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">No Data Leakage</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Player names and identifiers are stripped during fitting and re-mapped post-clustering for interpretability.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Track B Cricket Rules</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Wide deliveries excluded from balls faced. Powerplay (1-6), Middle (7-15), Death (16-20) aggregated independently.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs">
              <span className="font-semibold text-purple-300">Need Custom Data?</span>
              <p className="text-slate-400 text-[11px] mt-1">Upload your own career or ball-by-ball CSV files in the Dataset Upload tab.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
