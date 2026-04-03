import sys
import os
import json
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "backend-fastapi", "engines"))
sys.path.insert(0, os.path.join(ROOT, "data-synthesis"))

import xgboost_engine
import shap_serializer
import feature_engineering

def main():
    print("Loading datasets (skipping first 5000, nrows=5000)...")
    dataset_dir = os.path.join(ROOT, "data-synthesis", "datasets")
    
    # Read headers to ensure column names are preserved when skipping rows
    header_df = pd.read_csv(os.path.join(dataset_dir, "onboarding_data.csv"), nrows=0)
    
    master_df = pd.read_csv(os.path.join(dataset_dir, "onboarding_data.csv"), skiprows=range(1, 5001), nrows=5000)
    gst_df = pd.read_csv(os.path.join(dataset_dir, "gst_filings.csv"), skiprows=range(1, 5001), nrows=5000)
    upi_df = pd.read_csv(os.path.join(dataset_dir, "upi_transactions.csv"), skiprows=range(1, 5001), nrows=5000)
    eway_df = pd.read_csv(os.path.join(dataset_dir, "eway_bills.csv"), skiprows=range(1, 5001), nrows=5000)
    
    # Pre-process minimal columns exactly as generated datasets expected
    if "msme_id" in gst_df.columns:
        gst_df.rename(columns={"msme_id": "entity_id"}, inplace=True)
    if "industry_code" in master_df.columns and "industry_risk_factor" not in master_df.columns:
        master_df["industry_risk_factor"] = 0.5
    if "is_anomaly" not in eway_df.columns:
        eway_df["is_anomaly"] = 0

    # Search for positive examples (Score >= 650)
    print("Searching for positive examples in the dataset...")
    found_positive = 0
    for idx in range(len(master_df)):
        entity_id = master_df["entity_id"].iloc[idx]
        
        # Test XGBoost Engine scoring first to filter
        score_result = xgboost_engine.score(
            str(entity_id), 
            gst_df, 
            upi_df, 
            eway_df, 
            master_df
        )
        
        if score_result.get("score", 0) >= 650:
            print(f"\n{'='*50}\n--- Testing for POSITIVE entity_id: {entity_id} ---\n{'='*50}")
            print("\n[1] Testing xgboost_engine.score()...")
            print(json.dumps(score_result, indent=2))
            
            # Test SHAP Serializer
            print("\n[2] Testing shap_serializer.explain()...")
            
            # Manual feature vector extraction to pass to SHAP
            feature_df = feature_engineering.transform(
                str(entity_id), gst_df, upi_df, eway_df, master_df
            )
            feature_vector_df = feature_df[xgboost_engine.FEATURE_COLS].fillna(0)
            
            shap_result = shap_serializer.explain(feature_vector_df, xgboost_engine._xgb_model)
            print(json.dumps(shap_result, indent=2))
            
            found_positive += 1
            if found_positive >= 3:
                break
                
    if found_positive == 0:
        print("Could not find any positive examples in the sampled dataset.")

if __name__ == "__main__":
    main()
