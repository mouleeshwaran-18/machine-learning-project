from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_datasets_info():
    response = client.get("/api/datasets/info")
    assert response.status_code == 200
    data = response.json()
    assert "career_dataset" in data

def test_analyze_career():
    req_body = {
        "algorithm": "hdbscan",
        "scaler_type": "robust",
        "params": {"min_cluster_size": 3}
    }
    response = client.post("/api/analyze/career", json=req_body)
    assert response.status_code == 200
    res = response.json()
    assert "cluster_profiles" in res
    assert "players_data" in res

def test_compare_algorithms():
    req_body = {"track": "career", "scaler_type": "robust"}
    response = client.post("/api/compare", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert "HDBSCAN" in data
    assert "GMM" in data
    assert "SpectralClustering" in data
