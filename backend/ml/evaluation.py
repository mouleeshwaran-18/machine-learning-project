import numpy as np
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

def evaluate_clustering(X_scaled: np.ndarray, labels: np.ndarray) -> dict:
    """
    Evaluates clustering performance with strict handling for edge cases.
    - Silhouette Score (higher is better, range [-1, 1])
    - Davies-Bouldin Index (lower is better, range [0, inf])
    - Calinski-Harabasz Score (higher is better)
    - Noise Percentage (HDBSCAN outlier ratio)
    """
    total_samples = len(labels)
    unique_labels = set(labels)
    non_noise_mask = labels != -1
    
    noise_count = int((labels == -1).sum())
    noise_pct = float(round((noise_count / total_samples) * 100, 2))
    
    valid_labels = set(labels[non_noise_mask])
    n_valid_clusters = len(valid_labels)

    result = {
        "total_samples": total_samples,
        "n_clusters": n_valid_clusters,
        "noise_count": noise_count,
        "noise_percentage": noise_pct,
        "silhouette_score": None,
        "davies_bouldin_index": None,
        "calinski_harabasz_score": None,
        "is_valid": False,
        "evaluation_message": ""
    }

    # Validation checks for mathematical score computation
    if n_valid_clusters < 2:
        result["evaluation_message"] = "Cannot compute metrics: less than 2 distinct valid clusters formed."
        return result

    X_eval = X_scaled[non_noise_mask]
    labels_eval = labels[non_noise_mask]
    
    if len(labels_eval) <= n_valid_clusters:
        result["evaluation_message"] = "Cannot compute metrics: sample count must be greater than cluster count."
        return result

    try:
        sil = float(round(silhouette_score(X_eval, labels_eval), 4))
        db = float(round(davies_bouldin_score(X_eval, labels_eval), 4))
        ch = float(round(calinski_harabasz_score(X_eval, labels_eval), 2))
        
        result["silhouette_score"] = sil
        result["davies_bouldin_index"] = db
        result["calinski_harabasz_score"] = ch
        result["is_valid"] = True
        result["evaluation_message"] = "Evaluation metrics computed successfully."
    except Exception as e:
        result["evaluation_message"] = f"Evaluation calculation error: {str(e)}"

    return result

def compare_all_algorithms(X_scaled: np.ndarray, 
                           hdb_params: dict = None, 
                           gmm_params: dict = None, 
                           spec_params: dict = None) -> dict:
    """
    Runs HDBSCAN, GMM, and Spectral Clustering side-by-side on identical scaled feature matrix X.
    Returns comparison matrix of evaluation scores, cluster counts, and noise statistics.
    """
    from .clustering import run_hdbscan, run_gmm, run_spectral
    
    if hdb_params is None:
        hdb_params = {"min_cluster_size": 4, "min_samples": 2}
    if gmm_params is None:
        gmm_params = {"n_components": 4}
    if spec_params is None:
        spec_params = {"n_clusters": 4}

    # Run HDBSCAN
    hdb_labels, hdb_meta = run_hdbscan(X_scaled, **hdb_params)
    hdb_eval = evaluate_clustering(X_scaled, hdb_labels)
    
    # Run GMM
    gmm_labels, _, gmm_meta = run_gmm(X_scaled, **gmm_params)
    gmm_eval = evaluate_clustering(X_scaled, gmm_labels)

    # Run Spectral
    spec_labels, spec_meta = run_spectral(X_scaled, **spec_params)
    spec_eval = evaluate_clustering(X_scaled, spec_labels)

    return {
        "HDBSCAN": {
            "metadata": hdb_meta,
            "metrics": hdb_eval
        },
        "GMM": {
            "metadata": gmm_meta,
            "metrics": gmm_eval
        },
        "SpectralClustering": {
            "metadata": spec_meta,
            "metrics": spec_eval
        }
    }
