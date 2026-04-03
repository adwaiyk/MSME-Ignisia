"""
xgboost_engine.py
Owner: ML & Risk Architect
Purpose: Scoring engine handoff file for the backend engineer.
"""

import pandas as pd
import joblib
from datetime import datetime, timezone
import importlib.util
import os
import numpy as np

# ==============================
# Dynamically load modules
# ==============================
def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

BASE_DIR = "/media/aditya/3C4F8EAC3C229A1D/college/Hackthon/Ignisia2026/pipeline/api/pipelining"

feature_engineering = load_module(f"{BASE_DIR}/data-synthesis/feature_engineering.py", "feature_engineering")
shap_serializer = load_module(f"{BASE_DIR}/backend-fastapi/engines/shap_serializer.py", "shap_serializer")

# ==============================
# Load XGBoost and LogisticRegression models
# ==============================
xgb_model = joblib.load(f"{BASE_DIR}/models/xgboost_v1.joblib")
lr_model = joblib.load(f"{BASE_DIR}/models/lr_model.joblib")

# ==============================
# Feature columns and constants
# ==============================
FEATURE_COLS = [
    "gst_ontime_rate","gst_avg_delay","sales_volume_avg","itc_utilisation_ratio",
    "upi_inflow_avg","upi_outflow_avg","upi_net_flow_ratio","upi_velocity_30d",
    "upi_counterparty_diversity","geo_diversity","repeated_counterparty_ratio",
    "eway_volume_avg","eway_momentum","eway_anomaly_rate","vintage_months",
    "age_penalty","industry_risk_factor","bureau_score_cibil"
]

BAND_MULTIPLIERS = {"HIGH_RISK_DECLINED":0.0,"MEDIUM_RISK_REVIEW":0.5,"LOW_RISK_APPROVED":1.5,"VERY_LOW_RISK_APPROVED":3.0}
BAND_TENURE = {"HIGH_RISK_DECLINED":0,"MEDIUM_RISK_REVIEW":12,"LOW_RISK_APPROVED":24,"VERY_LOW_RISK_APPROVED":36}
MAX_LOAN_AMOUNT = 50_00_000

# ==============================
# Helper functions and scoring
# ==============================
def _sigmoid_stretch(prob: float) -> int:
    stretched = 1.0 / (1.0 + np.exp(-10.0 * (prob - 0.5)))
    score = 300 + 600 * (1.0 - stretched)
    return int(np.clip(round(score), 300, 900))

def _get_risk_band(prob: float) -> str:
    if prob > 0.8: return "HIGH_RISK_DECLINED"
    elif prob > 0.6: return "MEDIUM_RISK_REVIEW"
    elif prob > 0.4: return "LOW_RISK_APPROVED"
    else: return "VERY_LOW_RISK_APPROVED"

def score(entity_id: str, gst_payload: pd.DataFrame, upi_payload: pd.DataFrame,
          eway_payload: pd.DataFrame, master_payload: pd.DataFrame) -> dict:
    try:
        feature_df = feature_engineering.transform(entity_id, gst_payload, upi_payload, eway_payload, master_payload)
        X_df = feature_df[FEATURE_COLS].fillna(0)
        
        xgb_proba = float(xgb_model.predict_proba(X_df)[:, 1][0])
        lr_proba = float(lr_model.predict_proba(X_df)[:, 1][0])
        
        credit_score = _sigmoid_stretch(xgb_proba)
        risk_band = _get_risk_band(xgb_proba)
        
        shap_res = shap_serializer.explain(X_df, xgb_model)
        reasons = shap_res.get("top_5_reasons", [])
        
        bureau_score = int(feature_df["bureau_score_cibil"].iloc[0])
        upi_inflow_avg = float(feature_df["upi_inflow_avg"].iloc[0])
        multiplier = BAND_MULTIPLIERS.get(risk_band, 0.0)
        recommended_loan = min(upi_inflow_avg * multiplier, MAX_LOAN_AMOUNT)
        if bureau_score == -1: recommended_loan *= 0.8
        
        tenure_months = BAND_TENURE.get(risk_band, 0)
        model_agreement = int(xgb_proba >= 0.5) == int(lr_proba >= 0.5)
        if not model_agreement: reasons.append("Conflicting model signals — manual review recommended")
        
        return {
            "entity_id": entity_id,
            "score": credit_score,
            "risk_band": risk_band,
            "probability_of_default": round(xgb_proba, 6),
            "lr_probability": round(lr_proba, 6),
            "model_agreement": model_agreement,
            "recommended_loan_amount": round(recommended_loan, 2),
            "tenure_months": tenure_months,
            "reasons": reasons,
            "scored_at": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {"entity_id": entity_id, "score": 0, "risk_band": "ERROR", "probability_of_default": 0.0, "lr_probability":0.0, "model_agreement": False, "recommended_loan_amount":0.0, "tenure_months":0, "reasons":[f"Scoring error: {str(e)}"], "scored_at": datetime.now(timezone.utc).isoformat()}