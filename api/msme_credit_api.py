"""
msme_credit_api.py
Owner: Backend / ML Integration
Purpose: Expose MSME credit scoring via callable function or FastAPI endpoint.
"""

import pandas as pd
from fastapi import FastAPI
import importlib.util

# ==============================
# Paths
# ==============================
XGB_ENGINE_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/backend-fastapi/engines/xgboost_engine.py"
DATASETS_PATH = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining/data-synthesis/datasets"

# ==============================
# Dynamically load xgboost_engine
# ==============================
spec = importlib.util.spec_from_file_location("xgboost_engine", XGB_ENGINE_PATH)
xgb_engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(xgb_engine)

# Get the score function
engine_score = xgb_engine.score

# ==============================
# Load datasets once
# ==============================
onboarding_df = pd.read_csv(f"{DATASETS_PATH}/onboarding_data.csv")
gst_df = pd.read_csv(f"{DATASETS_PATH}/gst_filings.csv")
upi_df = pd.read_csv(f"{DATASETS_PATH}/upi_transactions.csv")
eway_df = pd.read_csv(f"{DATASETS_PATH}/eway_bills.csv")

# Ensure GSTIN column is lowercase string
onboarding_df["gstin"] = onboarding_df["gstin"].astype(str).str.lower()
if "msme_id" in gst_df.columns:
    gst_df.rename(columns={"msme_id": "entity_id"}, inplace=True)

# ==============================
# Callable function for GSTIN scoring
# ==============================
def score_gstin(gstin: str) -> dict:
    """
    Input: GSTIN string
    Output: dict with only SHAP reasons
    """
    gstin = gstin.strip().lower()

    # Check if GSTIN exists
    if gstin not in onboarding_df["gstin"].values:
        return {"error": f"GSTIN {gstin} not found in onboarding data."}

    # Get entity_id from onboarding
    entity_id = onboarding_df.loc[onboarding_df["gstin"] == gstin, "entity_id"].iloc[0]

    # Call scoring engine from dynamically loaded module
    result = engine_score(
        str(entity_id),
        gst_df,
        upi_df,
        eway_df,
        onboarding_df
    )

    return result
    

# ==============================
# FastAPI app
# ==============================
app = FastAPI(title="MSME Credit Scoring API")

@app.get("/score/{gstin}")
def score_endpoint(gstin: str):
    """
    FastAPI GET endpoint: /score/<GSTIN>
    Returns credit score dict
    """
    return score_gstin(gstin)

# ==============================
# CLI test
# ==============================
if __name__ == "__main__":
    gstin_input = input("Enter GSTIN to score: ").strip()
    result = score_gstin(gstin_input)
    print(result)