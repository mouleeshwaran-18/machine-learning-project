import pandas as pd
import numpy as np
from .preprocessing import clean_and_normalize_career_df, scale_features

DEFAULT_CAREER_FEATURES = ['Runs', 'Ave', 'SR', 'Boundary_Pct', 'Milestones', 'HS', 'Runs_Per_Inns']

def prepare_career_dataset(df: pd.DataFrame, feature_list: list = None) -> tuple[pd.DataFrame, pd.DataFrame, list]:
    """
    Cleans the raw career dataframe and prepares numerical feature matrix X.
    Excludes non-numerical identifiers like 'Player' from feature fitting.
    """
    cleaned_df = clean_and_normalize_career_df(df)
    
    if feature_list is None or len(feature_list) == 0:
        feature_list = [col for col in DEFAULT_CAREER_FEATURES if col in cleaned_df.columns]
    else:
        feature_list = [col for col in feature_list if col in cleaned_df.columns]

    # Fill any remaining NaNs in feature set
    X_df = cleaned_df[feature_list].copy().fillna(0.0)
    
    return cleaned_df, X_df, feature_list
