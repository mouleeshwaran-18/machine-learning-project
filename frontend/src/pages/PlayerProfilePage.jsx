import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  UserSearch, 
  Search, 
  Trophy, 
  Zap, 
  Layers, 
  Award, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';

export default function PlayerProfilePage({ selectedPlayer, setSelectedPlayer }) {
  const [searchInput, setSearchInput] = useState(selectedPlayer || 'Virat Kohli');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchProfile = async (name) => {
    if (!name) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(name)}`);
      const data = await res.json();
      if (res.ok) {
        setProfileData(data);
      } else {
        setErrorMsg(data.detail || 'Player not found.');
        setProfileData(null);
      }
    } catch (err) {
      setErrorMsg(`Error fetching profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(selectedPlayer || 'Virat Kohli');
  }, [selectedPlayer]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedPlayer(searchInput);
    fetchProfile(searchInput);
  };

  const career = profileData?.career_profile;
  const phase = profileData?.phase_profile;

  // Format Radar data for phase comparison
  const radarData = [
    { phase: 'Powerplay SR', value: phase?.PP_SR || 120, max: 200 },
    { phase: 'Middle SR', value: phase?.MID_SR || 130, max: 200 },
    { phase: 'Death SR', value: phase?.DEATH_SR || 180, max: 250 },
    { phase: 'PP Boundary %', value: (phase?.PP_Boundary_Pct || 15) * 4, max: 100 },
    { phase: 'Death Bound %', value: (phase?.DEATH_Boundary_Pct || 25) * 3, max: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Individual Batsman Deep-Dive Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine career trajectory, Track A cluster membership, Track B T20 phase performance radar, and statistical archetype rationale.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search batsman profile (e.g. Virat Kohli)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-24 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 shadow-md"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading player profile details...
        </div>
      ) : errorMsg ? (
        <div className="glass-card rounded-xl p-8 text-center text-rose-300 border border-rose-500/30 text-xs">
          {errorMsg}
        </div>
      ) : profileData ? (
        <div className="space-y-6">
          {/* Player Banner */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30 font-mono">
                {profileData.player_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{profileData.player_name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {career && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Track A: {career.Cluster_Title}</span>
                    </span>
                  )}
                  {phase && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Track B: {phase.Cluster_Title}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Career Stats Grid */}
          {career && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>Career Performance Metrics (Track A)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Total Runs</span>
                  <span className="text-xl font-bold text-purple-300">{career.Runs}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Batting Average</span>
                  <span className="text-xl font-bold text-emerald-400">{career.Ave}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Strike Rate</span>
                  <span className="text-xl font-bold text-cyan-400">{career.SR}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Boundary Runs %</span>
                  <span className="text-xl font-bold text-amber-300">{career.Boundary_Pct}%</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Highest Score</span>
                  <span className="text-xl font-bold text-white">{career.HS}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Centuries / 50s</span>
                  <span className="text-xl font-bold text-slate-200">{career['100']} / {career['50']}</span>
                </div>
              </div>
            </div>
          )}

          {/* Phase Radar & Breakdown */}
          {phase && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Phase Radar Chart */}
              <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-white">T20 Phase Performance Radar</h3>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="phase" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 200]} stroke="#475569" />
                      <Radar
                        name={profileData.player_name}
                        dataKey="value"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Phase Breakdown Stats */}
              <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4 font-mono">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">Phase Metric Breakdown</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-semibold text-slate-200 font-sans">Powerplay (Overs 1–6)</span>
                      <span className="text-[11px] text-slate-400">Dot Ball: {phase.PP_Dot_Pct}%</span>
                    </div>
                    <span className="text-base font-bold text-emerald-400">SR {phase.PP_SR}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-semibold text-slate-200 font-sans">Middle Overs (Overs 7–15)</span>
                      <span className="text-[11px] text-slate-400">Dot Ball: {phase.MID_Dot_Pct}%</span>
                    </div>
                    <span className="text-base font-bold text-purple-300">SR {phase.MID_SR}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-semibold text-slate-200 font-sans font-bold">Death Overs (Overs 16–20)</span>
                      <span className="text-[11px] text-amber-300">Boundary %: {phase.DEATH_Boundary_Pct}%</span>
                    </div>
                    <span className="text-base font-bold text-cyan-400">SR {phase.DEATH_SR}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
