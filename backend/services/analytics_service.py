import os
import pandas as pd
import numpy as np

from ml.preprocessing import (
    clean_and_normalize_career_df, 
    audit_dataset_quality, 
    scale_features, 
    compute_correlation_matrix
)
from ml.track_a_career import prepare_career_dataset, DEFAULT_CAREER_FEATURES
from ml.track_b_phasewise import compute_phasewise_batsman_metrics
from ml.clustering import run_hdbscan, run_gmm, run_spectral, compute_umap_2d, generate_cluster_profiles
from ml.evaluation import evaluate_clustering, compare_all_algorithms

class CricketAnalyticsService:
    def __init__(self, career_csv_path=None, bbb_csv_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if career_csv_path is None:
            career_csv_path = os.path.join(base_dir, "data", "career", "odb.csv")
        if bbb_csv_path is None:
            bbb_csv_path = os.path.join(base_dir, "data", "ball_by_ball", "t20_ball_by_ball.csv")

        self.career_csv_path = career_csv_path
        self.bbb_csv_path = bbb_csv_path
        
        self.career_raw_df = None
        self.bbb_raw_df = None
        
        self.last_track_a_results = None
        self.last_track_b_results = None

        self.load_default_datasets()

    def load_default_datasets(self):
        if os.path.exists(self.career_csv_path):
            self.career_raw_df = pd.read_csv(self.career_csv_path)
        if os.path.exists(self.bbb_csv_path):
            self.bbb_raw_df = pd.read_csv(self.bbb_csv_path)

    def set_career_dataset(self, df: pd.DataFrame):
        self.career_raw_df = df

    def set_ball_by_ball_dataset(self, df: pd.DataFrame):
        self.bbb_raw_df = df

    def get_dataset_info(self):
        career_audit = audit_dataset_quality(self.career_raw_df) if self.career_raw_df is not None else None
        bbb_audit = audit_dataset_quality(self.bbb_raw_df) if self.bbb_raw_df is not None else None
        
        return {
            "career_dataset": career_audit,
            "ball_by_ball_dataset": bbb_audit,
            "track_b_available": self.bbb_raw_df is not None and not self.bbb_raw_df.empty
        }

    def analyze_career(self, algorithm="hdbscan", scaler_type="robust", params: dict = None, feature_list: list = None) -> dict:
        if self.career_raw_df is None or self.career_raw_df.empty:
            raise ValueError("No career batting dataset uploaded or available.")

        if params is None:
            params = {}

        cleaned_df, X_df, features_used = prepare_career_dataset(self.career_raw_df, feature_list)
        X_scaled, scaler = scale_features(X_df, method=scaler_type)

        algo_lower = algorithm.lower()
        probs = None
        
        if algo_lower == 'hdbscan':
            min_c = params.get('min_cluster_size', 4)
            min_s = params.get('min_samples', 2)
            labels, meta = run_hdbscan(X_scaled, min_cluster_size=min_c, min_samples=min_s)
        elif algo_lower == 'gmm':
            n_c = params.get('n_components', 4)
            cov = params.get('covariance_type', 'full')
            labels, probs, meta = run_gmm(X_scaled, n_components=n_c, covariance_type=cov)
        elif algo_lower == 'spectral':
            n_c = params.get('n_clusters', 4)
            aff = params.get('affinity', 'rbf')
            labels, meta = run_spectral(X_scaled, n_clusters=n_c, affinity=aff)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

        # Evaluation metrics
        eval_metrics = evaluate_clustering(X_scaled, labels)
        
        # 2D UMAP projection
        coords_2d, reducer_name = compute_umap_2d(X_scaled)
        
        # Cluster Profiles Interpretation
        profiles = generate_cluster_profiles(cleaned_df, features_used, labels, is_track_b=False)
        
        # Map cluster profiles title to labels
        title_map = {p['cluster_id']: p['profile_title'] for p in profiles}

        # Build table of batsman records
        table_rows = []
        for i, row in cleaned_df.iterrows():
            c_id = int(labels[i])
            record = row.to_dict()
            record['Cluster'] = c_id
            record['Cluster_Title'] = title_map.get(c_id, "Unknown Profile")
            record['UMAP_X'] = float(round(coords_2d[i, 0], 4))
            record['UMAP_Y'] = float(round(coords_2d[i, 1], 4))
            if probs is not None:
                record['Membership_Prob'] = float(round(np.max(probs[i]), 4))
            table_rows.append(record)

        corr_data = compute_correlation_matrix(cleaned_df, features_used)

        result = {
            "track": "Track A: Career Performance Clustering",
            "algorithm": algorithm,
            "scaler_used": scaler_type,
            "features_used": features_used,
            "sample_count": len(cleaned_df),
            "metadata": meta,
            "evaluation_metrics": eval_metrics,
            "cluster_profiles": profiles,
            "correlation_matrix": corr_data,
            "umap_reducer": reducer_name,
            "players_data": table_rows
        }
        
        self.last_track_a_results = result
        return result

    def analyze_phasewise(self, algorithm="hdbscan", scaler_type="robust", params: dict = None, min_balls: int = 15) -> dict:
        if self.bbb_raw_df is None or self.bbb_raw_df.empty:
            raise ValueError("No ball-by-ball dataset available for Track B analysis.")

        if params is None:
            params = {}

        phase_df, X_df, features_used = compute_phasewise_batsman_metrics(self.bbb_raw_df, min_balls_faced=min_balls)
        
        if phase_df.empty or len(phase_df) < 3:
            raise ValueError("Insufficient batsman sample size after phase-wise aggregation.")

        X_scaled, scaler = scale_features(X_df, method=scaler_type)

        algo_lower = algorithm.lower()
        probs = None

        if algo_lower == 'hdbscan':
            min_c = params.get('min_cluster_size', 3)
            min_s = params.get('min_samples', 2)
            labels, meta = run_hdbscan(X_scaled, min_cluster_size=min_c, min_samples=min_s)
        elif algo_lower == 'gmm':
            n_c = params.get('n_components', 4)
            cov = params.get('covariance_type', 'full')
            labels, probs, meta = run_gmm(X_scaled, n_components=n_c, covariance_type=cov)
        elif algo_lower == 'spectral':
            n_c = params.get('n_clusters', 4)
            aff = params.get('affinity', 'rbf')
            labels, meta = run_spectral(X_scaled, n_clusters=n_c, affinity=aff)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

        eval_metrics = evaluate_clustering(X_scaled, labels)
        coords_2d, reducer_name = compute_umap_2d(X_scaled)
        profiles = generate_cluster_profiles(phase_df, features_used, labels, is_track_b=True)
        title_map = {p['cluster_id']: p['profile_title'] for p in profiles}

        table_rows = []
        for i, row in phase_df.iterrows():
            c_id = int(labels[i])
            record = row.to_dict()
            record['Cluster'] = c_id
            record['Cluster_Title'] = title_map.get(c_id, "Unknown Role")
            record['UMAP_X'] = float(round(coords_2d[i, 0], 4))
            record['UMAP_Y'] = float(round(coords_2d[i, 1], 4))
            if probs is not None:
                record['Membership_Prob'] = float(round(np.max(probs[i]), 4))
            table_rows.append(record)

        corr_data = compute_correlation_matrix(phase_df, features_used)

        result = {
            "track": "Track B: Phase-Wise Role Discovery",
            "algorithm": algorithm,
            "scaler_used": scaler_type,
            "features_used": features_used,
            "sample_count": len(phase_df),
            "metadata": meta,
            "evaluation_metrics": eval_metrics,
            "cluster_profiles": profiles,
            "correlation_matrix": corr_data,
            "umap_reducer": reducer_name,
            "players_data": table_rows
        }
        
        self.last_track_b_results = result
        return result

    def compare_algorithms(self, track="career", scaler_type="robust") -> dict:
        if track == "career":
            if self.career_raw_df is None:
                raise ValueError("No career dataset loaded.")
            cleaned_df, X_df, features = prepare_career_dataset(self.career_raw_df)
        else:
            if self.bbb_raw_df is None:
                raise ValueError("No ball-by-ball dataset loaded.")
            cleaned_df, X_df, features = compute_phasewise_batsman_metrics(self.bbb_raw_df)

        X_scaled, _ = scale_features(X_df, method=scaler_type)
        return compare_all_algorithms(X_scaled)

    def get_player_profile(self, player_name: str) -> dict:
        player_lower = player_name.strip().lower()
        
        career_info = None
        if self.last_track_a_results is None and self.career_raw_df is not None:
            self.analyze_career()
            
        if self.last_track_a_results is not None:
            for p in self.last_track_a_results['players_data']:
                if str(p.get('Player', '')).strip().lower() == player_lower:
                    career_info = p
                    break

        phase_info = None
        if self.last_track_b_results is None and self.bbb_raw_df is not None:
            try:
                self.analyze_phasewise()
            except Exception:
                pass
                
        if self.last_track_b_results is not None:
            for p in self.last_track_b_results['players_data']:
                if str(p.get('Player', '')).strip().lower() == player_lower:
                    phase_info = p
                    break

        if career_info is None and phase_info is None:
            return {"found": False, "message": f"Player '{player_name}' not found in active dataset."}

        return {
            "found": True,
            "player_name": player_name,
            "career_profile": career_info,
            "phase_profile": phase_info
        }

    def export_results_csv(self, track="career") -> str:
        res = self.last_track_a_results if track == "career" else self.last_track_b_results
        if res is None:
            raise ValueError(f"No analysis results available for track '{track}'. Run analysis first.")

        df = pd.DataFrame(res['players_data'])
        return df.to_csv(index=False)
