import numpy as np
import pandas as pd
from ml.clustering import run_hdbscan, run_gmm, run_spectral, compute_umap_2d
from ml.evaluation import evaluate_clustering

def test_clustering_models():
    np.random.seed(42)
    X = np.random.randn(20, 4)
    
    # Test HDBSCAN
    hdb_labels, hdb_meta = run_hdbscan(X, min_cluster_size=3)
    assert len(hdb_labels) == 20
    assert "noise_pct" in hdb_meta

    # Test GMM
    gmm_labels, probs, gmm_meta = run_gmm(X, n_components=3)
    assert len(gmm_labels) == 20
    assert probs.shape == (20, 3)

    # Test Spectral
    spec_labels, spec_meta = run_spectral(X, n_clusters=3)
    assert len(spec_labels) == 20

    # Test UMAP
    coords, reducer = compute_umap_2d(X)
    assert coords.shape == (20, 2)

def test_evaluation():
    X = np.array([[1, 2], [1, 2.1], [10, 10], [10, 10.1], [100, 100], [100, 100.1]])
    labels = np.array([0, 0, 1, 1, 2, 2])
    
    metrics = evaluate_clustering(X, labels)
    assert metrics["is_valid"] is True
    assert metrics["silhouette_score"] > 0.5
    assert metrics["davies_bouldin_index"] is not None
