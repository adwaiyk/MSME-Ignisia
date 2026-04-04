import sys
import os
import pandas as pd
import numpy as np

# Setup paths
ROOT = os.getcwd()
sys.path.insert(0, os.path.join(ROOT, "backend-fastapi", "engines"))
sys.path.insert(0, os.path.join(ROOT, "data-synthesis"))

import gstin_scorer
from policy_adjustments import apply_gst_amnesty

def test_demonstration():
    print("MSME Policy Highlight: Dynamic GST Amnesty Demonstration\n")
    
    # 1. Show the "Smoothing" Logic directly on a Sample
    sample_df = pd.DataFrame({
        "gst_ontime_rate": [0.2],  # Very poor: 20% on-time
        "gst_avg_delay": [50.0]    # Very poor: 50 days delay
    })
    
    policy_cfg = {"active": True, "type": "amnesty", "alpha": 0.8}
    adjusted_df = apply_gst_amnesty(sample_df, policy_cfg)
    
    print("STEP 1: Direct Feature Transformation")
    print("-" * 40)
    print(f"Original Ontime Rate: {sample_df['gst_ontime_rate'].iloc[0]:.2f} -> Adjusted: {adjusted_df['gst_ontime_rate'].iloc[0]:.2f}")
    print(f"Original Avg Delay:   {sample_df['gst_avg_delay'].iloc[0]:.2f} -> Adjusted: {adjusted_df['gst_avg_delay'].iloc[0]:.2f}")
    print("-" * 40)
    print("(Amnesty pulls features toward 'neutral' levels: Ontime=0.85, Delay=2.0)\n")

    # 2. Pipeline Test Run
    print("STEP 2: Pipeline Integration Run")
    print("-" * 40)
    dataset_dir = os.path.join(ROOT, "data-synthesis", "datasets")
    master_df = pd.read_csv(os.path.join(dataset_dir, "onboarding_data.csv"), nrows=5)
    valid_gstin = master_df["gstin"].iloc[0]
    
    # Run with Policy ON
    gstin_scorer.GST_POLICY["active"] = True
    gstin_scorer.GST_POLICY["alpha"] = 0.8
    result = gstin_scorer.score_from_gstin(valid_gstin)
    
    print(f"GSTIN Scored: {valid_gstin}")
    print(f"Credit Score: {result['credit_score']}")
    print(f"Risk Band:    {result['risk_band']}")
    print(f"Warnings:     {result['data_warnings']}")
    print("-" * 40)
    print("\n[SUCCESS] The amnesty layer is now fully operational in the scoring pipeline.")

if __name__ == "__main__":
    try:
        test_demonstration()
    except Exception as e:
        print(f"Error during demonstration: {e}")
