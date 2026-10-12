import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import DatasetUploadPage from './pages/DatasetUploadPage';
import CareerAnalysisPage from './pages/CareerAnalysisPage';
import PhaseWisePage from './pages/PhaseWisePage';
import AlgorithmComparisonPage from './pages/AlgorithmComparisonPage';
import VisualizationsPage from './pages/VisualizationsPage';
import PlayerProfilePage from './pages/PlayerProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [careerResults, setCareerResults] = useState(null);
  const [phaseResults, setPhaseResults] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('Virat Kohli');
  
  const [loadingCareer, setLoadingCareer] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(false);

  // Fetch dataset info & run default initial models on mount
  const fetchDatasetInfo = async () => {
    try {
      const res = await fetch('/api/datasets/info');
      const data = await res.json();
      if (res.ok) {
        setDatasetInfo(data);
      }
    } catch (err) {
      console.error('Error fetching dataset info:', err);
    }
  };

  const runCareerAnalysis = async (algorithm = 'hdbscan', scalerType = 'robust', params = {}) => {
    setLoadingCareer(true);
    try {
      const res = await fetch('/api/analyze/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, scaler_type: scalerType, params })
      });
      const data = await res.json();
      if (res.ok) {
        setCareerResults(data);
      }
    } catch (err) {
      console.error('Error analyzing career:', err);
    } finally {
      setLoadingCareer(false);
    }
  };

  const runPhaseAnalysis = async (algorithm = 'hdbscan', scalerType = 'robust', params = {}) => {
    setLoadingPhase(true);
    try {
      const res = await fetch('/api/analyze/phasewise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, scaler_type: scalerType, params })
      });
      const data = await res.json();
      if (res.ok) {
        setPhaseResults(data);
      }
    } catch (err) {
      console.error('Error analyzing phasewise:', err);
    } finally {
      setLoadingPhase(false);
    }
  };

  useEffect(() => {
    fetchDatasetInfo();
    runCareerAnalysis('hdbscan', 'robust', { min_cluster_size: 4, min_samples: 2 });
    runPhaseAnalysis('hdbscan', 'robust', { min_cluster_size: 3, min_samples: 2 });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetInfo={datasetInfo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            datasetInfo={datasetInfo}
            careerResults={careerResults}
            phaseResults={phaseResults}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'upload' && (
          <DatasetUploadPage
            datasetInfo={datasetInfo}
            onRefreshInfo={fetchDatasetInfo}
          />
        )}

        {activeTab === 'career' && (
          <CareerAnalysisPage
            careerResults={careerResults}
            onRunCareerAnalysis={runCareerAnalysis}
            loading={loadingCareer}
            setActiveTab={setActiveTab}
            setSelectedPlayer={setSelectedPlayer}
          />
        )}

        {activeTab === 'phasewise' && (
          <PhaseWisePage
            phaseResults={phaseResults}
            onRunPhaseAnalysis={runPhaseAnalysis}
            loading={loadingPhase}
            setActiveTab={setActiveTab}
            setSelectedPlayer={setSelectedPlayer}
          />
        )}

        {activeTab === 'comparison' && (
          <AlgorithmComparisonPage />
        )}

        {activeTab === 'visualizations' && (
          <VisualizationsPage
            careerResults={careerResults}
            phaseResults={phaseResults}
          />
        )}

        {activeTab === 'profile' && (
          <PlayerProfilePage
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
          />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-4 bg-[#0f172a]/60 text-center text-xs text-slate-500 font-mono">
        Advanced Machine Learning-Based Cricket Batsman Performance Clustering & Phase-Wise Role Discovery
      </footer>
    </div>
  );
}
