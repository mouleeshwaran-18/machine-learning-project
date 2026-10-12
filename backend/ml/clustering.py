import numpy as np
import pandas as pd
from sklearn.cluster import HDBSCAN, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

try:
    import umap
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False

def run_hdbscan(X_scaled: np.ndarray, min_cluster_size: int = 4, min_samples: int = 2) -> tuple[np.ndarray, dict]:
    """
    Executes HDBSCAN density-based clustering.
    Returns cluster labels (where -1 indicates noise/outliers) and parameters.
    """
    # Ensure min_cluster_size <= n_samples
    n_samples = len(X_scaled)
    min_cluster_size = min(max(2, min_cluster_size), n_samples)
    min_samples = min(max(1, min_samples), min_cluster_size)

    model = HDBSCAN(min_cluster_size=min_cluster_size, min_samples=min_samples)
    labels = model.fit_predict(X_scaled)
    
    noise_count = int((labels == -1).sum())
    noise_pct = float(round((noise_count / n_samples) * 100, 2))
    
    meta = {
        "algorithm": "HDBSCAN",
        "min_cluster_size": min_cluster_size,
        "min_samples": min_samples,
        "n_clusters": len(set(labels) - {-1}),
        "noise_count": noise_count,
        "noise_pct": noise_pct
    }
    return labels, meta

def run_gmm(X_scaled: np.ndarray, n_components: int = 4, covariance_type: str = 'full', random_state: int = 42) -> tuple[np.ndarray, np.ndarray, dict]:
    """
    Executes Gaussian Mixture Model soft/probabilistic clustering.
    Returns hard cluster labels, posterior probabilities matrix, and metadata.
    """
    n_samples = len(X_scaled)
    n_components = min(max(2, n_components), n_samples)
    
    gmm = GaussianMixture(n_components=n_components, covariance_type=covariance_type, random_state=random_state)
    gmm.fit(X_scaled)
    labels = gmm.predict(X_scaled)
    probs = gmm.predict_proba(X_scaled)
    
    meta = {
        "algorithm": "Gaussian Mixture Model (GMM)",
        "n_components": n_components,
        "covariance_type": covariance_type,
        "n_clusters": n_components,
        "bic": float(round(gmm.bic(X_scaled), 2)),
        "aic": float(round(gmm.aic(X_scaled), 2))
    }
    return labels, probs, meta

def run_spectral(X_scaled: np.ndarray, n_clusters: int = 4, affinity: str = 'rbf', random_state: int = 42) -> tuple[np.ndarray, dict]:
    """
    Executes Spectral Clustering graph similarity algorithm.
    """
    n_samples = len(X_scaled)
    n_clusters = min(max(2, n_clusters), n_samples)

    spectral = SpectralClustering(n_clusters=n_clusters, affinity=affinity, random_state=random_state)
    labels = spectral.fit_predict(X_scaled)
    
    meta = {
        "algorithm": "Spectral Clustering",
        "n_clusters": n_clusters,
        "affinity": affinity
    }
    return labels, meta

def compute_umap_2d(X_scaled: np.ndarray, n_neighbors: int = 15, min_dist: float = 0.1, random_state: int = 42) -> tuple[np.ndarray, str]:
    """
    Reduces feature dimensionality to 2D using UMAP (or PCA/t-SNE fallback).
    Used solely for visual layout projection, NOT for clustering assignment.
    """
    n_samples = len(X_scaled)
    n_neighbors = min(n_neighbors, n_samples - 1)
    
    if HAS_UMAP and n_samples >= 5:
        try:
            reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=2, random_state=random_state)
            coords_2d = reducer.fit_transform(X_scaled)
            return coords_2d, "UMAP"
        except Exception:
            pass

    # Fallback to PCA if UMAP unavailable or fails
    pca = PCA(n_components=2, random_state=random_state)
    coords_2d = pca.fit_transform(X_scaled)
    return coords_2d, "PCA (Fallback)"

def generate_cluster_profiles(df_raw: pd.DataFrame, feature_cols: list, labels: np.ndarray, is_track_b: bool = False) -> list[dict]:
    """
    Interprets clusters on raw scale features (mean, median, min, max, representative players).
    Automatically discovers descriptive statistical profile titles.
    """
    df = df_raw.copy()
    df['Cluster'] = labels
    
    unique_clusters = sorted(list(set(labels)))
    profiles = []
    
    # Calculate global medians for relative comparison
    global_stats = {col: float(df[col].median()) for col in feature_cols if col in df.columns}
    
    for cluster_id in unique_clusters:
        cluster_df = df[df['Cluster'] == cluster_id]
        count = len(cluster_df)
        pct = float(round((count / len(df)) * 100, 2))
        players = cluster_df['Player'].tolist() if 'Player' in cluster_df.columns else []
        
        feature_stats = {}
        for col in feature_cols:
            if col in cluster_df.columns:
                mean_val = float(round(cluster_df[col].mean(), 2))
                med_val = float(round(cluster_df[col].median(), 2))
                feature_stats[col] = {
                    "mean": mean_val,
                    "median": med_val,
                    "min": float(round(cluster_df[col].min(), 2)),
                    "max": float(round(cluster_df[col].max(), 2))
                }

        # Profile naming heuristics based on relative stats
        if cluster_id == -1:
            title = "Noise / Outlier Profile"
            desc = "Players with anomalous statistical patterns that do not fit into dense clusters."
        elif is_track_b:
            # Phase-wise role heuristics
            pp_sr = feature_stats.get('PP_SR', {}).get('median', 0)
            mid_sr = feature_stats.get('MID_SR', {}).get('median', 0)
            death_sr = feature_stats.get('DEATH_SR', {}).get('median', 0)
            death_six = feature_stats.get('DEATH_Six_Pct', {}).get('median', 0)
            mid_dot = feature_stats.get('MID_Dot_Pct', {}).get('median', 50)
            
            if death_sr > 180 or death_six > 20:
                title = "Power Finishers & Death Accelerators"
                desc = "Specialists who maximize scoring rate and boundary production in overs 16–20."
            elif pp_sr > 145:
                title = "Aggressive Powerplay Openers"
                desc = "Capitalize on field restrictions during overs 1–6 with rapid boundary striking."
            elif mid_sr > 135 and mid_dot < 30:
                title = "Middle-Overs Accelerators & Rotators"
                desc = "Control middle overs (7–15) with low dot-ball percentage and consistent boundary placement."
            else:
                title = "Phase Anchors & Steady Builders"
                desc = "Stabilize innings across overs with measured risk and steady baseline strike rates."
        else:
            # Career role heuristics
            runs_med = feature_stats.get('Runs', {}).get('median', 0)
            ave_med = feature_stats.get('Ave', {}).get('median', 0)
            sr_med = feature_stats.get('SR', {}).get('median', 0)
            bound_med = feature_stats.get('Boundary_Pct', {}).get('median', 0)
            
            if runs_med > global_stats.get('Runs', 0) * 1.3 and ave_med > global_stats.get('Ave', 0) * 1.1:
                title = "Consistent High-Volume Scorers"
                desc = "Elite career run-scorers with exceptional batting average and high match volume."
            elif sr_med > global_stats.get('SR', 0) * 1.1 and bound_med > global_stats.get('Boundary_Pct', 0) * 1.1:
                title = "Aggressive Boundary Hitters"
                desc = "Dynamic batters with high strike rates driven by a high proportion of boundary runs."
            elif ave_med > global_stats.get('Ave', 0) * 1.05 and sr_med <= global_stats.get('SR', 0):
                title = "Anchors & Inning Stabilizers"
                desc = "Reliable accumulators characterized by solid averages and low risk delivery consumption."
            else:
                title = "Balanced Middle-Order Performers"
                desc = "Versatile batsmen maintaining balanced run scoring, strike rotation, and moderate boundary percentage."

        profiles.append({
            "cluster_id": int(cluster_id),
            "profile_title": title,
            "profile_description": desc,
            "sample_count": count,
            "sample_percentage": pct,
            "players": players,
            "feature_stats": feature_stats
        })

    return profiles
