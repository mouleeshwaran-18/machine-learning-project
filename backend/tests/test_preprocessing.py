import pandas as pd
import numpy as np
from ml.preprocessing import clean_and_normalize_career_df, audit_dataset_quality, scale_features
from ml.track_b_phasewise import compute_phasewise_batsman_metrics

def test_clean_career_df():
    data = {
        'Player': ['V Kohli', 'R Sharma'],
        'Mat': ['100', '90'],
        'Runs': [4000, 3500],
        'HS': ['183*', '264'],
        '4s': [400, 350],
        '6s': [50, 100]
    }
    df = pd.DataFrame(data)
    cleaned = clean_and_normalize_career_df(df)
    
    assert 'Boundary_Runs' in cleaned.columns
    assert cleaned['HS'].iloc[0] == 183
    assert cleaned['HS'].iloc[1] == 264
    assert cleaned['Mat'].iloc[0] == 100

def test_scaling():
    X = pd.DataFrame({'a': [1, 2, 3, 100], 'b': [10, 20, 30, 40]})
    scaled_rob, _ = scale_features(X, method='robust')
    scaled_std, _ = scale_features(X, method='standard')
    
    assert scaled_rob.shape == (4, 2)
    assert scaled_std.shape == (4, 2)

def test_phasewise_metrics():
    bbb_data = {
        'batter': ['Kohli', 'Kohli', 'Kohli', 'Kohli', 'Kohli', 'Kohli'],
        'over': [2, 3, 8, 10, 17, 19],
        'batter_runs': [4, 1, 0, 1, 6, 4],
        'wide_runs': [0, 0, 0, 0, 0, 0],
        'noball_runs': [0, 0, 0, 0, 0, 0],
        'is_wicket': [0, 0, 0, 0, 0, 0],
        'player_dismissed': ['', '', '', '', '', '']
    }
    df = pd.DataFrame(bbb_data)
    res_df, X_df, features = compute_phasewise_batsman_metrics(df, min_balls_faced=1)
    
    assert len(res_df) == 1
    assert 'PP_SR' in res_df.columns
    assert 'MID_SR' in res_df.columns
    assert 'DEATH_SR' in res_df.columns
