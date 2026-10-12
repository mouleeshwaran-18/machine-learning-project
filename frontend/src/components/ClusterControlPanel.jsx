import React from 'react';
import { Sliders, Play, RefreshCw } from 'lucide-react';

export default function ClusterControlPanel({
  algorithm,
  setAlgorithm,
  scalerType,
  setScalerType,
  params,
  setParams,
  onRunAnalysis,
  loading
}) {
  return (
    <div className="glass-card rounded-xl p-5 mb-6 border border-purple-500/20 shadow-lg shadow-purple-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Machine Learning Model Controls</h3>
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Fitting Cluster Model...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-white fill-current" />
              <span>Execute Model Analysis</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Unsupervised Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="hdbscan">HDBSCAN (Density-Based & Outlier Detection)</option>
            <option value="gmm">Gaussian Mixture Model (GMM)</option>
            <option value="spectral">Spectral Clustering (Graph Similarity)</option>
          </select>
        </div>

        {/* Scaler Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Feature Scaling Method</label>
          <select
            value={scalerType}
            onChange={(e) => setScalerType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="robust">RobustScaler (Median & IQR - Outlier Resistant)</option>
            <option value="standard">StandardScaler (Z-Score Normalization)</option>
          </select>
        </div>

        {/* Dynamic Hyperparameters */}
        {algorithm === 'hdbscan' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Min Cluster Size</label>
              <input
                type="number"
                min="2"
                max="20"
                value={params.min_cluster_size || 4}
                onChange={(e) => setParams({ ...params, min_cluster_size: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Min Samples</label>
              <input
                type="number"
                min="1"
                max="10"
                value={params.min_samples || 2}
                onChange={(e) => setParams({ ...params, min_samples: parseInt(e.target.value) || 2 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </>
        )}

        {algorithm === 'gmm' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Components (k)</label>
              <input
                type="number"
                min="2"
                max="10"
                value={params.n_components || 4}
                onChange={(e) => setParams({ ...params, n_components: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Covariance Type</label>
              <select
                value={params.covariance_type || 'full'}
                onChange={(e) => setParams({ ...params, covariance_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="full">Full (Unconstrained)</option>
                <option value="tied">Tied (Equal Variance)</option>
                <option value="diag">Diagonal (Axis Aligned)</option>
                <option value="spherical">Spherical</option>
              </select>
            </div>
          </>
        )}

        {algorithm === 'spectral' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Clusters (k)</label>
              <input
                type="number"
                min="2"
                max="10"
                value={params.n_clusters || 4}
                onChange={(e) => setParams({ ...params, n_clusters: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Affinity Graph Metric</label>
              <select
                value={params.affinity || 'rbf'}
                onChange={(e) => setParams({ ...params, affinity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="rbf">RBF Kernel (Gaussian similarity)</option>
                <option value="nearest_neighbors">Nearest Neighbors Graph</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
