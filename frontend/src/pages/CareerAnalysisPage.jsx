import React, { useState } from 'react';
import ClusterControlPanel from '../components/ClusterControlPanel';
import { 
  Search, 
  Download, 
  Filter, 
  Layers, 
  Sparkles,
  ChevronRight,
  BarChart2
} from 'lucide-react';

export default function CareerAnalysisPage({ 
  careerResults, 
  onRunCareerAnalysis, 
  loading,
  setActiveTab,
  setSelectedPlayer
}) {
  const [algorithm, setAlgorithm] = useState('hdbscan');
  const [scalerType, setScalerType] = useState('robust');
  const [params, setParams] = useState({ min_cluster_size: 4, min_samples: 2 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('all');

  const handleExecute = () => {
    onRunCareerAnalysis(algorithm, scalerType, params);
  };

  const players = careerResults?.players_data || [];
  const profiles = careerResults?.cluster_profiles || [];

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = strMatches(p.Player, searchQuery);
    const matchesCluster = selectedClusterFilter === 'all' || p.Cluster.toString() === selectedClusterFilter;
    return matchesSearch && matchesCluster;
  });

  function strMatches(val, query) {
    if (!val || !query) return true;
    return val.toString().toLowerCase().includes(query.toLowerCase());
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Track A: Career Performance Clustering</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze career statistics (Runs, Average, Strike Rate, 100s, 50s, Boundaries) to group batsmen into distinct performance profiles.
          </p>
        </div>
        {careerResults && (
          <a
            href="/api/export/csv?track=career"
            download="cricket_career_clusters.csv"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </a>
        )}
      </div>

      {/* Model Controls */}
      <ClusterControlPanel
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        scalerType={scalerType}
        setScalerType={setScalerType}
        params={params}
        setParams={setParams}
        onRunAnalysis={handleExecute}
        loading={loading}
      />

      {/* Cluster Profiles Cards */}
      {profiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Discovered Career Cluster Profiles ({profiles.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.map((prof) => (
              <div
                key={prof.cluster_id}
                onClick={() => setSelectedClusterFilter(prof.cluster_id.toString())}
                className={`glass-card rounded-xl p-4 border transition-all cursor-pointer ${
                  selectedClusterFilter === prof.cluster_id.toString()
                    ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    prof.cluster_id === -1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {prof.cluster_id === -1 ? 'Noise' : `Cluster ${prof.cluster_id}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {prof.sample_count} Players ({prof.sample_percentage}%)
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{prof.profile_title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{prof.profile_description}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                  <div>Runs: <span className="text-purple-300 font-bold">{prof.feature_stats?.Runs?.median ?? '-'}</span></div>
                  <div>Ave: <span className="text-emerald-300 font-bold">{prof.feature_stats?.Ave?.median ?? '-'}</span></div>
                  <div>SR: <span className="text-cyan-300 font-bold">{prof.feature_stats?.SR?.median ?? '-'}</span></div>
                  <div>Bound %: <span className="text-amber-300 font-bold">{prof.feature_stats?.Boundary_Pct?.median ?? '-'}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search batsman name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClusterFilter}
              onChange={(e) => setSelectedClusterFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Clusters ({players.length})</option>
              {profiles.map((p) => (
                <option key={p.cluster_id} value={p.cluster_id.toString()}>
                  {p.cluster_id === -1 ? 'Noise / Outliers' : `Cluster ${p.cluster_id}: ${p.profile_title}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Batsman</th>
                <th className="py-3 px-4">Cluster Profile</th>
                <th className="py-3 px-4">Matches</th>
                <th className="py-3 px-4">Innings</th>
                <th className="py-3 px-4">Runs</th>
                <th className="py-3 px-4">Average</th>
                <th className="py-3 px-4">Strike Rate</th>
                <th className="py-3 px-4">Bound %</th>
                <th className="py-3 px-4">100 / 50</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-500 text-xs">
                    No batsman found matching criteria. Run model analysis above.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPlayer(player.Player);
                      setActiveTab('profile');
                    }}
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-white flex items-center space-x-2">
                      <span>{player.Player}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        player.Cluster === -1 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                      }`}>
                        <Layers className="w-3 h-3" />
                        <span>C{player.Cluster}: {player.Cluster_Title}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{player.Mat}</td>
                    <td className="py-3 px-4 text-slate-300">{player.Inns}</td>
                    <td className="py-3 px-4 font-bold text-purple-300">{player.Runs}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{player.Ave}</td>
                    <td className="py-3 px-4 font-bold text-cyan-400">{player.SR}</td>
                    <td className="py-3 px-4 text-amber-300">{player.Boundary_Pct ? `${player.Boundary_Pct}%` : '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{player['100']} / {player['50']}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-purple-400 hover:text-purple-300 font-sans text-[11px] inline-flex items-center space-x-1">
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
