import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Database,
  RefreshCw,
  Table
} from 'lucide-react';

export default function DatasetUploadPage({ datasetInfo, onRefreshInfo }) {
  const [careerStatus, setCareerStatus] = useState(null);
  const [bbbStatus, setBbbStatus] = useState(null);
  const [loadingCareer, setLoadingCareer] = useState(false);
  const [loadingBbb, setLoadingBbb] = useState(false);

  const handleCareerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingCareer(true);
    setCareerStatus(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/career', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCareerStatus({ success: true, message: data.message, details: data });
        onRefreshInfo();
      } else {
        setCareerStatus({ success: false, message: data.detail || 'Upload failed.' });
      }
    } catch (err) {
      setCareerStatus({ success: false, message: `Upload error: ${err.message}` });
    } finally {
      setLoadingCareer(false);
    }
  };

  const handleBbbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingBbb(true);
    setBbbStatus(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/ballbyball', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setBbbStatus({ success: true, message: data.message, details: data });
        onRefreshInfo();
      } else {
        setBbbStatus({ success: false, message: data.detail || 'Upload failed.' });
      }
    } catch (err) {
      setBbbStatus({ success: false, message: `Upload error: ${err.message}` });
    } finally {
      setLoadingBbb(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dataset Management & CSV Inspection</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload career batting datasets (Track A) or ball-by-ball delivery datasets (Track B). System automatically validates columns, audits missing values, and removes duplicate records.
        </p>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Track A Upload Card */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-semibold text-white">Track A: Career Batting Dataset</h2>
            </div>
            <a
              href="/api/sample-template/career"
              download="sample_career_template.csv"
              className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </a>
          </div>

          <div className="border-2 border-dashed border-slate-700/80 hover:border-purple-500/50 rounded-xl p-6 text-center bg-slate-900/40 transition-all">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="block text-xs font-semibold text-slate-200">Upload Career CSV (e.g. odb.csv)</span>
            <span className="block text-[11px] text-slate-400 mt-1 mb-4">Columns: Player, Mat, Inns, Runs, Ave, SR, 100, 50, 4s, 6s, HS</span>
            
            <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer transition-all shadow-md shadow-purple-600/20">
              {loadingCareer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>{loadingCareer ? 'Processing...' : 'Browse CSV File'}</span>
              <input type="file" accept=".csv" onChange={handleCareerUpload} className="hidden" />
            </label>
          </div>

          {careerStatus && (
            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
              careerStatus.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              {careerStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              <div>
                <span className="font-semibold">{careerStatus.message}</span>
                {careerStatus.details && (
                  <span className="block text-[11px] text-slate-400 mt-1">
                    Rows: {careerStatus.details.rows} | Columns: {careerStatus.details.columns?.length}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Dataset Audit */}
          {datasetInfo?.career_dataset && (
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="block text-xs font-semibold text-slate-300">Active Career Dataset Audit</span>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                <div>Rows: <span className="text-white">{datasetInfo.career_dataset.row_count}</span></div>
                <div>Cols: <span className="text-white">{datasetInfo.career_dataset.column_count}</span></div>
                <div>Duplicates: <span className="text-white">{datasetInfo.career_dataset.duplicate_rows}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Track B Upload Card */}
        <div className="glass-card rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Track B: T20 Ball-by-Ball Dataset</h2>
            </div>
            <a
              href="/api/sample-template/ballbyball"
              download="sample_ballbyball_template.csv"
              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </a>
          </div>

          <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl p-6 text-center bg-slate-900/40 transition-all">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="block text-xs font-semibold text-slate-200">Upload Delivery CSV (e.g. t20_ball_by_ball.csv)</span>
            <span className="block text-[11px] text-slate-400 mt-1 mb-4">Columns: match_id, inning, over, ball, batter, bowler, batter_runs, extra_runs, is_wicket</span>
            
            <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer transition-all shadow-md shadow-cyan-600/20">
              {loadingBbb ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>{loadingBbb ? 'Processing...' : 'Browse CSV File'}</span>
              <input type="file" accept=".csv" onChange={handleBbbUpload} className="hidden" />
            </label>
          </div>

          {bbbStatus && (
            <div className={`p-3 rounded-lg border text-xs flex items-start space-x-2 ${
              bbbStatus.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              {bbbStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              <div>
                <span className="font-semibold">{bbbStatus.message}</span>
                {bbbStatus.details && (
                  <span className="block text-[11px] text-slate-400 mt-1">
                    Rows: {bbbStatus.details.rows} | Columns: {bbbStatus.details.columns?.length}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Ball-by-Ball Dataset Audit */}
          {datasetInfo?.ball_by_ball_dataset && (
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="block text-xs font-semibold text-slate-300">Active Delivery Dataset Audit</span>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                <div>Rows: <span className="text-white">{datasetInfo.ball_by_ball_dataset.row_count}</span></div>
                <div>Cols: <span className="text-white">{datasetInfo.ball_by_ball_dataset.column_count}</span></div>
                <div>Duplicates: <span className="text-white">{datasetInfo.ball_by_ball_dataset.duplicate_rows}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
