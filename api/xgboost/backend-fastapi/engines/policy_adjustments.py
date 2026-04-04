import pandas as pd

def apply_gst_amnesty(feature_df: pd.DataFrame, policy_cfg: dict) -> pd.DataFrame:
    """
    Applies GST amnesty policy to soften the impact of poor GST compliance.
    Formula: adjusted = original + alpha * (neutral - original)
    """
    if not policy_cfg.get("active") or policy_cfg.get("type") != "amnesty":
        return feature_df

    alpha = policy_cfg.get("alpha", 0.6)
    
    # Neutral values: ontime_rate = 0.85, avg_delay = 2.0
    neutral_ontime = 0.85
    neutral_delay = 2.0
    
    df_adjusted = feature_df.copy()
    
    # Adjust gst_ontime_rate
    if "gst_ontime_rate" in df_adjusted.columns:
        original = df_adjusted["gst_ontime_rate"]
        # Formula: original + alpha*(0.85 - original)
        df_adjusted["gst_ontime_rate"] = original + alpha * (neutral_ontime - original)
        
    # Adjust gst_avg_delay
    if "gst_avg_delay" in df_adjusted.columns:
        original = df_adjusted["gst_avg_delay"]
        # Formula: original + alpha*(2.0 - original)
        df_adjusted["gst_avg_delay"] = original + alpha * (neutral_delay - original)
        
    return df_adjusted
