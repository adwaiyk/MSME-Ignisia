"""
shap_serializer.py
Owner: ML & Risk Architect
Purpose: SHAP explanation module using deterministic NLP.
"""

import numpy as np
import pandas as pd
from nlp_reason_engine import generate_reason

try:
    import shap
except ImportError:
    shap = None

def explain(feature_vector_df: pd.DataFrame, model) -> dict:
    try:
        if shap is None or model is None:
            return {
                "base_value": 0.0,
                "shap_values": [],
                "feature_names": [],
                "top_5_reasons": ["Insufficient model explainability confidence"],
            }

        if hasattr(model, 'calibrated_classifiers_'):
            model = model.calibrated_classifiers_[0].estimator
        elif hasattr(model, 'estimator'):
            model = model.estimator
            
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
        seen_reasons = set()
        for _, feat_idx, shap_val in top_5:
            feat_name = feature_names[feat_idx]
            feat_val = float(feature_vector_df.iloc[0, feat_idx]) if len(feature_vector_df) > 0 else 0.0
            reason = generate_reason(feat_name, shap_val, feat_val)
            if reason and reason not in seen_reasons:
                # Remove duplicate phrases (simple case-insensitive check for whole string)
                if not any(reason.lower() in existing.lower() for existing in top_5_reasons):
                    top_5_reasons.append(reason)
                    seen_reasons.add(reason)

        if not top_5_reasons:
            top_5_reasons = ["Insufficient model explainability confidence"]

        return {
            "base_value": round(base_val, 6),
            "shap_values": [round(s, 6) for s in sv],
            "feature_names": feature_names,
            "top_5_reasons": top_5_reasons,
        }

    except Exception:
        return {
            "base_value": 0.0,
            "shap_values": [],
            "feature_names": [],
            "top_5_reasons": ["Insufficient model explainability confidence"],
        }
