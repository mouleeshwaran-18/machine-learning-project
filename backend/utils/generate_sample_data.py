import pandas as pd
import numpy as np
import os

def generate_ball_by_ball_dataset(output_path):
    np.random.seed(42)
    
    players_profiles = {
        # Format: (Powerplay_SR, Middle_SR, Death_SR, Powerplay_Dot%, Middle_Dot%, Death_Dot%, Powerplay_Bound%, Middle_Bound%, Death_Bound%)
        "Virat Kohli": (125, 132, 195, 0.38, 0.28, 0.18, 0.16, 0.12, 0.28),
        "Rohit Sharma": (148, 135, 210, 0.42, 0.30, 0.20, 0.22, 0.14, 0.30),
        "AB de Villiers": (135, 150, 230, 0.32, 0.22, 0.15, 0.18, 0.20, 0.35),
        "MS Dhoni": (105, 120, 190, 0.45, 0.35, 0.22, 0.10, 0.12, 0.26),
        "Chris Gayle": (130, 145, 205, 0.50, 0.32, 0.22, 0.20, 0.22, 0.32),
        "Jos Buttler": (155, 140, 185, 0.35, 0.28, 0.20, 0.24, 0.16, 0.26),
        "Yashasvi Jaiswal": (168, 135, 160, 0.36, 0.32, 0.25, 0.26, 0.15, 0.20),
        "Travis Head": (172, 138, 165, 0.34, 0.30, 0.22, 0.28, 0.16, 0.22),
        "Suryakumar Yadav": (140, 165, 215, 0.30, 0.20, 0.15, 0.20, 0.24, 0.32),
        "Andre Russell": (110, 145, 225, 0.55, 0.30, 0.18, 0.14, 0.22, 0.38),
        "Heinrich Klaasen": (120, 160, 220, 0.38, 0.22, 0.16, 0.15, 0.25, 0.34),
        "Rinku Singh": (115, 135, 210, 0.40, 0.26, 0.16, 0.12, 0.18, 0.32),
        "KL Rahul": (130, 122, 170, 0.40, 0.33, 0.25, 0.18, 0.11, 0.22),
        "Babar Azam": (122, 125, 160, 0.38, 0.30, 0.25, 0.16, 0.12, 0.20),
        "Glenn Maxwell": (135, 158, 205, 0.36, 0.24, 0.18, 0.19, 0.23, 0.30),
        "Hardik Pandya": (115, 130, 195, 0.42, 0.32, 0.20, 0.12, 0.14, 0.28),
        "Nicholas Pooran": (138, 152, 210, 0.35, 0.25, 0.17, 0.21, 0.22, 0.31),
        "David Miller": (115, 138, 190, 0.42, 0.30, 0.20, 0.12, 0.16, 0.27),
        "Liam Livingstone": (142, 150, 200, 0.38, 0.27, 0.20, 0.21, 0.21, 0.30),
        "Rashid Khan": (90, 110, 175, 0.50, 0.40, 0.28, 0.08, 0.10, 0.22)
    }

    bowlers = ["Jasprit Bumrah", "Rashid Khan", "Mitchell Starc", "Trent Boult", "Yuzvendra Chahal", "Kagiso Rabada", "Sunil Narine", "Pat Cummins"]

    records = []
    match_id = 1001

    for m in range(30): # 30 matches
        match_id_str = f"MATCH_{match_id + m}"
        for inning in [1, 2]:
            over_num = 1
            ball_num = 1
            current_batter_idx = 0
            batter_keys = list(players_profiles.keys())
            np.random.shuffle(batter_keys)
            
            striker = batter_keys[0]
            non_striker = batter_keys[1]
            next_batter_idx = 2

            while over_num <= 20:
                bowler = np.random.choice(bowlers)
                
                # Phase determination
                if over_num <= 6:
                    phase = "Powerplay"
                    p_idx = 0
                elif over_num <= 15:
                    phase = "Middle"
                    p_idx = 1
                else:
                    phase = "Death"
                    p_idx = 2

                # 6 legal balls per over
                legal_balls_in_over = 0
                while legal_balls_in_over < 6:
                    # Get striker phase profile
                    prof = players_profiles.get(striker, (130, 130, 160, 0.35, 0.30, 0.22, 0.16, 0.16, 0.24))
                    sr = prof[p_idx]
                    dot_p = prof[p_idx + 3]
                    bound_p = prof[p_idx + 6]
                    
                    # Extras chance
                    is_wide = np.random.rand() < 0.04
                    is_noball = False if is_wide else (np.random.rand() < 0.015)
                    
                    if is_wide:
                        records.append({
                            "match_id": match_id_str,
                            "inning": inning,
                            "over": over_num,
                            "ball": legal_balls_in_over + 1,
                            "batter": striker,
                            "bowler": bowler,
                            "batter_runs": 0,
                            "extra_runs": 1,
                            "wide_runs": 1,
                            "noball_runs": 0,
                            "total_runs": 1,
                            "is_wicket": 0,
                            "dismissal_type": "",
                            "player_dismissed": "",
                            "phase": phase
                        })
                        continue # wide doesn't count as legal ball

                    if is_noball:
                        b_runs = np.random.choice([0, 1, 2, 4, 6], p=[0.2, 0.4, 0.1, 0.2, 0.1])
                        records.append({
                            "match_id": match_id_str,
                            "inning": inning,
                            "over": over_num,
                            "ball": legal_balls_in_over + 1,
                            "batter": striker,
                            "bowler": bowler,
                            "batter_runs": b_runs,
                            "extra_runs": 1,
                            "wide_runs": 0,
                            "noball_runs": 1,
                            "total_runs": b_runs + 1,
                            "is_wicket": 0,
                            "dismissal_type": "",
                            "player_dismissed": "",
                            "phase": phase
                        })
                        if b_runs % 2 != 0:
                            striker, non_striker = non_striker, striker
                        continue

                    # Legal delivery
                    legal_balls_in_over += 1
                    
                    # Wicket chance (~4.5%)
                    is_wicket = np.random.rand() < 0.045
                    if is_wicket:
                        dismissal = np.random.choice(["caught", "bowled", "lbw", "stumped", "run out"], p=[0.5, 0.2, 0.15, 0.1, 0.05])
                        records.append({
                            "match_id": match_id_str,
                            "inning": inning,
                            "over": over_num,
                            "ball": legal_balls_in_over,
                            "batter": striker,
                            "bowler": bowler,
                            "batter_runs": 0,
                            "extra_runs": 0,
                            "wide_runs": 0,
                            "noball_runs": 0,
                            "total_runs": 0,
                            "is_wicket": 1,
                            "dismissal_type": dismissal,
                            "player_dismissed": striker,
                            "phase": phase
                        })
                        # New batter comes in if available
                        if next_batter_idx < len(batter_keys):
                            striker = batter_keys[next_batter_idx]
                            next_batter_idx += 1
                        else:
                            # All out, break inning
                            over_num = 99
                            break
                        continue

                    # Normal run outcome based on profile probabilities
                    rand_val = np.random.rand()
                    if rand_val < dot_p:
                        b_runs = 0
                    elif rand_val < (dot_p + bound_p):
                        # Boundary (4 or 6)
                        six_prob = 0.45 if phase == "Death" else 0.3
                        b_runs = 6 if np.random.rand() < six_prob else 4
                    else:
                        # Singles/Doubles
                        b_runs = np.random.choice([1, 2, 3], p=[0.8, 0.18, 0.02])

                    records.append({
                        "match_id": match_id_str,
                        "inning": inning,
                        "over": over_num,
                        "ball": legal_balls_in_over,
                        "batter": striker,
                        "bowler": bowler,
                        "batter_runs": b_runs,
                        "extra_runs": 0,
                        "wide_runs": 0,
                        "noball_runs": 0,
                        "total_runs": b_runs,
                        "is_wicket": 0,
                        "dismissal_type": "",
                        "player_dismissed": "",
                        "phase": phase
                    })

                    if b_runs % 2 != 0:
                        striker, non_striker = non_striker, striker

                # Change strike end of over
                striker, non_striker = non_striker, striker
                over_num += 1

    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} ball-by-ball records saved to {output_path}")

if __name__ == "__main__":
    generate_ball_by_ball_dataset("data/ball_by_ball/t20_ball_by_ball.csv")
