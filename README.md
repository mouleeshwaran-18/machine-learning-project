# Advanced Machine Learning-Based Cricket Batsman Performance Clustering and Phase-Wise Role Discovery

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.7+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

## 📌 Project Abstract

Traditional cricket batting analytics relies heavily on aggregate career averages and static strike rates. However, these surface-level metrics mask critical tactical nuances—such as a batsman's ability to attack in specific over phases (Powerplay vs. Middle vs. Death) or adapt to match scenarios.

This university-level machine learning system introduces a dual-track unsupervised learning framework:
1. **Track A (Overall Career Performance Clustering):** Groups batsmen based on overall career volume, consistency, strike rate, milestone conversion, and boundary dependencies.
2. **Track B (Phase-Wise Batting Role Discovery):** Analyzes granular T20 ball-by-ball deliveries to discover tactical roles across Powerplay (overs 1–6), Middle overs (overs 7–15), and Death overs (overs 16–20).

The platform evaluates and benchmarks **HDBSCAN**, **Gaussian Mixture Model (GMM)**, and **Spectral Clustering** across mathematical validation metrics (**Silhouette Score**, **Davies–Bouldin Index**, **Calinski–Harabasz Index**, and **Outlier Noise Percentage**). High-dimensional feature spaces are projected into interactive 2D manifold scatter plots using **UMAP**.

---

## 🎯 Key Objectives

- **Unsupervised Pattern Discovery:** Automatically discover natural batsman groupings without relying on predefined labels or subjective positional bias.
- **Phase-Wise Tactical Granularity:** Leverage ball-by-ball tracking to identify Powerplay accelerators, middle-order strike rotators, and death-over boundary hitting specialists.
- **Robust Model Comparison:** Benchmark density-based, probabilistic, and graph-based clustering models side-by-side on identical normalized feature samples.
- **Interactive Analytics Dashboard:** Deliver a modern React + FastAPI web interface featuring dark navy aesthetics, interactive UMAP scatter charts, correlation heatmaps, and individual player profile deep-dives.

---

## 📊 Dual-Track System Architecture

```
                               ┌──────────────────────────────────────────┐
                               │       Raw CSV Datasets Upload            │
                               │  Track A: odb.csv | Track B: delivery.csv │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │ Data Preprocessing & Column Audit        │
                               │ Deduplication | Missing Imputation       │
                               │ Feature Scaling (RobustScaler / Standard)│
                               └────────────────────┬─────────────────────┘
                                                    │
                                ┌───────────────────┴───────────────────┐
                                │                                       │
                                ▼                                       ▼
                   ┌──────────────────────────┐           ┌──────────────────────────┐
                   │   Track A: Career ML     │           │   Track B: Phase-Wise ML │
                   │  Runs, Ave, SR, 100/50,  │           │   PP, MID, DEATH SR,     │
                   │  Boundary %, HS          │           │   Dot %, Boundary %      │
                   └────────────┬─────────────┘           └────────────┬─────────────┘
                                │                                      │
                                └───────────────────┬──────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │      Unsupervised Model Engine           │
                               │  1. HDBSCAN (Density & Outlier Noise)    │
                               │  2. GMM (Probabilistic Components)       │
                               │  3. Spectral Clustering (RBF Graph)      │
                               │  4. UMAP (2D Manifold Visualizer)        │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │  Model Evaluation & Profile Discovery    │
                               │  - Silhouette Score | Davies-Bouldin      │
                               │  - Calinski-Harabasz | Outlier Ratio      │
                               │  - Original-Scale Profile Statistics      │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │      FastAPI REST API & React Dashboard  │
                               └──────────────────────────────────────────┘
```

---

## 🔬 Machine Learning Algorithms & Intuition

### 1. HDBSCAN (Hierarchical Density-Based Spatial Clustering of Applications with Noise)
- **Intuition:** Transforms density-based DBSCAN into a hierarchical clustering algorithm to find clusters of varying densities.
- **Anomalous Noise Detection:** Points that fall in sparse feature regions are explicitly labeled as noise (`-1`), preventing unusual or outlier batsmen from corrupting dense cluster centroids.
- **Parameters:** `min_cluster_size` (minimum density core), `min_samples` (conservatism of noise assignment).

### 2. Gaussian Mixture Model (GMM)
- **Intuition:** Assumes all data points are generated from a mixture of $k$ finite Gaussian distributions with unknown parameters.
- **Soft Clustering:** Provides posterior probabilities $P(C_k \mid x)$ for each player, capturing hybrid roles (e.g., a batter who is 65% Anchor and 35% Finisher).
- **Parameters:** `n_components` ($k$), `covariance_type` (`full`, `tied`, `diag`, `spherical`).

### 3. Spectral Clustering
- **Intuition:** Constructs an affinity graph $W$ using Radial Basis Function (RBF) kernels ($W_{ij} = \exp(-\gamma \|x_i - x_j\|^2)$) and performs spectral decomposition of the Graph Laplacian ($L = D - W$).
- **Non-Linear Manifolds:** Effective when cluster boundaries are non-spherical or non-linearly separable.
- **Parameters:** `n_clusters` ($k$), `affinity` (`rbf`, `nearest_neighbors`).

### 4. UMAP (Uniform Manifold Approximation and Projection)
- **Intuition:** Constructs a fuzzy simplicial set representation of the high-dimensional feature manifold and optimizes a low-dimensional layout via cross-entropy minimization.
- **Visualization Note:** UMAP is strictly applied as a 2D dimensionality reduction projection for interactive visualization—it is **never** treated as a clustering algorithm itself.

---

## 📏 Feature Engineering & Cricket Rules

### Track A Formulas
- **Boundary Runs:** $\text{Boundary\_Runs} = (4s \times 4) + (6s \times 6)$
- **Boundary Run %:** $\text{Boundary\_Pct} = \left(\frac{\text{Boundary\_Runs}}{\text{Runs}}\right) \times 100$
- **Runs Per Innings:** $\text{Runs\_Per\_Inns} = \frac{\text{Runs}}{\text{Innings}}$

### Track B Formulas & Cricket Rules
- **Phase Split:** Powerplay (Overs 1–6), Middle (Overs 7–15), Death (Overs 16–20).
- **Legal Deliveries:** Deliveries with `wide_runs > 0` are excluded from `Balls_Faced` calculation according to official ICC laws.
- **Phase Strike Rate:** $\text{Phase\_SR} = \left(\frac{\text{Phase\_Runs}}{\text{Phase\_Balls\_Faced}}\right) \times 100$
- **Phase Dot Ball %:** $\text{Phase\_Dot\_Pct} = \left(\frac{\text{Deliveries with 0 runs}}{\text{Phase\_Balls\_Faced}}\right) \times 100$
- **Phase Boundary %:** $\text{Phase\_Boundary\_Pct} = \left(\frac{\text{Count of 4s and 6s}}{\text{Phase\_Balls\_Faced}}\right) \times 100$

---

## 📈 Evaluation Metrics

1. **Silhouette Score ($S$):** Measures how similar an object is to its own cluster compared to other clusters ($S \in [-1, 1]$). Higher is better.
2. **Davies–Bouldin Index ($DB$):** Evaluates the average similarity measure of each cluster with its most similar cluster. Lower values indicate better separation ($DB \ge 0$).
3. **Calinski–Harabasz Index ($CH$):** Ratio of the sum of between-clusters dispersion and within-cluster dispersion. Higher values indicate denser, better-separated clusters.
4. **Outlier / Noise Ratio:** Percentage of samples categorized as unclassified noise (`-1`) by HDBSCAN.

---

## 🚀 Quickstart & Installation Instructions

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm

### 1. Clone & Set Up Backend

```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Run Backend Unit Tests

```bash
python -m pytest tests
```

### 3. Start Backend Server

```bash
python main.py
```
*The FastAPI backend will start on `http://127.0.0.1:8000`. You can inspect interactive Swagger documentation at `http://127.0.0.1:8000/docs`.*

### 4. Start Frontend React Dashboard

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
*The React Vite dashboard will open at `http://localhost:5173`.*

---

## 📁 Project Directory Structure

```
cricket-batting-analytics/
├── backend/
│   ├── main.py                     # FastAPI main server entry point
│   ├── requirements.txt            # Backend Python dependencies
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py               # REST API endpoints
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── preprocessing.py        # Scalers, cleaning & correlation
│   │   ├── track_a_career.py       # Career dataset preparation
│   │   ├── track_b_phasewise.py    # Ball-by-ball phase aggregation
│   │   ├── clustering.py           # HDBSCAN, GMM, Spectral & UMAP
│   │   └── evaluation.py           # Silhouette, DB, CH & comparison
│   ├── services/
│   │   └── analytics_service.py    # High-level orchestration service
│   ├── utils/
│   │   └── generate_sample_data.py # Synthetic ball-by-ball generator
│   └── tests/
│       ├── test_preprocessing.py
│       ├── test_clustering.py
│       └── test_api.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                 # App root & navigation
│       ├── index.css               # Dark navy glassmorphism styles
│       ├── components/
│       │   ├── Navbar.jsx          # Header navigation bar & badges
│       │   └── ClusterControlPanel.jsx # Hyperparameter controls
│       └── pages/
│           ├── DashboardPage.jsx            # High-level metrics
│           ├── DatasetUploadPage.jsx        # Drag & drop upload & audit
│           ├── CareerAnalysisPage.jsx       # Track A career clustering
│           ├── PhaseWisePage.jsx            # Track B T20 role discovery
│           ├── AlgorithmComparisonPage.jsx  # Side-by-side benchmark
│           ├── VisualizationsPage.jsx       # UMAP 2D & heatmaps
│           └── PlayerProfilePage.jsx        # Individual player profile
├── data/
│   ├── career/
│   │   └── odb.csv                 # Track A career dataset
│   └── ball_by_ball/
│       └── t20_ball_by_ball.csv    # Track B ball-by-ball dataset
└── README.md
```

---

## ⚠️ Limitations & Future Enhancements

1. **Opposition & Pitch Context:** Current clustering models evaluate bowler-independent stats. Integrating pitch conditions (e.g., spin-friendly vs. pace/bounce) would further refine phase roles.
2. **Dynamic Over Customization:** Extending phase splits beyond standard T20 boundaries (1-6, 7-15, 16-20) to support ODI formats (1-10, 11-40, 41-50).
3. **Temporal Trajectory Tracking:** Incorporating time-series clustering to track how a player's batting cluster evolves across different years/seasons.

---

## 📝 License & Academic Disclaimer

This project is built for university-level educational research and advanced Machine Learning portfolio demonstration. All player career statistics are derived from historical international and domestic T20 records.
