import pandas as pd
import numpy as np

def clean_and_normalize_ball_by_ball(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardizes ball-by-ball column names and ensures numeric fields.
    """
    df = df.copy()
    col_map = {}
    for col in df.columns:
        c_lower = col.strip().lower().replace(' ', '_')
        if c_lower in ['batter', 'batsman', 'player']:
            col_map[col] = 'batter'
        elif c_lower in ['bowler']:
            col_map[col] = 'bowler'
        elif c_lower in ['over', 'over_num']:
            col_map[col] = 'over'
        elif c_lower in ['ball', 'ball_num']:
            col_map[col] = 'ball'
        elif c_lower in ['batter_runs', 'runs_off_bat', 'batsman_runs']:
            col_map[col] = 'batter_runs'
        elif c_lower in ['wide_runs', 'wides']:
            col_map[col] = 'wide_runs'
        elif c_lower in ['noball_runs', 'noballs']:
            col_map[col] = 'noball_runs'
        elif c_lower in ['extra_runs', 'extras']:
            col_map[col] = 'extra_runs'
        elif c_lower in ['total_runs', 'runs']:
            col_map[col] = 'total_runs'
        elif c_lower in ['is_wicket', 'wicket', 'dismissal']:
            col_map[col] = 'is_wicket'
        elif c_lower in ['player_dismissed', 'dismissed_player']:
            col_map[col] = 'player_dismissed'
        elif c_lower in ['phase']:
            col_map[col] = 'phase'

    df.rename(columns=col_map, inplace=True)
    
    # Fill defaults if missing
    for num_col in ['over', 'ball', 'batter_runs', 'wide_runs', 'noball_runs', 'extra_runs', 'total_runs', 'is_wicket']:
        if num_col in df.columns:
            df[num_col] = pd.to_numeric(df[num_col], errors='coerce').fillna(0).astype(float)
        else:
            df[num_col] = 0.0

    if 'phase' not in df.columns or df['phase'].isnull().all():
        # Derive phase from over number (1-indexed or 0-indexed)
        # Standard T20 overs: 1-6 Powerplay, 7-15 Middle, 16-20 Death
        def get_phase(over_val):
            # Check if 0-indexed or 1-indexed
            o = int(over_val)
            if o <= 6:
                return 'Powerplay'
            elif o <= 15:
                return 'Middle'
            else:
                return 'Death'
        df['phase'] = df['over'].apply(get_phase)

    # Flag legal delivery (wides are not legal deliveries faced by batter)
    df['is_legal_ball'] = np.where(df['wide_runs'] > 0, 0, 1)
    
    return df

def compute_phasewise_batsman_metrics(df: pd.DataFrame, min_balls_faced: int = 10) -> tuple[pd.DataFrame, pd.DataFrame, list]:
    """
    Aggregates ball-by-ball performance into phase-wise metrics per batsman:
    - Powerplay (overs 1-6), Middle (7-15), Death (16-20)
    - Strike Rate, Dot Ball %, Boundary %, Six %, Runs Per Ball, Outs/Innings
    """
    b_df = clean_and_normalize_ball_by_ball(df)
    
    # Filter for legal deliveries for balls faced calculation
    phases = ['Powerplay', 'Middle', 'Death']
    batsmen = b_df['batter'].unique()
    
    records = []
    
    for batter in batsmen:
        b_sub = b_df[b_df['batter'] == batter]
        total_legal_balls = b_sub['is_legal_ball'].sum()
        
        if total_legal_balls < min_balls_faced:
            continue
            
        row_dict = {'Player': batter, 'Total_Balls_Faced': int(total_legal_balls)}
        
        for phase in phases:
            p_sub = b_sub[b_sub['phase'] == phase]
            p_legal = p_sub[p_sub['is_legal_ball'] == 1]
            p_balls = len(p_legal)
            p_runs = p_sub['batter_runs'].sum()
            p_dots = (p_legal['batter_runs'] == 0).sum()
            p_fours = (p_legal['batter_runs'] == 4).sum()
            p_sixes = (p_legal['batter_runs'] == 6).sum()
            p_boundaries = p_fours + p_sixes
            
            # Dismissals in this phase
            p_outs = p_sub[(p_sub['is_wicket'] == 1) & (p_sub['player_dismissed'] == batter)].shape[0]
            
            p_prefix = phase.lower()[:2] # 'po' -> 'pp', 'mi', 'de'
            if phase == 'Powerplay':
                prefix = 'PP'
            elif phase == 'Middle':
                prefix = 'MID'
            else:
                prefix = 'DEATH'

            if p_balls > 0:
                sr = (p_runs / p_balls) * 100.0
                dot_pct = (p_dots / p_balls) * 100.0
                bound_pct = (p_boundaries / p_balls) * 100.0
                six_pct = (p_sixes / p_balls) * 100.0
                rpb = p_runs / p_balls
            else:
                sr = 0.0
                dot_pct = 0.0
                bound_pct = 0.0
                six_pct = 0.0
                rpb = 0.0
                
            row_dict[f'{prefix}_Balls'] = int(p_balls)
            row_dict[f'{prefix}_Runs'] = int(p_runs)
            row_dict[f'{prefix}_SR'] = round(sr, 2)
            row_dict[f'{prefix}_Dot_Pct'] = round(dot_pct, 2)
            row_dict[f'{prefix}_Boundary_Pct'] = round(bound_pct, 2)
            row_dict[f'{prefix}_Six_Pct'] = round(six_pct, 2)
            row_dict[f'{prefix}_RPB'] = round(rpb, 2)
            row_dict[f'{prefix}_Outs'] = int(p_outs)
            
        records.append(row_dict)
        
    res_df = pd.DataFrame(records)
    
    feature_cols = [
        'PP_SR', 'PP_Dot_Pct', 'PP_Boundary_Pct', 'PP_RPB',
        'MID_SR', 'MID_Dot_Pct', 'MID_Boundary_Pct', 'MID_RPB',
        'DEATH_SR', 'DEATH_Dot_Pct', 'DEATH_Boundary_Pct', 'DEATH_RPB', 'DEATH_Six_Pct'
    ]
    
    # Filter features existing in res_df
    feature_cols = [c for c in feature_cols if c in res_df.columns]
    X_df = res_df[feature_cols].copy().fillna(0.0) if not res_df.empty else pd.DataFrame()
    
    return res_df, X_df, feature_cols
