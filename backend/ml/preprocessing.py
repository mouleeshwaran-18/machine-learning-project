import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, RobustScaler

def clean_and_normalize_career_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans career statistics dataframe dynamically:
    - Normalizes column names (case-insensitive mapping)
    - Removes asterisk (*) from Highest Score (HS)
    - Casts numeric values and handles missing/invalid values
    - Removes exact duplicate records
    """
    df = df.copy()
    
    # Map common column variations
    col_mapping = {}
    for col in df.columns:
        c_lower = col.strip().lower()
        if c_lower in ['player', 'name', 'batsman', 'batter']:
            col_mapping[col] = 'Player'
        elif c_lower in ['mat', 'matches', 'm']:
            col_mapping[col] = 'Mat'
        elif c_lower in ['inns', 'innings', 'inns.']:
            col_mapping[col] = 'Inns'
        elif c_lower in ['no', 'notout', 'not outs']:
            col_mapping[col] = 'NO'
        elif c_lower in ['runs', 'r']:
            col_mapping[col] = 'Runs'
        elif c_lower in ['hs', 'high score', 'highest score']:
            col_mapping[col] = 'HS'
        elif c_lower in ['ave', 'avg', 'average', 'batting average']:
            col_mapping[col] = 'Ave'
        elif c_lower in ['bf', 'balls faced', 'balls']:
            col_mapping[col] = 'BF'
        elif c_lower in ['sr', 'strike rate', 'strikerate']:
            col_mapping[col] = 'SR'
        elif c_lower in ['100', '100s', 'hundreds', 'centuries']:
            col_mapping[col] = '100'
        elif c_lower in ['50', '50s', 'fifties', 'half centuries']:
            col_mapping[col] = '50'
        elif c_lower in ['4s', 'fours', '4']:
            col_mapping[col] = '4s'
        elif c_lower in ['6s', 'sixes', '6']:
            col_mapping[col] = '6s'

    df.rename(columns=col_mapping, inplace=True)
    
    # Deduplicate
    df = df.drop_duplicates()
    
    # Clean HS column if present
    if 'HS' in df.columns:
        df['HS'] = df['HS'].astype(str).str.replace('*', '', regex=False)
        df['HS'] = pd.to_numeric(df['HS'], errors='coerce').fillna(0).astype(int)

    # Convert numeric columns
    numeric_cols = ['Mat', 'Inns', 'NO', 'Runs', 'Ave', 'BF', 'SR', '100', '50', '4s', '6s']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace('-', '0'), errors='coerce').fillna(0)

    # Ensure Player column exists
    if 'Player' not in df.columns:
        df['Player'] = [f"Player_{i+1}" for i in range(len(df))]

    # Derive additional statistical metrics if possible
    if 'Runs' in df.columns and '4s' in df.columns and '6s' in df.columns:
        boundary_runs = (df['4s'] * 4) + (df['6s'] * 6)
        df['Boundary_Runs'] = boundary_runs
        df['Boundary_Pct'] = np.where(df['Runs'] > 0, (boundary_runs / df['Runs']) * 100, 0.0)

    if '100' in df.columns and '50' in df.columns:
        df['Milestones'] = df['100'] + df['50']

    if 'Runs' in df.columns and 'Inns' in df.columns:
        df['Runs_Per_Inns'] = np.where(df['Inns'] > 0, df['Runs'] / df['Inns'], 0.0)

    return df

def audit_dataset_quality(df: pd.DataFrame) -> dict:
    """
    Returns column counts, missing values summary, duplicate rows, and schema overview.
    """
    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "duplicate_rows": int(df.duplicated().sum()),
        "numeric_columns": list(df.select_dtypes(include=[np.number]).columns)
    }

def scale_features(X: pd.DataFrame, method: str = 'robust') -> tuple[np.ndarray, object]:
    """
    Scales numerical features using either RobustScaler or StandardScaler.
    - RobustScaler is preferred when outliers are present (uses median and IQR).
    - StandardScaler uses mean and standard deviation.
    """
    if method == 'standard':
        scaler = StandardScaler()
    else:
        scaler = RobustScaler()

    X_scaled = scaler.fit_transform(X)
    return X_scaled, scaler

def compute_correlation_matrix(df: pd.DataFrame, feature_cols: list) -> dict:
    """
    Computes pairwise Pearson correlation matrix for visual heatmaps.
    """
    valid_cols = [c for c in feature_cols if c in df.columns]
    corr_df = df[valid_cols].corr().fillna(0.0)
    
    return {
        "features": valid_cols,
        "matrix": corr_df.values.tolist()
    }
