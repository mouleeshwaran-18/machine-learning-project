import React, { useState } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { PieChart, Sparkles, Activity, Layers, BarChart2 } from 'lucide-react';

const CLUSTER_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#3b82f6'];

export default function VisualizationsPage({ careerResults, phaseResults }) {
  const [activeDatasetTrack, setActiveDatasetTrack] = useState('career');
  
  const activeRes = activeDatasetTrack === 'career' ? careerResults : phaseResults;
  const players = activeRes?.players_data || [];
  const profiles = activeRes?.cluster_profiles || [];
  const corr = activeRes?.correlation_matrix || { features: [], matrix: [] };

  // Prepare UMAP scatter data formatted per cluster
  const clusterGroups = {};
  players.forEach((p) => {
    const cId = p.Cluster;
    if (!clusterGroups[cId]) {
      clusterGroups[cId] = [];
    }
    clusterGroups[cId].push({
      x: p.UMAP_X,
      y: p.UMAP_Y,
      name: p.Player,
      clusterTitle: p.Cluster_Title,
      runs: p.Runs || p.Total_Balls_Faced,
      ave: p.Ave || p.PP_SR,
      sr: p.SR || p.DEATH_SR
    });
  });

  const clusterSizeData = profiles.map((prof, i) => ({
    name: prof.cluster_id === -1 ? 'Noise' : `Cluster ${prof.cluster_id}`,
    title: prof.profile_title,
    count: prof.sample_count,
    color: prof.cluster_id === -1 ? '#f59e0b' : CLUSTER_COLORS[i % CLUSTER_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Machine Learning Visualizations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore 2D UMAP cluster manifold projections, correlation matrix heatmaps, and cluster distribution metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveDatasetTrack('career')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeDatasetTrack === 'career'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            Track A (Career)
          </button>
          <button
            onClick={() => setActiveDatasetTrack('phasewise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeDatasetTrack === 'phasewise'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            Track B (Phase-Wise)
          </button>
        </div>
      </div>

      {/* UMAP 2D Scatter Plot & Cluster Sizes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UMAP 2D Projection (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-semibold text-white">UMAP 2D Dimensionality Reduction Scatter Plot</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              Reducer: {activeRes?.umap_reducer || 'UMAP'}
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            {players.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No model data loaded. Execute analysis on Career or Phase tabs.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" name="UMAP Dim 1" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="y" name="UMAP Dim 2" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <ZAxis type="number" range={[100, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
                            <span className="block font-sans font-bold text-white text-sm">{data.name}</span>
                            <span className="block text-purple-300 font-semibold">{data.clusterTitle}</span>
                            <div className="text-[11px] text-slate-300 pt-1">
                              <div>UMAP Coords: ({data.x}, {data.y})</div>
                              <div>Metric Value: {data.runs}</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {Object.keys(clusterGroups).map((cId, idx) => (
                    <Scatter
                      key={cId}
                      name={`Cluster ${cId}`}
                      data={clusterGroups[cId]}
                      fill={cId === '-1' ? '#f59e0b' : CLUSTER_COLORS[idx % CLUSTER_COLORS.length]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cluster Size Bar Chart */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Cluster Sample Counts</h2>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterSizeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                          <span className="block font-bold text-white">{data.title}</span>
                          <span className="text-cyan-300">{data.count} Batsmen</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {clusterSizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Correlation Matrix Heatmap */}
      {corr.features.length > 0 && (
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Feature Pearson Correlation Matrix</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-400">Feature</th>
                  {corr.features.map((f, i) => (
                    <th key={i} className="p-2 text-slate-300 font-semibold">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corr.matrix.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800/60">
                    <td className="p-2 text-left font-bold text-slate-200 font-sans">{corr.features[i]}</td>
                    {row.map((val, j) => {
                      const numVal = parseFloat(val);
                      const absVal = Math.abs(numVal);
                      const isPositive = numVal >= 0;
                      const bgAlpha = Math.min(absVal, 0.9);
                      const bgStyle = isPositive
                        ? `rgba(139, 92, 246, ${bgAlpha * 0.6})`
                        : `rgba(239, 68, 68, ${bgAlpha * 0.6})`;

                      return (
                        <td
                          key={j}
                          style={{ backgroundColor: bgStyle }}
                          className="p-2 border border-slate-800/40 text-[11px] font-bold text-white rounded-sm"
                        >
                          {numVal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
