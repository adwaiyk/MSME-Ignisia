import os
import sys
import pandas as pd
import numpy as np
import joblib
import re

_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJ = os.path.join(_DIR, "..", "..")
sys.path.insert(0, os.path.join(_PROJ, "data-synthesis"))

import feature_engineering
import shap_serializer
from policy_adjustments import apply_gst_amnesty
from xgboost_engine import FEATURE_COLS

_MODEL_PATH = os.path.join(_PROJ, "models", "xgboost_v1.joblib")
xgb_model = joblib.load(_MODEL_PATH)

# DYNAMIC POLICY CONFIGURATION
GST_POLICY = {
    "active": True,
    "type": "amnesty",
    "alpha": 0.6
}

def score_from_gstin(gstin: str) -> dict:
    data_warnings = []
    
    # INPUT VALIDATION: GSTIN format
    if not isinstance(gstin, str) or not re.match(r'^[A-Za-z0-9]{15}$', gstin):
        return {"error": "Invalid GSTIN format. Expected 15 alphanumeric characters.", "status": "invalid_format"}

    datasets_path = os.path.join(_PROJ, "data-synthesis", "datasets")
    
    try:
        master_df = pd.read_csv(os.path.join(datasets_path, "onboarding_data.csv"))
    except FileNotFoundError:
        return {"error": "Onboarding data not found.", "status": "data_missing"}

    if "gstin" not in master_df.columns or master_df[master_df["gstin"] == gstin].empty:
        return {"error": f"GSTIN {gstin} not found.", "status": "not_found"}
        
    row = master_df.loc[master_df["gstin"] == gstin]
    entity_id = row["entity_id"].iloc[0] if "entity_id" in row.columns else None
    
    if entity_id is None:
        return {"error": "Missing entity_id for the provided GSTIN.", "status": "error_entity_id"}
    
    # Load other datasets safely
    try:
        gst_df = pd.read_csv(os.path.join(datasets_path, "gst_filings.csv"))
        if "msme_id" in gst_df.columns:
            gst_df.rename(columns={"msme_id": "entity_id"}, inplace=True)
            
        upi_df = pd.read_csv(os.path.join(datasets_path, "upi_transactions.csv"))
        eway_df = pd.read_csv(os.path.join(datasets_path, "eway_bills.csv"))
    except Exception as e:
        return {"error": f"Error loading secondary datasets: {str(e)}", "status": "data_error"}

    # Default logic for missing columns in master/eway
    if "industry_risk_factor" not in master_df.columns:
        master_df["industry_risk_factor"] = 0.5
    if "is_anomaly" not in eway_df.columns:
        eway_df["is_anomaly"] = 0
        
    # DATA SUFFICIENCY CONFIDENCE
    sources = 0
    if not gst_df[gst_df["entity_id"] == entity_id].empty: sources += 1
    if not upi_df[upi_df["entity_id"] == entity_id].empty: sources += 1
    if not eway_df[eway_df["entity_id"] == entity_id].empty: sources += 1
    
    if sources == 3:
        confidence = "HIGH"
    elif sources == 2:
        confidence = "MEDIUM"
        data_warnings.append("Partial data availability (only 2 sources)")
    else:
        confidence = "LOW"
        data_warnings.append("Limited transaction history available")

    # Feature Engineering
    feature_df = feature_engineering.transform(str(entity_id), gst_df, upi_df, eway_df, master_df)
    
    # FEATURE SAFETY: ensure all FEATURE_COLS exist and replace NaNs/infs
    for col in FEATURE_COLS:
        if col not in feature_df.columns:
            feature_df[col] = 0.0
            data_warnings.append(f"Missing column {col} defaulted to 0")
            
    # Select and Clean
    X = feature_df[FEATURE_COLS].copy()
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0, inplace=True)
    
    # CLIPPING EXTREME FEATURE VALUES
    X["upi_net_flow_ratio"] = X["upi_net_flow_ratio"].clip(-5, 5)
    X["eway_momentum"] = X["eway_momentum"].clip(-3, 3)
    X["upi_velocity_30d"] = X["upi_velocity_30d"].clip(0, 1000)
    X["sales_volume_avg"] = X["sales_volume_avg"].apply(lambda x: max(0, x))
    
    # Ensure numeric types
    for col in FEATURE_COLS:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)
    
    # DYNAMIC POLICY ADJUSTMENT
    if GST_POLICY.get("active"):
        X = apply_gst_amnesty(X, GST_POLICY)
        data_warnings.append(f"Applied active GST policy: {GST_POLICY.get('type')}")
    
    # ZERO ACTIVITY EDGE CASE
    activity_metrics = ["upi_inflow_avg", "upi_outflow_avg", "eway_volume_avg", "sales_volume_avg"]
    if all(X[m].iloc[0] <= 0.01 for m in activity_metrics if m in X.columns):
        confidence = "LOW"
        data_warnings.append("low activity signal")

    # PREDICTION
    try:
        # Ensure shape (1, n_features) and order
        X_input = X.reindex(columns=FEATURE_COLS)
        probas = xgb_model.predict_proba(X_input)
        if hasattr(probas, 'shape') and len(probas.shape) > 1 and probas.shape[1] > 1:
            pd_val = float(probas[0, 1])
        else:
            pd_val = float(probas[0])
    except Exception as e:
        pd_val = 0.5
        data_warnings.append(f"Model prediction error: {str(e)}")

    # EXTREME PD EDGE CASE
    if pd_val > 0.98:
        risk_band = "HIGH_RISK_DECLINED"
        credit_score = int(900 - pd_val * 600)
    elif pd_val < 0.02:
        credit_score = min(870, int(900 - pd_val * 600))
        risk_band = "VERY_LOW_RISK_APPROVED"
    else:
        credit_score = int(900 - pd_val * 600)
        # Determine risk band
        if pd_val < 0.2: risk_band = "VERY_LOW_RISK_APPROVED"
        elif pd_val < 0.4: risk_band = "LOW_RISK_APPROVED"
        elif pd_val < 0.6: risk_band = "MEDIUM_RISK_REVIEW"
        elif pd_val <= 0.8: risk_band = "HIGH_RISK_REVIEW"
        else: risk_band = "HIGH_RISK_DECLINED"

    # LOAN SAFETY RULES
    tenure_map = {
        "VERY_LOW_RISK_APPROVED": 36,
        "LOW_RISK_APPROVED": 24,
        "MEDIUM_RISK_REVIEW": 12,
        "HIGH_RISK_REVIEW": 6,
        "HIGH_RISK_DECLINED": 0
    }
    tenure_months = tenure_map.get(risk_band, 0)
    
    loan_amount = 0.0
    if risk_band != "HIGH_RISK_DECLINED":
        upi_inflow = float(feature_df["upi_inflow_avg"].iloc[0])
        annual_inflow = upi_inflow * 12
        loan_amount = 0.25 * annual_inflow
        
        # Loan constraints
        loan_amount = min(loan_amount, 0.3 * annual_inflow)
        
        # Bureau penalty
        bureau_score = int(feature_df.get("bureau_score_cibil", pd.Series([-1])).iloc[0])
        if bureau_score == -1:
            loan_amount *= 0.80
            data_warnings.append("missing bureau score")
            
        # Vintage penalty
        vintage = float(feature_df.get("vintage_months", pd.Series([0])).iloc[0])
        if vintage < 3:
            risk_band = "MEDIUM_RISK_REVIEW"
            tenure_months = 12
            data_warnings.append("limited transaction history")
        elif vintage < 6:
            loan_amount *= 0.60
            data_warnings.append("limited transaction history")
            
        # Max/Min Loan
        loan_amount = np.clip(loan_amount, 0, 5000000)
        
        # Zero activity cap
        if "low activity signal" in data_warnings:
            loan_amount = min(loan_amount, 50000)

    # Final Reasons
    shap_res = shap_serializer.explain(X_input, xgb_model)
    top_reasons = shap_res.get("top_5_reasons", [])
    if not top_reasons:
        top_reasons = ["Insufficient model explainability confidence"]
    
    return {
        "credit_score": credit_score,
        "probability_of_default": round(pd_val, 6),
        "risk_band": risk_band,
        "recommended_loan_amount": round(float(loan_amount), 2),
        "tenure_months": tenure_months,
        "confidence": confidence,
        "top_reasons": top_reasons,
        "data_warnings": list(set(data_warnings))
    }

