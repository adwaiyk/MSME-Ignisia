"""
xgboost_engine.py
Owner: ML & Risk Architect
Purpose: Scoring engine handoff file for the backend engineer.
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timezone

_ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_ENGINE_DIR, "..", ".."))
sys.path.insert(0, os.path.join(_PROJECT_ROOT, "data-synthesis"))

import feature_engineering
import shap_serializer
from policy_adjustments import apply_gst_amnesty

_MODEL_DIR = os.path.join(_PROJECT_ROOT, "models")

try:
    _xgb_model = joblib.load(os.path.join(_MODEL_DIR, "xgboost_v1.joblib"))
except Exception as e:
    print(f"[WARNING] Failed to load XGBoost model: {e}")
    _xgb_model = None

try:
    _lr_model = joblib.load(os.path.join(_MODEL_DIR, "lr_model.joblib"))
except Exception as e:
    print(f"[WARNING] Failed to load LogisticRegression model: {e}")
    _lr_model = None

FEATURE_COLS = [
    "gst_ontime_rate",
    "gst_avg_delay",
    "sales_volume_avg",
    "itc_utilisation_ratio",
    "upi_inflow_avg",
    "upi_outflow_avg",
    "upi_net_flow_ratio",
    "upi_velocity_30d",
    "upi_counterparty_diversity",
    "geo_diversity",
    "repeated_counterparty_ratio",
    "eway_volume_avg",
    "eway_momentum",
    "eway_anomaly_rate",
    "vintage_months",
    "age_penalty",
    "industry_risk_factor",
    "bureau_score_cibil",
]

RISK_BANDS = [
    (300, 499, "HIGH_RISK_DECLINED"),
    (500, 649, "MEDIUM_RISK_REVIEW"),
    (650, 749, "LOW_RISK_APPROVED"),
    (750, 900, "VERY_LOW_RISK_APPROVED"),
]

BAND_MULTIPLIERS = {
    "HIGH_RISK_DECLINED": 0.0,
    "MEDIUM_RISK_REVIEW": 0.5,
    "LOW_RISK_APPROVED": 1.5,
    "VERY_LOW_RISK_APPROVED": 3.0,
}

BAND_TENURE = {
    "HIGH_RISK_DECLINED": 0,
    "MEDIUM_RISK_REVIEW": 12,
    "LOW_RISK_APPROVED": 24,
    "VERY_LOW_RISK_APPROVED": 36,
}

MAX_LOAN_AMOUNT = 50_00_000

# DYNAMIC POLICY CONFIGURATION
GST_POLICY = {
    "active": True,
    "type": "amnesty",
    "alpha": 0.6
}

def _sigmoid_stretch(prob: float) -> int:
    stretched = 1.0 / (1.0 + np.exp(-10.0 * (prob - 0.5)))
    score = 300 + 600 * (1.0 - stretched)
    return int(np.clip(round(score), 300, 900))

def _get_risk_band(prob: float) -> str:
    if prob > 0.8:
        return "HIGH_RISK_DECLINED"
    elif prob > 0.6:
        return "MEDIUM_RISK_REVIEW"
    elif prob > 0.4:
        return "LOW_RISK_APPROVED"
    else:
        return "VERY_LOW_RISK_APPROVED"

def score(entity_id: str, gst_payload: pd.DataFrame, upi_payload: pd.DataFrame,
          eway_payload: pd.DataFrame, master_payload: pd.DataFrame) -> dict:
    try:
        feature_df = feature_engineering.transform(
            entity_id, gst_payload, upi_payload, eway_payload, master_payload
        )

        reasons = []

        # DYNAMIC POLICY ADJUSTMENT
        if GST_POLICY.get("active"):
            feature_df = apply_gst_amnesty(feature_df, GST_POLICY)
            reasons.append(f"Applied active GST policy: {GST_POLICY.get('type')}")

        X_df = feature_df[FEATURE_COLS].fillna(0)

        if _xgb_model is not None:
            xgb_proba = float(_xgb_model.predict_proba(X_df)[:, 1][0])
        else:
            xgb_proba = 0.5
            reasons.append("XGBoost model unavailable — using default probability")

        if _lr_model is not None:
            lr_proba = float(_lr_model.predict_proba(X_df)[:, 1][0])
        else:
            lr_proba = 0.5
            reasons.append("LogisticRegression model unavailable — using default probability")

        bureau_score = int(feature_df["bureau_score_cibil"].iloc[0])
        if bureau_score > 750:
            xgb_proba = max(0.0, xgb_proba * 0.85)
            reasons.append("High CIBIL score (>750) — adjusted risk downwards")

        credit_score = _sigmoid_stretch(xgb_proba)
        risk_band = _get_risk_band(xgb_proba)

        try:
            shap_res = shap_serializer.explain(feature_df[FEATURE_COLS].fillna(0), _xgb_model)
            top_5 = shap_res.get("top_5_reasons", [])
            reasons.extend(top_5)
        except Exception as e:
            reasons.append(f"SHAP Error: {str(e)}")

        xgb_class = int(xgb_proba >= 0.5)
        lr_class = int(lr_proba >= 0.5)
        model_agreement = (xgb_class == lr_class)

        if not model_agreement:
            reasons.append("Conflicting model signals — manual review recommended")

        upi_inflow_avg = float(feature_df["upi_inflow_avg"].iloc[0])
        multiplier = BAND_MULTIPLIERS.get(risk_band, 0.0)
        recommended_loan = min(upi_inflow_avg * multiplier, MAX_LOAN_AMOUNT)
        
        if bureau_score == -1:
            recommended_loan *= 0.8
            reasons.append("No prior bureau score found — limiting maximal loan amount by 20%")
            
        tenure_months = BAND_TENURE.get(risk_band, 0)

        data_confidence = str(feature_df["data_confidence"].iloc[0])

        return {
            "entity_id": entity_id,
            "bureau_score_cibil": int(feature_df["bureau_score_cibil"].iloc[0]),
            "score": credit_score,
            "risk_band": risk_band,
            "probability_of_default": round(xgb_proba, 6),
            "lr_probability": round(lr_proba, 6),
            "model_agreement": model_agreement,
            "recommended_loan_amount": round(recommended_loan, 2),
            "tenure_months": tenure_months,
            "data_confidence": data_confidence,
            "scored_at": datetime.now(timezone.utc).isoformat(),
            "reasons": reasons,
        }

    except Exception as e:
        return {
            "entity_id": entity_id,
            "bureau_score_cibil": 0,
            "score": 0,
            "risk_band": "ERROR",
            "probability_of_default": 0.0,
            "lr_probability": 0.0,
            "model_agreement": False,
            "recommended_loan_amount": 0.0,
            "tenure_months": 0,
            "data_confidence": "low",
            "scored_at": datetime.now(timezone.utc).isoformat(),
            "reasons": [f"Scoring error: {str(e)}"],
        }
