import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  RefreshCw, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function AlgorithmComparisonPage() {
  const [track, setTrack] = useState('career');
  const [scalerType, setScalerType] = useState('robust');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, scaler_type: scalerType })
      });
      const data = await res.json();
      if (res.ok) {
        setComparisonData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [track, scalerType]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Unsupervised Algorithm Benchmark & Comparison</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare HDBSCAN (Density), Gaussian Mixture Model (Probabilistic GMM), and Spectral Clustering (Graph Similarity) evaluated on identical feature samples.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="career">Track A: Career Dataset</option>
            <option value="phasewise">Track B: Phase-Wise Dataset</option>
          </select>

          <select
            value={scalerType}
            onChange={(e) => setScalerType(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="robust">RobustScaler</option>
            <option value="standard">StandardScaler</option>
          </select>

          <button
            onClick={fetchComparison}
            disabled={loading}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Benchmark Matrix */}
      <div className="glass-card rounded-xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <GitCompare className="w-4 h-4 text-purple-400" />
          <span>Evaluation Metrics Side-by-Side Matrix</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Evaluating HDBSCAN, GMM, and Spectral Clustering...</span>
          </div>
        ) : comparisonData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4 text-purple-400 font-bold">HDBSCAN</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">Gaussian Mixture Model (GMM)</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold">Spectral Clustering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">Silhouette Score (↑ higher better)</td>
                  <td className="py-3.5 px-4 font-bold text-purple-300">
                    {comparisonData.HDBSCAN?.metrics?.silhouette_score ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    {comparisonData.GMM?.metrics?.silhouette_score ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    {comparisonData.SpectralClustering?.metrics?.silhouette_score ?? 'N/A'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">Davies–Bouldin Index (↓ lower better)</td>
                  <td className="py-3.5 px-4 font-bold text-purple-300">
                    {comparisonData.HDBSCAN?.metrics?.davies_bouldin_index ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    {comparisonData.GMM?.metrics?.davies_bouldin_index ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    {comparisonData.SpectralClustering?.metrics?.davies_bouldin_index ?? 'N/A'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">Calinski–Harabasz Index (↑ higher better)</td>
                  <td className="py-3.5 px-4 font-bold text-purple-300">
                    {comparisonData.HDBSCAN?.metrics?.calinski_harabasz_score ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    {comparisonData.GMM?.metrics?.calinski_harabasz_score ?? 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    {comparisonData.SpectralClustering?.metrics?.calinski_harabasz_score ?? 'N/A'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">Clusters Discovered (k)</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {comparisonData.HDBSCAN?.metadata?.n_clusters ?? '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {comparisonData.GMM?.metadata?.n_clusters ?? '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {comparisonData.SpectralClustering?.metadata?.n_clusters ?? '-'}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">Outlier / Noise Percentage</td>
                  <td className="py-3.5 px-4 text-amber-400 font-bold">
                    {comparisonData.HDBSCAN?.metrics?.noise_percentage}% ({comparisonData.HDBSCAN?.metadata?.noise_count} points)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">0% (Forces assignment)</td>
                  <td className="py-3.5 px-4 text-slate-400">0% (Forces assignment)</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Algorithm Intuition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border border-purple-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-sm font-semibold text-white">HDBSCAN Intuition</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Extracts dense regions connected by mutual reachability distance. Automatically detects unclassifiable statistical anomalies as noise (-1). Ideal for cricket data with rare outliers.
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-cyan-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-sm font-semibold text-white">Gaussian Mixture Model</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Models the feature distribution as a mixture of Gaussian components. Allows soft probabilistic membership (e.g. 70% Anchor, 30% Finisher) rather than strict hard boundaries.
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-sm font-semibold text-white">Spectral Clustering</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Constructs a similarity graph between players using RBF kernel, then performs Laplacian eigen-decomposition before clustering in lower dimensions. Captures non-spherical clusters.
          </p>
        </div>
      </div>
    </div>
  );
}
