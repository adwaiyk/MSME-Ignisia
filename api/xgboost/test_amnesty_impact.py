import sys
import os
import pandas as pd
import numpy as np
import json
from unittest.mock import patch

# Setup paths
ROOT = os.getcwd()
sys.path.insert(0, os.path.join(ROOT, "backend-fastapi", "engines"))
sys.path.insert(0, os.path.join(ROOT, "data-synthesis"))

import gstin_scorer
import feature_engineering

# DYNAMIC POLICY CONFIGURATION FOR TEST
AMNESTY_POLICY_ON = {
    "active": True,
    "type": "amnesty",
    "alpha": 0.85
}

AMNESTY_POLICY_OFF = {
    "active": False,
    "type": "amnesty",
    "alpha": 0.85
}

def simulate_amnesty_impact():
    print("MSME Edge Case: Amnesty Impact Verification (Rejection vs. Approval)\n")
    
    # 1. Prepare candidate (MSME_10000)
    dataset_dir = os.path.join(ROOT, "data-synthesis", "datasets")
    master_df = pd.read_csv(os.path.join(dataset_dir, "onboarding_data.csv"), nrows=5)
    valid_gstin = master_df["gstin"].iloc[0]
    msme_id = master_df["entity_id"].iloc[0]

    # 2. Mock a "Marginal" MSME profile
    # This MSME has very poor GST history (Full Penalty) 
    # but otherwise healthy features (to be near the decision boundary)
    def mock_marginal_msme(entity_id, gst_df, upi_df, eway_df, master_df):
        df = feature_engineering.transform(entity_id, gst_df, upi_df, eway_df, master_df)
        
        # Marginal GST compliance (The "Penalty" features)
        df["gst_ontime_rate"] = 0.05  # 5% On-time
        df["gst_avg_delay"] = 60.0    # 60 days late on average
        
        # Strong core metrics (The "Approval" features)
        df["upi_inflow_avg"] = 500000.0  # Stable revenue
        df["upi_net_flow_ratio"] = 1.5   # Surplus liquidity
        df["eway_momentum"] = 1.2        # Expanding logistics
        df["vintage_months"] = 24.0      # Mature business
        df["bureau_score_cibil"] = 680   # Decent credit history
        
        return df

    print(f"Testing MSME: {msme_id} (Simulated Marginal Profile)\n")
    
    with patch("gstin_scorer.feature_engineering.transform", side_effect=mock_marginal_msme):
        # Scenario A: Amnesty OFF (Expect REJECTION)
        print("[SCENARIO A] Amnesty Layer: DISABLED")
        gstin_scorer.GST_POLICY = AMNESTY_POLICY_OFF
        res_off = gstin_scorer.score_from_gstin(valid_gstin)
        print(f"Status: {res_off['risk_band']} | Score: {res_off['credit_score']}")
        
        # Scenario B: Amnesty ON (Expect APPROVAL/REVIEW)
        print("\n[SCENARIO B] Amnesty Layer: ENABLED (Alpha 0.85)")
        gstin_scorer.GST_POLICY = AMNESTY_POLICY_ON
        res_on = gstin_scorer.score_from_gstin(valid_gstin)
        print(f"Status: {res_on['risk_band']} | Score: {res_on['credit_score']}")

    # 3. Validation Report
    print("\n" + "="*80)
    print("DECISION SHIFT ANALYSIS")
    print("="*80)
    print(f"{'Condition':<20} | {'Status':<25} | {'Credit Score'}")
    print("-" * 80)
    print(f"{'Policy OFF':<20} | {res_off['risk_band']:<25} | {res_off['credit_score']}")
    print(f"{'Policy ON':<20} | {res_on['risk_band']:<25} | {res_on['credit_score']}")
    print("="*80)

    # Success conditions
    rejection_to_review = (res_off['risk_band'] == "HIGH_RISK_DECLINED" and res_on['risk_band'] != "HIGH_RISK_DECLINED")
    
    if rejection_to_review:
        print(f"\n[SUCCESS] Captured 'Rejection to Review' shift!")
        print(f"Impact: Softening GST penalties lifted the MSME score by {res_on['credit_score'] - res_off['credit_score']} points.")
    else:
        print("\n[ALERT] Shift not captured. Adjust simulated features to bring the MSME closer to the 500-score threshold.")

if __name__ == "__main__":
    try:
        simulate_amnesty_impact()
    except Exception as e:
        print(f"Test failed: {e}")
