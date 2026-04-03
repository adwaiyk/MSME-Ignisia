"""
shap_serializer.py
Owner: ML & Risk Architect
Purpose: SHAP explanation module.
"""

import numpy as np
import pandas as pd

try:
    import shap
except ImportError:
    shap = None

REASON_TEMPLATES = {
    ("gst_ontime_rate", "positive"): "GST filings consistently on time — strong compliance signal",
    ("gst_ontime_rate", "negative"): "Missed GST filings detected — compliance risk flagged",
    ("gst_avg_delay", "positive"): "GST filing delays are minimal",
    ("gst_avg_delay", "negative"): "Significant GST filing delays detected — cash flow risk",
    ("sales_volume_avg", "positive"): "Declared sales volumes are strong and consistent",
    ("sales_volume_avg", "negative"): "Low declared sales — possible underreporting or business distress",
    ("itc_utilisation_ratio", "positive"): "Strong ITC utilisation indicates healthy supplier relationships",
    ("itc_utilisation_ratio", "negative"): "Low ITC utilisation — possible supply chain gaps or cash flow stress",
    ("upi_inflow_avg", "positive"): "Healthy UPI inflows — strong revenue signal",
    ("upi_inflow_avg", "negative"): "Low UPI inflows — revenue concerns",
    ("upi_outflow_avg", "positive"): "Controlled UPI outflows — disciplined spending",
    ("upi_outflow_avg", "negative"): "High UPI outflows relative to inflows",
    ("upi_net_flow_ratio", "positive"): "UPI cash flow is strongly net positive — healthy liquidity",
    ("upi_net_flow_ratio", "negative"): "UPI outflows outpacing inflows — possible cash pressure",
    ("upi_velocity_30d", "positive"): "High UPI transaction frequency — active business operations",
    ("upi_velocity_30d", "negative"): "Low recent UPI activity — possible business slowdown",
    ("upi_counterparty_diversity", "positive"): "Diverse customer and supplier base via UPI",
    ("upi_counterparty_diversity", "negative"): "Concentrated UPI transactions — limited counterparty diversity",
    ("eway_volume_avg", "positive"): "Healthy e-way bill volume — active logistics operations",
    ("eway_volume_avg", "negative"): "Low e-way bill volume — limited physical goods movement",
    ("eway_momentum", "positive"): "E-way bill volume growing — physical goods movement increasing",
    ("eway_momentum", "negative"): "E-way bill volume declining — logistics activity contracting",
    ("eway_anomaly_rate", "negative"): "E-way bill values not matched by UPI payments — invoice anomalies detected",
    ("geo_diversity", "positive"): "Business transacts across multiple geographies — strong market reach",
    ("geo_diversity", "negative"): "All transactions concentrated in single location — limited business spread",
    ("repeated_counterparty_ratio", "positive"): "Stable recurring customer and supplier relationships detected",
    ("repeated_counterparty_ratio", "negative"): "Mostly one-off transactions — no stable business relationships",
    ("vintage_months", "positive"): "Business has sufficient operating history",
    ("vintage_months", "negative"): "Business is very early stage — limited operating history",
    ("age_penalty", "positive"): "Age penalty is low — business has matured past early risk",
    ("age_penalty", "negative"): "Business is very early stage — limited operating history",
    ("industry_risk_factor", "positive"): "Industry carries moderate to low inherent risk",
    ("industry_risk_factor", "negative"): "Industry carries elevated inherent risk",
    ("bureau_score_cibil", "positive"): "Legacy bureau score supports creditworthiness",
    ("bureau_score_cibil", "negative"): "Legacy bureau score below acceptable threshold",
}

DATA_CONFIDENCE_REASONS = {
    "low": "Insufficient data history — score confidence is low",
    "medium": "Moderate data history — score confidence is acceptable",
    "high": "Strong data history — score confidence is high",
}

def _get_reason(feature_name: str, shap_value: float) -> str:
    direction = "positive" if shap_value < 0 else "negative"
    key = (feature_name, direction)
    return REASON_TEMPLATES.get(key, f"{feature_name} {'supports' if direction == 'positive' else 'reduces'} creditworthiness (SHAP: {shap_value:.4f})")

def explain(feature_vector_df: pd.DataFrame, model) -> dict:
    try:
        if shap is None:
            return {
                "base_value": 0.0,
                "shap_values": [],
                "feature_names": [],
                "top_5_reasons": ["SHAP library not available — explanations disabled"],
            }

        if model is None:
            return {
                "base_value": 0.0,
                "shap_values": [],
                "feature_names": [],
                "top_5_reasons": ["Model not loaded — explanations unavailable"],
            }

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(feature_vector_df)

        if isinstance(shap_values, list):
            sv = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        else:
            sv = shap_values

        if sv.ndim > 1:
            sv = sv[0]

        sv = sv.astype(float).tolist()

        if hasattr(explainer.expected_value, '__len__'):
            base_val = float(explainer.expected_value[1]) if len(explainer.expected_value) > 1 else float(explainer.expected_value[0])
        else:
            base_val = float(explainer.expected_value)

        feature_names = list(feature_vector_df.columns)

        abs_shap = [(abs(s), i, s) for i, s in enumerate(sv)]
        abs_shap.sort(reverse=True)
        top_5 = abs_shap[:5]

        top_5_reasons = []
        for _, feat_idx, shap_val in top_5:
            feat_name = feature_names[feat_idx]
            reason = _get_reason(feat_name, shap_val)
            top_5_reasons.append(reason)

        return {
            "base_value": round(base_val, 6),
            "shap_values": [round(s, 6) for s in sv],
            "feature_names": feature_names,
            "top_5_reasons": top_5_reasons,
        }

    except Exception as e:
        return {
            "base_value": 0.0,
            "shap_values": [],
            "feature_names": [],
            "top_5_reasons": [f"SHAP explanation error: {str(e)}"],
        }
