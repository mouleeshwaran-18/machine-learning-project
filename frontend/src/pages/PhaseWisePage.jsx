import React, { useState } from 'react';
import ClusterControlPanel from '../components/ClusterControlPanel';
import { 
  Zap, 
  Download, 
  Search, 
  Filter, 
  Layers, 
  Sparkles,
  ChevronRight,
  PieChart
} from 'lucide-react';

export default function PhaseWisePage({ 
  phaseResults, 
  onRunPhaseAnalysis, 
  loading,
  setActiveTab,
  setSelectedPlayer
}) {
  const [algorithm, setAlgorithm] = useState('hdbscan');
  const [scalerType, setScalerType] = useState('robust');
  const [params, setParams] = useState({ min_cluster_size: 3, min_samples: 2 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('all');

  const handleExecute = () => {
    onRunPhaseAnalysis(algorithm, scalerType, params);
  };

  const players = phaseResults?.players_data || [];
  const profiles = phaseResults?.cluster_profiles || [];

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Track B: T20 Phase-Wise Batting Role Discovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze ball-by-ball performance across Powerplay (Overs 1–6), Middle (Overs 7–15), and Death (Overs 16–20) to discover tactical T20 role archetypes.
          </p>
        </div>
        {phaseResults && (
          <a
            href="/api/export/csv?track=phasewise"
            download="cricket_phasewise_clusters.csv"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
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

      {/* Phase Role Cards */}
      {profiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Discovered Phase-Wise Role Clusters ({profiles.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.map((prof) => (
              <div
                key={prof.cluster_id}
                onClick={() => setSelectedClusterFilter(prof.cluster_id.toString())}
                className={`glass-card rounded-xl p-4 border transition-all cursor-pointer ${
                  selectedClusterFilter === prof.cluster_id.toString()
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    prof.cluster_id === -1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {prof.cluster_id === -1 ? 'Noise' : `Role C${prof.cluster_id}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {prof.sample_count} Players
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{prof.profile_title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{prof.profile_description}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Powerplay SR:</span>
                    <span className="text-emerald-400 font-bold">{prof.feature_stats?.PP_SR?.median ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Middle SR:</span>
                    <span className="text-purple-300 font-bold">{prof.feature_stats?.MID_SR?.median ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Death SR:</span>
                    <span className="text-cyan-400 font-bold">{prof.feature_stats?.DEATH_SR?.median ?? '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table view */}
      <div className="glass-card rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search T20 batsman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClusterFilter}
              onChange={(e) => setSelectedClusterFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Roles ({players.length})</option>
              {profiles.map((p) => (
                <option key={p.cluster_id} value={p.cluster_id.toString()}>
                  {p.cluster_id === -1 ? 'Noise' : `C${p.cluster_id}: ${p.profile_title}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Batsman</th>
                <th className="py-3 px-4">Discovered Role</th>
                <th className="py-3 px-4">PP SR</th>
                <th className="py-3 px-4">PP Dot %</th>
                <th className="py-3 px-4">MID SR</th>
                <th className="py-3 px-4">MID Dot %</th>
                <th className="py-3 px-4">DEATH SR</th>
                <th className="py-3 px-4">DEATH Bound %</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 text-xs">
                    No phase records found. Ensure ball-by-ball dataset is uploaded.
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
                    <td className="py-3 px-4 font-sans font-semibold text-white">{player.Player}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        player.Cluster === -1 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>C{player.Cluster}: {player.Cluster_Title}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{player.PP_SR || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{player.PP_Dot_Pct ? `${player.PP_Dot_Pct}%` : '-'}</td>
                    <td className="py-3 px-4 font-bold text-purple-300">{player.MID_SR || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{player.MID_Dot_Pct ? `${player.MID_Dot_Pct}%` : '-'}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300">{player.DEATH_SR || '-'}</td>
                    <td className="py-3 px-4 text-amber-300">{player.DEATH_Boundary_Pct ? `${player.DEATH_Boundary_Pct}%` : '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-cyan-400 hover:text-cyan-300 font-sans text-[11px] inline-flex items-center space-x-1">
                        <span>Details</span>
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
